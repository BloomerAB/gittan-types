import { describe, expect, it } from "vitest"

import { DependencySchema, GittanYamlSchema } from "../src/index.js"

describe("GittanYamlSchema", () => {
  it("accepts minimal config with just steps", () => {
    const result = GittanYamlSchema.safeParse({
      steps: [
        { name: "test", image: "node:22-slim", run: "npm test" },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("accepts empty config", () => {
    const result = GittanYamlSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.steps).toEqual([])
    }
  })

  it("accepts full config with all options", () => {
    const result = GittanYamlSchema.safeParse({
      steps: [
        { name: "lint", image: "node:22-slim", run: "npm run lint" },
        { name: "test", image: "node:22-slim", run: "npm test", needs: ["lint"] },
        { name: "review", require: 1 },
        {
          name: "deploy",
          image: "gittan/deploy:1",
          run: "./deploy.sh",
          needs: ["test", "review"],
          only: "main",
          secrets: ["DEPLOY_TOKEN"],
        },
      ],
      gated: ["main", "release/*"],
      depends: [
        { repo: "types", cascade: true, contractTest: true },
        { repo: "shared-utils", team: "platform" },
      ],
      notify: {
        onFailure: [
          { channel: "team-slack", template: "compact" },
          { channel: "author" },
        ],
      },
    })
    expect(result.success).toBe(true)
  })

  it("accepts steps with services", () => {
    const result = GittanYamlSchema.safeParse({
      steps: [
        {
          name: "integration",
          image: "node:22-slim",
          run: "npm run test:integration",
          services: [
            "scylladb:latest",
            { image: "nats:2.11-alpine", env: { NATS_PORT: "4222" } },
          ],
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("accepts steps with cache and artifacts", () => {
    const result = GittanYamlSchema.safeParse({
      steps: [
        {
          name: "build",
          image: "node:22-slim",
          run: "npm run build",
          cache: ["node_modules", ".npm"],
          artifacts: ["dist/"],
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("defaults gated to main", () => {
    const result = GittanYamlSchema.parse({
      steps: [{ name: "test", image: "node:22", run: "npm test" }],
    })
    expect(result.gated).toBeUndefined()
  })

  it("rejects step with invalid name", () => {
    const result = GittanYamlSchema.safeParse({
      steps: [{ name: "INVALID", image: "node:22", run: "echo" }],
    })
    expect(result.success).toBe(false)
  })
})

describe("DependencySchema", () => {
  it("accepts minimal dependency", () => {
    const result = DependencySchema.safeParse({
      repo: "types",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cascade).toBe(true)
      expect(result.data.contractTest).toBe(true)
    }
  })

  it("accepts dependency with team scope", () => {
    const result = DependencySchema.safeParse({
      repo: "shared-utils",
      team: "platform",
    })
    expect(result.success).toBe(true)
  })

  it("accepts dependency with disabled cascade", () => {
    const result = DependencySchema.safeParse({
      repo: "docs",
      cascade: false,
      contractTest: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cascade).toBe(false)
      expect(result.data.contractTest).toBe(false)
    }
  })

  it("rejects empty repo name", () => {
    const result = DependencySchema.safeParse({
      repo: "",
    })
    expect(result.success).toBe(false)
  })
})
