import { generateText, generateJson, MODELS } from "../lib/services/llm"

async function main() {
  console.log("Models:", MODELS)

  // Test 1: Sonnet (default) — used by AI visibility & content generation
  console.log("\n--- Test 1: Sonnet generateText ---")
  const sonnetResult = await generateText([
    { role: "user", content: "What is AI visibility in one sentence?" },
  ])
  console.log("Result:", sonnetResult)

  // Test 2: Haiku — used by summarization & keyword generation
  console.log("\n--- Test 2: Haiku generateText ---")
  const haikuResult = await generateText(
    [{ role: "user", content: "Summarize what SEO means in 20 words." }],
    { model: "haiku", temperature: 0.3 }
  )
  console.log("Result:", haikuResult)

  // Test 3: generateJson — used by AI visibility report
  console.log("\n--- Test 3: generateJson ---")
  const jsonResult = await generateJson<string[]>([
    { role: "user", content: 'Return a JSON array of 3 SEO keywords. Example: ["keyword1", "keyword2", "keyword3"]' },
  ])
  console.log("Result:", jsonResult)

  // Test 4: System message handling
  console.log("\n--- Test 4: System message extraction ---")
  const systemResult = await generateText([
    { role: "system", content: "You generate internal linking anchor phrases for SEO." },
    { role: "user", content: "Give me 2 anchor phrases for an article about WordPress SEO." },
  ], { model: "haiku", temperature: 0.3 })
  console.log("Result:", systemResult)

  console.log("\nAll tests passed!")
}

main().catch((err) => {
  console.error("Test failed:", err.message)
  process.exit(1)
})
