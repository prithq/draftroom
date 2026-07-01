import {auth} from "@draftroom/auth"
import {prisma} from "@draftroom/db"
import { NextRequest,NextResponse } from "next/server"
import {headers} from "next/headers"
import slugify from "slugify"
export async function GET(){
    const session=await auth.api.getSession({
        headers:await headers()
    })

    if(!session)
        return NextResponse.json({
    error:"Unauthorized"},{status:401})

    const rooms=await prisma.room.findMany({
        where:{
            ownerId:session.user.id
        },
        orderBy:{createdAt:"desc"},
        include:{
            _count:{
                select:{
                    participant:true
                }
            }
        }


    })

    return NextResponse.json(rooms)
}

export async function POST(request:NextRequest){
    const session=await auth.api.getSession({
        headers:await headers()
    })


    if(!session)
        return NextResponse.json({
    error:"Unauthorized"},{status:401})

    const {name,language}=await request.json()
    if(!name|| language){
        return NextResponse.json({
            error:"name or language is not provided"
        },{status:400})
    }

    const baseSlug=slugify(name,{lower:true,strict:true})
    const suffix=Math.random().toString(36).slice(2,6)
    const slug=`${baseSlug}-${suffix}`

    const room=await prisma.room.create({
        data:{
            name,language,slug,ownerId:session.user.id
        }
    })



    return NextResponse.json(room,{status:201})


}