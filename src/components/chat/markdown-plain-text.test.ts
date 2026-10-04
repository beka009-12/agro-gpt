import { describe, expect, test } from "bun:test"
import { markdownToPlainText } from "./markdown-plain-text"

describe("markdownToPlainText", () => {
  test("strips bold markers but keeps emoji and line breaks", () => {
    expect(markdownToPlainText("🔍 **Диагностика**\nЖёлтая ржавчина")).toBe(
      "🔍 Диагностика\nЖёлтая ржавчина"
    )
  })

  test("strips heading hashes", () => {
    expect(markdownToPlainText("## Итог\nТекст")).toBe("Итог\nТекст")
  })

  test("turns bullet markers into dots", () => {
    expect(markdownToPlainText("* один\n- два\n  * вложенный")).toBe(
      "• один\n• два\n  • вложенный"
    )
  })

  test("keeps numbered lists", () => {
    expect(markdownToPlainText("1. **Фунгицид.** Опрыскать утром")).toBe(
      "1. Фунгицид. Опрыскать утром"
    )
  })

  test("strips italic and inline code", () => {
    expect(markdownToPlainText("*важно*: норма `0.5 л/га`")).toBe(
      "важно: норма 0.5 л/га"
    )
  })

  test("keeps link targets readable", () => {
    expect(markdownToPlainText("См. [инструкцию](https://example.com/a)")).toBe(
      "См. инструкцию (https://example.com/a)"
    )
  })

  test("leaves arithmetic asterisks alone", () => {
    expect(markdownToPlainText("2 * 3 = 6")).toBe("2 * 3 = 6")
  })
})
