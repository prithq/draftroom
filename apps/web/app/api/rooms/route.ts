// apps/web/app/api/rooms/[id]/route.ts
import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(
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
    
    // Try to find by ID first, then by slug
    let room = await prisma.room.findUnique({
      where: { id },
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        },
        question: {
          include: {
            testCases: {
              where: {
                isHidden: false
              },
              select: {
                id: true,
                input: true,
                expected: true,
                isHidden: true,
                weight: true,
              }
            }
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        _count: {
          select: {
            participant: true
          }
        }
      }
    });

    // If not found by ID, try by slug
    if (!room) {
      room = await prisma.room.findUnique({
        where: { slug: id },
        include: {
          participant: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                }
              }
            }
          },
          question: {
            include: {
              testCases: {
                where: {
                  isHidden: false
                },
                select: {
                  id: true,
                  input: true,
                  expected: true,
                  isHidden: true,
                  weight: true,
                }
              }
            }
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          _count: {
            select: {
              participant: true
            }
          }
        }
      });
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is owner or participant
    const isOwner = room.ownerId === session.user.id;
    const isParticipant = room.participant.some(p => p.userId === session.user.id);

    if (!isOwner && !isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Try to find by ID first, then by slug
    let room = await prisma.room.findUnique({
      where: { id }
    });

    if (!room) {
      room = await prisma.room.findUnique({
        where: { slug: id }
      });
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.room.delete({ where: { id: room.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}