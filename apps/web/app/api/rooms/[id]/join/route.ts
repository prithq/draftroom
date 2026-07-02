import { auth } from "@draftroom/auth"
import { prisma } from "@draftroom/db"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(
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
        participant: true
    }
  })

  if(!room)
    return NextResponse.json({error:"room not found"},{status:404})

   if(!room.isActive) {
    return NextResponse.json({ error: "Room is no longer active" }, { status: 403 })
  }

    if (room.expiresAt && room.expiresAt < new Date()) {
    return NextResponse.json({ error: "Room has expired" }, { status: 403 })
  }

   if (room.ownerId === session.user.id) {
    return NextResponse.json({ 
      message: "You are the owner",
      role: "INTERVIEWER",
      room 
    })
  }

   const existing = room.participant.find(
    p => p.userId === session.user.id
  )

    if (existing) {
    return NextResponse.json({
      message: "Already joined",
      role: existing.role,
      room
    })
  }

    const participant = await prisma.participant.create({
    data: {
      roomId: room.id,
      userId: session.user.id,
      role: "CANDIDATE"
    }
  })

    return NextResponse.json({
    message: "Joined successfully",
    role: participant.role,
    room
  }, { status: 201 })
}