import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { headers } from "next/headers";
import { NextRequest,NextResponse } from "next/server";

export async function GET(
    request:NextRequest,
    {params}:{params:Promise<{id:string}>}
) {

    const session=await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        return NextResponse.json({error:"unauthorized"},{status:401})
    }

    const {id}=await params

    const view=request.nextUrl.searchParams.get("view")

    const question=await prisma.question.findUnique({
        where:{id},
        include:{
            testCases:{
                where:{

                    ...(view==="candidate"&&{
                        isHidden:false
                    })
                },
                select:{
                    id:true,
                    input:true,
                    expected:true,
                    isHidden:true,
                    weight:true
                }
            }
        }
    })

    if(!question){
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }












    return NextResponse.json(question)
}
