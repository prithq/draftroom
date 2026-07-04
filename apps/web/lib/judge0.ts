// language IDs from Judge0
// full list at https://ce.judge0.com/languages
export const LANGUAGE_IDS: Record<string, number> = {
  javascript: 93,  // Node.js 18
  python: 71,      // Python 3.8
  typescript: 94,  // TypeScript 5
  java: 62,        // Java 11
  cpp: 54,         // C++ 17
}

interface SubmissionResult {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  status: {
    id: number
    description: string
  }
  time: string | null
  memory: number | null
}

// sleep helper — wait between polls
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// submit code to Judge0 and wait for result
export async function runCode(
  code: string,
  language: string,
  stdin: string = ""
): Promise<SubmissionResult> {
  const languageId = LANGUAGE_IDS[language]

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`)
  }

  // step 1 — submit the code
  // base64 encode to handle special characters safely
  const submitRes = await fetch(
    `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.JUDGE0_API_KEY!,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: JSON.stringify({
        source_code: btoa(code),       // base64 encode code
        language_id: languageId,
        stdin: btoa(stdin),            // base64 encode stdin
      })
    }
  )

  const { token } = await submitRes.json()

  if (!token) {
    throw new Error("Failed to submit code to Judge0")
  }

  // step 2 — poll until result is ready
  // Judge0 processes async — we keep asking until status is not "In Queue" or "Processing"
  let result: SubmissionResult
  let attempts = 0
  const maxAttempts = 10  // max 10 polls = ~5 seconds

  while (attempts < maxAttempts) {
    await sleep(500)  // wait 500ms between each poll

    const pollRes = await fetch(
      `${process.env.JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY!,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        }
      }
    )

    result = await pollRes.json()

    // status id 1 = In Queue, 2 = Processing
    // anything else means it's done (accepted, error, TLE etc)
    if (result.status.id !== 1 && result.status.id !== 2) {
      break
    }

    attempts++
  }

  // decode base64 output back to readable string
  return {
    ...result!,
    stdout: result!.stdout ? atob(result!.stdout) : null,
    stderr: result!.stderr ? atob(result!.stderr) : null,
    compile_output: result!.compile_output ? atob(result!.compile_output) : null,
  }
}