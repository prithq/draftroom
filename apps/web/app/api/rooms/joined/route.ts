// apps/web/app/api/rooms/joined/route.ts
import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rooms = await prisma.room.findMany({
    where: {
      participant: {
        some: {
          userId: session.user.id
        }
      },
      ownerId: {
        not: session.user.id // Exclude rooms the user owns
      }
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      participant: true,
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(rooms);
}