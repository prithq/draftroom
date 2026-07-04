import { auth } from "@draftroom/auth";
import { prisma } from "@draftroom/db";
import { NextResponse,NextRequest } from "next/server";
import { headers } from "next/headers";
import { runCode } from "@/lib/judge0";

export async function POST(request:NextRequest){
    const session=await auth.api.getSession({
        headers:await headers()
    })


    if(!session)
        return NextResponse.json({error:"unauthorized"},{status:401})

    const {code,language,roomId}=await request.json()

    if(!code || !language || !roomId){
        return NextResponse.json({
            error:"code,language or romId is not present"
        },{status:400})
    }

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            question: {
            include: {
                testCases: true 
            }
            }
        }
  })

    if(!room)
        return NextResponse.json({error:"room not found"},{status:404})

    if (!room.question) {
        return NextResponse.json({ error: "No question set for this room" }, { status: 400 })
     }

     const testCases = room.question.testCases

     const results=await Promise.all(
        testCases.map(async (testCase)=>{
            const stdin=JSON.stringify(testCase.input)

            try{


                const result=await runCode(stdin,code,language)

                const actualOutput=result.stdout?.trim()??""
                const expectedOutput=JSON.stringify(testCase.expected)

                const passed=(actualOutput===expectedOutput)

                return{

                    testCaseId: testCase.id,
                    isHidden: testCase.isHidden,
                    input: testCase.isHidden ? null : testCase.input,    // hide input for hidden cases
                    expected: testCase.isHidden ? null : testCase.expected, // hide expected for hidden cases
                    actual: passed ? actualOutput : (testCase.isHidden ? null : actualOutput), // hide wrong answer for hidden
                    passed,
                    status: result.status.description,
                    time: result.time,
                    stderr: result.stderr,
                    compile_output: result.compile_output,

                }

            }catch(error){

                return{
                    testCaseId:testCase.id,
                    isHidden:testCase.isHidden,
                        input: null,
                        expected: null,
                        actual: null,
                        passed: false,
                        status: "Error",
                        time: null,
                        stderr: String(error),
                        compile_output: null,
                }
            }
        })
     )

     const passed=results.filter(r=>r.passed).length

     const total=results.length
     const allPassed= passed===total

     return NextResponse.json({
        passed,total,allPassed,results,summary:`${passed}/${total} test cases passed`
     })

}