import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { NextRequest,NextResponse } from "next/server";
import { headers } from "next/headers";


export async function GET(
    request:NextRequest,
    {params}:{params:Promise<{id:string}>}
){

const session=await auth.api.getSession({
    headers:await headers()
})

if(!session)
    return NextResponse.json({error:"unauthorized"},{status:401})

const {id}=await params

const room=await prisma.room.findUnique({
    where:{id},
    include:{
        participant:{
            include:{user:true}
        },
        question:true
    }

})

if(!room)
    return NextResponse.json({error:"room not found"},{status:404})

  const isOwner = room.ownerId === session.user.id
  const isParticipant = room.participant.some(p => p.userId === session.user.id)

    if (!isOwner && !isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    }

    return NextResponse.json(room)

}

export async function DELETE(
    request:NextRequest,
    {params}:{params:Promise<{id:string}>}
){

const session = await auth.api.getSession({
    headers: await headers()
  })


 if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const room = await prisma.room.findUnique({
    where: { id }
  })

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  if (room.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.room.delete({ where: { id } })

  return NextResponse.json({ success: true })

}

