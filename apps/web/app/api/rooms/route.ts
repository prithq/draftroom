// apps/web/app/api/rooms/route.ts
import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import slugify from "slugify";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📡 Fetching rooms for user:", session.user.id);

    const rooms = await prisma.room.findMany({
      where: {
        ownerId: session.user.id
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            participant: true
          }
        },
        question: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          }
        }
      }
    });

   
    return NextResponse.json(rooms);
  } catch (error) {
   
    // Log the full error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { 
        error: "Failed to fetch rooms",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, language, roomType } = await request.json();
    
    if (!name || !language || !roomType) {
      return NextResponse.json({
        error: "name, language, and roomType are required"
      }, { status: 400 });
    }

    const baseSlug = slugify(name, { lower: true, strict: true });
    const suffix = Math.random().toString(36).slice(2, 6);
    const slug = `${baseSlug}-${suffix}`;

    if (roomType !== "INTERVIEW" && roomType !== "SOLO") {
      return NextResponse.json(
        { error: "roomType must be INTERVIEW or SOLO" },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        language,
        slug,
        ownerId: session.user.id,
        roomType
      }
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}