// apps/web/app/api/questions/route.ts
import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const pattern = searchParams.get("pattern");
    const search = searchParams.get("search");

    const whereObj: {
      isPublished: boolean;
      difficulty?: "EASY" | "MEDIUM" | "HARD";
      pattern?: string;
      title?: { contains: string; mode: "insensitive" };
    } = {
      isPublished: true
    };

    if (difficulty && ["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      whereObj.difficulty = difficulty as "EASY" | "MEDIUM" | "HARD";
    }

    if (pattern) {
      whereObj.pattern = pattern;
    }

    if (search) {
      whereObj.title = {
        contains: search,
        mode: "insensitive"
      };
    }

    const questions = await prisma.question.findMany({
      where: whereObj,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        pattern: true,
        tags: true,
        _count: {
          select: {
            testCases: true
          }
        }
      },
      orderBy: [
        {
          difficulty: "asc"
        },
        {
          title: "asc"
        }
      ]
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}