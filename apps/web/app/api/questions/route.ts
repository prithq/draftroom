import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { NextRequest,NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
    const session=auth.api.getSession({
        headers:await headers()
    })


    if(!session){
        return NextResponse.json({error:"unauthorized"},{status:401})
    }

    const {searchParams} =new URL(request.url)
    const difficulty=searchParams.get("difficulty")
    const pattern=searchParams.get("pattern")
    const search=searchParams.get("search")


   const whereObj:any={
    isPublished:true
   }

   if(difficulty){
    whereObj.difficulty=difficulty
   }

   if(pattern){
    whereObj.pattern=pattern
   }

   if(search){
    whereObj.title={
        contains:search,
        mode:"insensitive"
    }
   }


   const question=await prisma.question.findMany({
    where:whereObj,

    select:{
        id:true,
        title:true,
        slug:true,
        difficulty:true,
        pattern:true,
        tags:true,

        _count:{
            select:{
                testCases:true
            }
        }
    },



   orderBy:[
    {
        difficulty:"asc"
    },{
        title:"asc"
    }
   ]
   })

   return NextResponse.json(question)
}