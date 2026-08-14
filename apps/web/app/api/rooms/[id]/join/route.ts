// apps/web/app/api/rooms/[id]/join/route.ts
import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log(`🔍 Attempting to join room with ID/slug: ${id}`);

    // First try to find by ID
    let room = await prisma.room.findUnique({
      where: { id },
      include: {
        participant: true
      }
    });

    // If not found by ID, try by slug
    if (!room) {
      console.log(`🔍 Not found by ID, trying by slug: ${id}`);
      room = await prisma.room.findUnique({
        where: { slug: id },
        include: {
          participant: true
        }
      });
    }

    if (!room) {
      console.log(`❌ Room not found for ID/slug: ${id}`);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    console.log(`✅ Room found: ${room.name} (${room.id})`);

    // Check if room is active
    if (!room.isActive) {
      return NextResponse.json({ error: "Room is no longer active" }, { status: 403 });
    }

    // Check if room has expired
    if (room.expiresAt && room.expiresAt < new Date()) {
      return NextResponse.json({ error: "Room has expired" }, { status: 403 });
    }

    // If the user is the owner, return as interviewer
    if (room.ownerId === session.user.id) {
      return NextResponse.json({
        message: "You are the owner",
        role: "INTERVIEWER",
        room
      });
    }

    // Check if user is already a participant
    const existing = room.participant.find(
      p => p.userId === session.user.id
    );

    if (existing) {
      return NextResponse.json({
        message: "Already joined",
        role: existing.role,
        room
      });
    }

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
        role: "CANDIDATE"
      }
    });

    console.log(`✅ User ${session.user.name} joined room ${room.name}`);

    return NextResponse.json({
      message: "Joined successfully",
      role: participant.role,
      room
    }, { status: 201 });

  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}