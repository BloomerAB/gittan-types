import { describe, expect, it } from "vitest"

import { OrgSchema, TeamMemberSchema, TeamSchema } from "../src/index.js"

describe("TeamSchema", () => {
  const validTeam = {
    id: "team-1",
    orgId: "org-1",
    name: "platform",
    displayName: "Platform Team",
    createdAt: "2026-06-12T10:00:00Z",
    updatedAt: "2026-06-12T10:00:00Z",
  }

  it("accepts a valid team", () => {
    const result = TeamSchema.safeParse(validTeam)
    expect(result.success).toBe(true)
  })

  it("accepts team with optional slack channel", () => {
    const result = TeamSchema.safeParse({
      ...validTeam,
      slackChannel: "#platform-alerts",
    })
    expect(result.success).toBe(true)
  })

  it("rejects team name with uppercase", () => {
    const result = TeamSchema.safeParse({
      ...validTeam,
      name: "Platform",
    })
    expect(result.success).toBe(false)
  })

  it("rejects team name with spaces", () => {
    const result = TeamSchema.safeParse({
      ...validTeam,
      name: "my team",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty team name", () => {
    const result = TeamSchema.safeParse({
      ...validTeam,
      name: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing required fields", () => {
    const result = TeamSchema.safeParse({ id: "team-1" })
    expect(result.success).toBe(false)
  })
})

describe("TeamMemberSchema", () => {
  const validMember = {
    userId: "user-1",
    teamId: "team-1",
    role: "writer",
    addedAt: "2026-06-12T10:00:00Z",
    addedBy: "admin-1",
  }

  it("accepts valid team member", () => {
    const result = TeamMemberSchema.safeParse(validMember)
    expect(result.success).toBe(true)
  })

  it("accepts all valid roles", () => {
    for (const role of ["team-admin", "writer", "reader"]) {
      const result = TeamMemberSchema.safeParse({ ...validMember, role })
      expect(result.success).toBe(true)
    }
  })

  it("rejects org-admin as team role", () => {
    const result = TeamMemberSchema.safeParse({
      ...validMember,
      role: "org-admin",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid role", () => {
    const result = TeamMemberSchema.safeParse({
      ...validMember,
      role: "superuser",
    })
    expect(result.success).toBe(false)
  })
})

describe("OrgSchema", () => {
  const validOrg = {
    id: "org-1",
    name: "bloomer",
    displayName: "Bloomer AB",
    createdAt: "2026-06-12T10:00:00Z",
    updatedAt: "2026-06-12T10:00:00Z",
  }

  it("accepts valid org", () => {
    const result = OrgSchema.safeParse(validOrg)
    expect(result.success).toBe(true)
  })

  it("accepts org with OIDC config", () => {
    const result = OrgSchema.safeParse({
      ...validOrg,
      oidcIssuer: "https://login.microsoftonline.com/tenant-id/v2.0",
      oidcClientId: "client-123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid OIDC issuer URL", () => {
    const result = OrgSchema.safeParse({
      ...validOrg,
      oidcIssuer: "not-a-url",
    })
    expect(result.success).toBe(false)
  })
})
