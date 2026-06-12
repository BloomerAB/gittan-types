import { describe, expect, it } from "vitest"

import { generateImageTag, ImageTagSchema } from "../src/index.js"

describe("ImageTagSchema", () => {
  it("accepts valid date-sha tag", () => {
    const result = ImageTagSchema.safeParse("20260612-143022-a1b2c3d")
    expect(result.success).toBe(true)
  })

  it("accepts tag with full sha", () => {
    const result = ImageTagSchema.safeParse(
      "20260612-143022-" + "a".repeat(40),
    )
    expect(result.success).toBe(true)
  })

  it("rejects latest", () => {
    const result = ImageTagSchema.safeParse("latest")
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain("latest")
  })

  it("rejects bare version tags", () => {
    const result = ImageTagSchema.safeParse("v1.2.3")
    expect(result.success).toBe(false)
  })

  it("rejects v1", () => {
    const result = ImageTagSchema.safeParse("v1")
    expect(result.success).toBe(false)
  })

  it("rejects empty string", () => {
    const result = ImageTagSchema.safeParse("")
    expect(result.success).toBe(false)
  })

  it("rejects tag with wrong date format", () => {
    const result = ImageTagSchema.safeParse("2026-06-12-143022-a1b2c3d")
    expect(result.success).toBe(false)
  })
})

describe("generateImageTag", () => {
  it("generates tag from sha and date", () => {
    const date = new Date("2026-06-12T14:30:22Z")
    const tag = generateImageTag("a1b2c3d4e5f6g7h8", date)
    expect(tag).toBe("20260612-143022-a1b2c3d")
  })

  it("pads single-digit months and days", () => {
    const date = new Date("2026-01-05T03:07:09Z")
    const tag = generateImageTag("abc1234", date)
    expect(tag).toBe("20260105-030709-abc1234")
  })

  it("uses first 7 chars of sha", () => {
    const tag = generateImageTag("abcdef1234567890", new Date("2026-06-12T10:00:00Z"))
    expect(tag).toMatch(/-abcdef1$/)
  })

  it("generated tag validates against schema", () => {
    const tag = generateImageTag("a1b2c3d", new Date("2026-06-12T14:30:22Z"))
    const result = ImageTagSchema.safeParse(tag)
    expect(result.success).toBe(true)
  })
})
