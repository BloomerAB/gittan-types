import { z } from "zod"

export const GatedConfigSchema = z.array(z.string()).default(["main"])

export const DependencySchema = z.object({
  repo: z.string().min(1),
  team: z.string().optional(),
  cascade: z.boolean().default(true),
  contractTest: z.boolean().default(true),
})

export type TDependency = z.infer<typeof DependencySchema>

export const GittanYamlSchema = z.object({
  steps: z.array(z.union([
    z.object({
      name: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
      image: z.string().min(1).optional(),
      use: z.string().min(1).optional(),
      with: z.record(z.string()).optional(),
      run: z.string().optional(),
      needs: z.array(z.string()).optional(),
      only: z.string().optional(),
      cache: z.array(z.string()).optional(),
      artifacts: z.array(z.string()).optional(),
      secrets: z.array(z.string()).optional(),
      timeout: z.string().default("10m"),
      services: z.array(z.union([
        z.string(),
        z.object({
          image: z.string().min(1),
          env: z.record(z.string()).optional(),
        }),
      ])).optional(),
    }),
    z.object({
      name: z.literal("review"),
      require: z.number().int().min(1).default(1),
      from: z.enum(["writers", "admins"]).default("writers"),
      autoAssign: z.enum(["blame", "round-robin", "none"]).default("blame"),
      needs: z.array(z.string()).optional(),
      skipFor: z.array(z.string()).optional(),
    }),
  ])).default([]),

  gated: GatedConfigSchema.optional(),

  depends: z.array(DependencySchema).optional(),

  notify: z.object({
    onFailure: z.array(z.object({
      channel: z.enum(["team-slack", "author", "webhook"]),
      target: z.string().optional(),
      template: z.enum(["compact", "detailed"]).default("compact"),
    })).optional(),
    onReviewNeeded: z.array(z.object({
      channel: z.enum(["team-slack", "author", "webhook"]),
      target: z.string().optional(),
      template: z.enum(["compact", "detailed"]).default("compact"),
    })).optional(),
  }).optional(),
})

export type TGittanYaml = z.infer<typeof GittanYamlSchema>
