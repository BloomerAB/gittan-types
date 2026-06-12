import { describe, expect, it } from "vitest"

import {
  PipelineRunSchema,
  PushEventSchema,
  StepResultSchema,
} from "../src/index.js"

describe("PushEventSchema", () => {
  const validPush = {
    id: "push-1",
    orgId: "org-1",
    teamId: "team-1",
    repoId: "repo-1",
    repoName: "gittan-core",
    branch: "main",
    commits: [
      {
        sha: "a".repeat(40),
        message: "feat: add pipeline resolver",
        author: "malin",
        timestamp: "2026-06-12T14:30:00Z",
      },
    ],
    pusher: "malin",
    timestamp: "2026-06-12T14:30:00Z",
  }

  it("accepts valid push event", () => {
    const result = PushEventSchema.safeParse(validPush)
    expect(result.success).toBe(true)
  })

  it("accepts push with multiple commits", () => {
    const result = PushEventSchema.safeParse({
      ...validPush,
      commits: [
        {
          sha: "a".repeat(40),
          message: "feat: first commit",
          author: "malin",
          timestamp: "2026-06-12T14:29:00Z",
        },
        {
          sha: "b".repeat(40),
          message: "fix: second commit",
          author: "malin",
          timestamp: "2026-06-12T14:30:00Z",
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("rejects push with no commits", () => {
    const result = PushEventSchema.safeParse({
      ...validPush,
      commits: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects commit with invalid sha length", () => {
    const result = PushEventSchema.safeParse({
      ...validPush,
      commits: [
        {
          sha: "abc123",
          message: "short sha",
          author: "malin",
          timestamp: "2026-06-12T14:30:00Z",
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe("StepResultSchema", () => {
  it("accepts pending step result", () => {
    const result = StepResultSchema.safeParse({
      stepName: "test",
      status: "pending",
      source: "repo",
    })
    expect(result.success).toBe(true)
  })

  it("accepts completed step result with timing", () => {
    const result = StepResultSchema.safeParse({
      stepName: "test",
      status: "passed",
      startedAt: "2026-06-12T14:30:00Z",
      finishedAt: "2026-06-12T14:30:45Z",
      durationMs: 45000,
      exitCode: 0,
      source: "policy",
    })
    expect(result.success).toBe(true)
  })

  it("accepts failed step with error", () => {
    const result = StepResultSchema.safeParse({
      stepName: "test",
      status: "failed",
      startedAt: "2026-06-12T14:30:00Z",
      finishedAt: "2026-06-12T14:30:10Z",
      durationMs: 10000,
      exitCode: 1,
      error: "src/auth/validate.test.ts:42 — expected 401, got 500",
      source: "repo",
    })
    expect(result.success).toBe(true)
  })

  it("tracks step source correctly", () => {
    for (const source of ["repo", "policy", "template"] as const) {
      const result = StepResultSchema.safeParse({
        stepName: "scan",
        status: "passed",
        source,
      })
      expect(result.success).toBe(true)
    }
  })

  it("rejects invalid status", () => {
    const result = StepResultSchema.safeParse({
      stepName: "test",
      status: "exploded",
      source: "repo",
    })
    expect(result.success).toBe(false)
  })
})

describe("PipelineRunSchema", () => {
  it("accepts valid pipeline run", () => {
    const result = PipelineRunSchema.safeParse({
      id: "run-1",
      pushEventId: "push-1",
      orgId: "org-1",
      teamId: "team-1",
      repoId: "repo-1",
      branch: "main",
      status: "passed",
      steps: [
        { stepName: "audit", status: "passed", source: "policy" },
        { stepName: "test", status: "passed", source: "repo" },
        { stepName: "trivy", status: "passed", source: "policy" },
      ],
      startedAt: "2026-06-12T14:30:00Z",
      finishedAt: "2026-06-12T14:31:00Z",
      resolvedFrom: {
        policies: ["security-baseline"],
        template: "node-api",
        repoConfig: true,
      },
    })
    expect(result.success).toBe(true)
  })

  it("tracks which policies and template contributed", () => {
    const run = PipelineRunSchema.parse({
      id: "run-1",
      pushEventId: "push-1",
      orgId: "org-1",
      teamId: "team-1",
      repoId: "repo-1",
      branch: "main",
      status: "passed",
      steps: [{ stepName: "test", status: "passed", source: "repo" }],
      startedAt: "2026-06-12T14:30:00Z",
      resolvedFrom: {
        policies: ["security-baseline", "docker-baseline"],
        repoConfig: true,
      },
    })
    expect(run.resolvedFrom.policies).toEqual([
      "security-baseline",
      "docker-baseline",
    ])
    expect(run.resolvedFrom.template).toBeUndefined()
    expect(run.resolvedFrom.repoConfig).toBe(true)
  })
})
