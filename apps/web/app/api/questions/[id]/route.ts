// apps/web/app/api/questions/[id]/route.ts
import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

    // Try to find by ID first, then by slug
    let question = await prisma.question.findUnique({
      where: { id },
      include: {
        testCases: {
          where: {
            ...(view === "candidate" && {
              isHidden: false
            })
          },
          select: {
            id: true,
            input: true,
            expected: true,
            isHidden: true,
            weight: true
          }
        }
      }
    });

    // If not found by ID, try by slug
    if (!question) {
      question = await prisma.question.findUnique({
        where: { slug: id },
        include: {
          testCases: {
            where: {
              ...(view === "candidate" && {
                isHidden: false
              })
            },
            select: {
              id: true,
              input: true,
              expected: true,
              isHidden: true,
              weight: true
            }
          }
        }
      });
    }

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // If view is candidate, hide hidden test cases completely
    if (view === "candidate") {
      return NextResponse.json({
        ...question,
        testCases: question.testCases.filter(tc => !tc.isHidden)
      });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}