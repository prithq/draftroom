import { PrismaClient, Difficulty } from "@prisma/client"

const prisma = new PrismaClient()

const questions = [
  {
    title: "Budget Pair",
    slug: "budget-pair",
    difficulty: Difficulty.EASY,
    pattern: "two-pointers",
    tags: ["array", "two-pointers"],
    isPublished: true,
    description: `
## Budget Pair

You are given a list of product prices **sorted in ascending order**, and a budget.

Find **two different products** whose prices add up to exactly the budget.
Return their **1-based positions** in the list. If no such pair exists, return an empty array.

**You may not use the same product twice.**

---

### Example 1
\`\`\`
Input:  prices = [5, 11, 15, 20, 35], budget = 26
Output: [2, 4]
\`\`\`

### Example 2
\`\`\`
Input:  prices = [3, 7, 9, 14], budget = 20
Output: []
\`\`\`

---

### Constraints
- 2 ≤ prices.length ≤ 10⁴
- 1 ≤ prices[i] ≤ 10⁵
- prices is sorted in ascending order
- There is at most one valid answer
    `,
    starterCode: {
      javascript: `/**
 * @param {number[]} prices
 * @param {number} budget
 * @return {number[]}
 */
function budgetPair(prices, budget) {
  // your code here
}`,
      python: `def budget_pair(prices: list[int], budget: int) -> list[int]:
    # your code here
    pass`,
      go: `func budgetPair(prices []int, budget int) []int {
    // your code here
}`,
    },
    testCases: [
      { input: { prices: [5, 11, 15, 20, 35], budget: 26 }, expected: [2, 4],  isHidden: false, weight: 1 },
      { input: { prices: [3, 7, 9, 14],        budget: 20 }, expected: [],      isHidden: false, weight: 1 },
      { input: { prices: [1, 2],               budget: 3  }, expected: [1, 2],  isHidden: true,  weight: 1 },
      { input: { prices: [1, 5, 10, 20, 50],   budget: 15 }, expected: [2, 3],  isHidden: true,  weight: 1 },
      { input: { prices: [2, 4, 6, 8, 10],     budget: 100}, expected: [],      isHidden: true,  weight: 1 },
      { input: { prices: [1, 99],              budget: 100}, expected: [1, 2],  isHidden: true,  weight: 2 },
    ],
  },
  {
    title: "Longest Calm Subarray",
    slug: "longest-calm-subarray",
    difficulty: Difficulty.MEDIUM,
    pattern: "sliding-window",
    tags: ["array", "sliding-window"],
    isPublished: true,
    description: `
## Longest Calm Subarray

A subarray is called **calm** if the difference between its maximum and minimum value is **at most k**.

Given an integer array \`readings\` and an integer \`k\`, return the **length of the longest calm subarray**.

---

### Example 1
\`\`\`
Input:  readings = [10, 12, 11, 14, 13], k = 3
Output: 4
Explanation: [12,11,14,13] → max=14, min=11, diff=3 ✓
\`\`\`

### Example 2
\`\`\`
Input:  readings = [1, 2, 3, 4, 5], k = 1
Output: 2
\`\`\`

---

### Constraints
- 1 ≤ readings.length ≤ 10⁵
- 0 ≤ readings[i] ≤ 10⁴
- 0 ≤ k ≤ 10⁴
    `,
    starterCode: {
      javascript: `/**
 * @param {number[]} readings
 * @param {number} k
 * @return {number}
 */
function longestCalmSubarray(readings, k) {
  // your code here
}`,
      python: `def longest_calm_subarray(readings: list[int], k: int) -> int:
    # your code here
    pass`,
      go: `func longestCalmSubarray(readings []int, k int) int {
    // your code here
}`,
    },
    testCases: [
      { input: { readings: [10,12,11,14,13], k: 3  }, expected: 4, isHidden: false, weight: 1 },
      { input: { readings: [1,2,3,4,5],      k: 1  }, expected: 2, isHidden: false, weight: 1 },
      { input: { readings: [5],              k: 0  }, expected: 1, isHidden: true,  weight: 1 },
      { input: { readings: [1,1,1,1],        k: 0  }, expected: 4, isHidden: true,  weight: 1 },
      { input: { readings: [1,100,1,100],    k: 0  }, expected: 1, isHidden: true,  weight: 1 },
      { input: { readings: [1,2,3,4,5],      k: 10 }, expected: 5, isHidden: true,  weight: 2 },
    ],
  },
  {
    title: "Island Count",
    slug: "island-count",
    difficulty: Difficulty.MEDIUM,
    pattern: "graph-dfs",
    tags: ["graph", "dfs", "matrix"],
    isPublished: true,
    description: `
## Island Count

You are given a 2D grid of \`'L'\` (land) and \`'W'\` (water).

An **island** is a group of land cells connected **horizontally or vertically**.

Return the **number of islands** in the grid.

---

### Example 1
\`\`\`
Input:
grid = [
  ["L","L","W","W"],
  ["L","W","W","L"],
  ["W","W","L","L"]
]
Output: 3
\`\`\`

### Example 2
\`\`\`
Input:  grid = [["W","W"],["W","W"]]
Output: 0
\`\`\`

---

### Constraints
- 1 ≤ grid.length, grid[i].length ≤ 300
- grid[i][j] is either 'L' or 'W'
    `,
    starterCode: {
      javascript: `/**
 * @param {string[][]} grid
 * @return {number}
 */
function islandCount(grid) {
  // your code here
}`,
      python: `def island_count(grid: list[list[str]]) -> int:
    # your code here
    pass`,
      go: `func islandCount(grid [][]string) int {
    // your code here
}`,
    },
    testCases: [
      { input: { grid: [["L","L","W"],["L","W","W"],["W","W","L"]] }, expected: 2, isHidden: false, weight: 1 },
      { input: { grid: [["W","W"],["W","W"]] },                        expected: 0, isHidden: false, weight: 1 },
      { input: { grid: [["L"]] },                                       expected: 1, isHidden: true,  weight: 1 },
      { input: { grid: [["L","L","L"],["L","L","L"]] },                 expected: 1, isHidden: true,  weight: 1 },
      { input: { grid: [["L","W","L"],["W","L","W"],["L","W","L"]] },   expected: 5, isHidden: true,  weight: 2 },
    ],
  },
]

async function main() {
  console.log("🌱 Seeding questions...")

  for (const q of questions) {
    // upsert — safe to run multiple times without duplicating data
    const question = await prisma.question.upsert({
      where: { slug: q.slug },
      update: {},
      create: {
        title:       q.title,
        slug:        q.slug,
        description: q.description,
        difficulty:  q.difficulty,
        pattern:     q.pattern,
        tags:        q.tags,
        starterCode: q.starterCode,
        isPublished: q.isPublished,
        testCases: {
          create: q.testCases,
        },
      },
    })

    console.log(`  ✓ ${question.title}`)
  }

  console.log("✅ Done!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })