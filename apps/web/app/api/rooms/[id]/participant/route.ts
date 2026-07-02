import { auth } from "@draftroom/auth"
import { prisma } from "@draftroom/db"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

// GET /api/rooms/:id/participants
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const room = await prisma.room.findUnique({
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
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      }
    }
  })

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  // only people in the room can see participants
  const isOwner = room.ownerId === session.user.id
  const isParticipant = room.participant.some(p => p.userId === session.user.id)

  if (!isOwner && !isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // shape the response — combine owner + participants into one list
  // frontend just needs a flat list of who's in the room with their roles
  const everyone = [
    {
      userId: room.owner.id,
      name: room.owner.name,
      email: room.owner.email,
      image: room.owner.image,
      role: "INTERVIEWER"
    },
    ...room.participant.map(p => ({
      userId: p.user.id,
      name: p.user.name,
      email: p.user.email,
      image: p.user.image,
      role: p.role
    }))
  ]

  return NextResponse.json(everyone)
}