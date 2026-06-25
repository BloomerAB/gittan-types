import { z } from "zod"

export const PlanTypeSchema = z.enum(["personal", "starter", "team"])

export type TPlanType = z.infer<typeof PlanTypeSchema>

export const OrgPlanSchema = z.object({
  orgId: z.string().min(1),
  plan: PlanTypeSchema,
  ciMinutesLimit: z.number().int().min(0),
  spendingCapEur: z.number().int().min(0).default(0),
  storageLimitGb: z.number().int().min(0),
  aiEnabled: z.boolean(),
  receiptEmail: z.string().email().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type TOrgPlan = z.infer<typeof OrgPlanSchema>

export const PLAN_LIMITS = {
  personal: {
    ciMinutesLimit: 50,
    storageLimitGb: 1,
    aiEnabled: false,
  },
  starter: {
    ciMinutesLimit: 2_000,
    storageLimitGb: 20,
    aiEnabled: true,
  },
  team: {
    ciMinutesLimit: 10_000,
    storageLimitGb: 100,
    aiEnabled: true,
  },
} as const

export const BLOCK_PRICE_EUR = 129 as const

export const BLOCK_ADDITIONS = {
  ciMinutes: 10_000,
  storageGb: 10,
} as const

export const spendingCapToBlocks = (capEur: number): number =>
  Math.floor(capEur / BLOCK_PRICE_EUR)

export type TPlanLimits = typeof PLAN_LIMITS[TPlanType]

export const UsageEventSchema = z.object({
  orgId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  eventId: z.string().min(1),
  type: z.enum(["pipeline_run"]),
  pipelineRunId: z.string().min(1),
  teamId: z.string().min(1),
  repoId: z.string().min(1),
  durationMs: z.number().int().min(0),
  ciMinutes: z.number().int().min(0),
  createdAt: z.string().datetime(),
})

export type TUsageEvent = z.infer<typeof UsageEventSchema>

export const OrgUsageSchema = z.object({
  orgId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  ciMinutesUsed: z.number().int().min(0),
  ciMinutesLimit: z.number().int().min(0),
  storageBytes: z.number().int().min(0),
  updatedAt: z.string().datetime(),
})

export type TOrgUsage = z.infer<typeof OrgUsageSchema>
