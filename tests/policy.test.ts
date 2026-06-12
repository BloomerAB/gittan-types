import { describe, expect, it } from "vitest"

import { MatchRuleSchema, OrgPolicySchema } from "../src/index.js"

describe("MatchRuleSchema", () => {
  it("accepts match by files", () => {
    const result = MatchRuleSchema.safeParse({
      files: ["package.json", "tsconfig.json"],
    })
    expect(result.success).toBe(true)
  })

  it("accepts match by team", () => {
    const result = MatchRuleSchema.safeParse({
      team: "platform",
    })
    expect(result.success).toBe(true)
  })

  it("accepts match by repo name pattern", () => {
    const result = MatchRuleSchema.safeParse({
      name: "api-*",
    })
    expect(result.success).toBe(true)
  })

  it("accepts match by tags", () => {
    const result = MatchRuleSchema.safeParse({
      tags: ["production", "critical"],
    })
    expect(result.success).toBe(true)
  })

  it("accepts combined match criteria", () => {
    const result = MatchRuleSchema.safeParse({
      files: ["Dockerfile"],
      team: "platform",
      tags: ["production"],
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty match rule", () => {
    const result = MatchRuleSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe("OrgPolicySchema", () => {
  const validPolicy = {
    id: "policy-1",
    orgId: "org-1",
    name: "security-baseline",
    description: "Security scanning for all Node.js repos",
    match: { files: ["package.json"] },
    inject: {
      before: [
        { name: "audit", use: "platform/npm-audit" },
      ],
      after: [
        { name: "trivy", use: "platform/trivy" },
      ],
    },
    enabled: true,
    createdAt: "2026-06-12T10:00:00Z",
    updatedAt: "2026-06-12T10:00:00Z",
  }

  it("accepts valid org policy", () => {
    const result = OrgPolicySchema.safeParse(validPolicy)
    expect(result.success).toBe(true)
  })

  it("accepts policy with only before injection", () => {
    const result = OrgPolicySchema.safeParse({
      ...validPolicy,
      inject: {
        before: [{ name: "lint", use: "platform/lint" }],
      },
    })
    expect(result.success).toBe(true)
  })

  it("accepts policy with only after injection", () => {
    const result = OrgPolicySchema.safeParse({
      ...validPolicy,
      inject: {
        after: [{ name: "scan", use: "platform/trivy" }],
      },
    })
    expect(result.success).toBe(true)
  })

  it("accepts disabled policy", () => {
    const result = OrgPolicySchema.safeParse({
      ...validPolicy,
      enabled: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.enabled).toBe(false)
    }
  })

  it("rejects policy with invalid match rule", () => {
    const result = OrgPolicySchema.safeParse({
      ...validPolicy,
      match: {},
    })
    expect(result.success).toBe(false)
  })
})
