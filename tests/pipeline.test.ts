import { describe, expect, it } from "vitest"

import {
  PipelineConfigSchema,
  PipelineStepSchema,
  ReviewStepSchema,
} from "../src/index.js"

describe("PipelineStepSchema", () => {
  it("accepts step with image and run", () => {
    const result = PipelineStepSchema.safeParse({
      name: "test",
      image: "node:22-slim",
      run: "npm test",
    })
    expect(result.success).toBe(true)
  })

  it("accepts step with use (reusable step reference)", () => {
    const result = PipelineStepSchema.safeParse({
      name: "test",
      use: "node/test",
      with: { "node-version": "22" },
    })
    expect(result.success).toBe(true)
  })

  it("accepts step with dependencies", () => {
    const result = PipelineStepSchema.safeParse({
      name: "build",
      image: "node:22-slim",
      run: "npm run build",
      needs: ["test", "lint"],
    })
    expect(result.success).toBe(true)
  })

  it("accepts step with services", () => {
    const result = PipelineStepSchema.safeParse({
      name: "integration",
      image: "node:22-slim",
      run: "npm run test:integration",
      services: [
        "scylladb:latest",
        { image: "nats:latest", env: { NATS_PORT: "4222" } },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("accepts step with cache and artifacts", () => {
    const result = PipelineStepSchema.safeParse({
      name: "build",
      image: "node:22-slim",
      run: "npm run build",
      cache: ["node_modules", ".npm"],
      artifacts: ["dist/"],
    })
    expect(result.success).toBe(true)
  })

  it("accepts step with secrets", () => {
    const result = PipelineStepSchema.safeParse({
      name: "deploy",
      image: "gittan/deploy:1",
      run: "./deploy.sh",
      secrets: ["DEPLOY_TOKEN"],
    })
    expect(result.success).toBe(true)
  })

  it("rejects step name with uppercase", () => {
    const result = PipelineStepSchema.safeParse({
      name: "MyTest",
      image: "node:22-slim",
      run: "npm test",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty step name", () => {
    const result = PipelineStepSchema.safeParse({
      name: "",
      image: "node:22-slim",
    })
    expect(result.success).toBe(false)
  })

  it("sets default timeout", () => {
    const result = PipelineStepSchema.parse({
      name: "test",
      image: "node:22-slim",
      run: "npm test",
    })
    expect(result.timeout).toBe("10m")
  })
})

describe("ReviewStepSchema", () => {
  it("accepts valid review step", () => {
    const result = ReviewStepSchema.safeParse({
      name: "review",
      require: 1,
    })
    expect(result.success).toBe(true)
  })

  it("accepts review with skip patterns", () => {
    const result = ReviewStepSchema.safeParse({
      name: "review",
      require: 2,
      from: "admins",
      skipFor: ["hotfix/*", "deps/*"],
      needs: ["test", "lint"],
    })
    expect(result.success).toBe(true)
  })

  it("rejects review with name other than review", () => {
    const result = ReviewStepSchema.safeParse({
      name: "approval",
      require: 1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects review with zero required approvals", () => {
    const result = ReviewStepSchema.safeParse({
      name: "review",
      require: 0,
    })
    expect(result.success).toBe(false)
  })

  it("sets defaults for from and autoAssign", () => {
    const result = ReviewStepSchema.parse({
      name: "review",
      require: 1,
    })
    expect(result.from).toBe("writers")
    expect(result.autoAssign).toBe("blame")
  })
})

describe("PipelineConfigSchema", () => {
  it("accepts full pipeline config", () => {
    const result = PipelineConfigSchema.safeParse({
      steps: [
        { name: "test", image: "node:22-slim", run: "npm test" },
        { name: "review", require: 1 },
        {
          name: "deploy",
          image: "gittan/deploy:1",
          run: "./deploy.sh",
          needs: ["test", "review"],
          only: "main",
        },
      ],
      notify: {
        onFailure: [
          { channel: "team-slack", template: "compact" },
          { channel: "author" },
        ],
        onReviewNeeded: [{ channel: "team-slack" }],
      },
    })
    expect(result.success).toBe(true)
  })

  it("rejects pipeline with no steps", () => {
    const result = PipelineConfigSchema.safeParse({
      steps: [],
    })
    expect(result.success).toBe(false)
  })

  it("accepts pipeline without notify config", () => {
    const result = PipelineConfigSchema.safeParse({
      steps: [{ name: "test", image: "node:22-slim", run: "npm test" }],
    })
    expect(result.success).toBe(true)
  })
})
