import { auth } from "@draftroom/auth"
import { prisma } from "@draftroom/db"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

// fetch the question currently attached to this room
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
  const view = request.nextUrl.searchParams.get("view")

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
  })

if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }


 if (!room.question) {
    return NextResponse.json({ question: null })
  }

return NextResponse.json({ question: room.question })

}

export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
    

const session = await auth.api.getSession({
 headers: await headers()
  })

  if(!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { questionId } = await request.json()

  const room=await prisma.room.findUnique({
    where:{id}
  })

  if(!room){
    return NextResponse.json({error:"Room not found"},{status:404})


  }

  if(room.ownerId!==session.user.id){
    return NextResponse.json({error:"Forbidden"},{status:403})
  }

  const updated=await prisma.room.update({
    where:{id},
    data:{questionId},
    include:{question:true}
  })

  return NextResponse.json({question:updated.question})

}
