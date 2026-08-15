// apps/web/app/api/rooms/[id]/question/route.ts
import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// GET - Fetch the question currently attached to this room
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
    const view = request.nextUrl.searchParams.get("view");

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        question: {
          include: {
            testCases: {
              where: {
                ...(view === "candidate" && { isHidden: false })
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
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ question: room.question });
  } catch (error) {
    console.error("Error fetching room question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

// PATCH - Update the question for a room (Interviewer only)
export async function PATCH(
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
    const { questionId } = await request.json();

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only the owner can change the question
    if (room.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: { questionId },
      include: { question: true }
    });

    return NextResponse.json({
      success: true,
      question: updatedRoom.question
    });
  } catch (error) {
    console.error("Error updating room question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}