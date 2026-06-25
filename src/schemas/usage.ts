import { z } from "zod"

export const PlanTypeSchema = z.enum(["personal", "starter", "team"])

export type TPlanType = z.infer<typeof PlanTypeSchema>

export const OrgPlanSchema = z.object({
  orgId: z.string().min(1),
  plan: PlanTypeSchema,
  ciMinutesLimit: z.number().int().min(0),
  ciBlocks: z.number().int().min(0).default(0),
  storageLimitGb: z.number().int().min(0),
  userLimit: z.number().int().min(0),
  teamLimit: z.number().int().min(0),
  repoLimit: z.number().int().min(0),
  receiptEmail: z.string().email().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type TOrgPlan = z.infer<typeof OrgPlanSchema>

export const PLAN_LIMITS = {
  personal: {
    ciMinutesLimit: 50,
    storageLimitGb: 5,
    userLimit: 1,
    teamLimit: 1,
    repoLimit: 5,
  },
  starter: {
    ciMinutesLimit: 2_000,
    storageLimitGb: 20,
    userLimit: 5,
    teamLimit: 3,
    repoLimit: 20,
  },
  team: {
    ciMinutesLimit: 10_000,
    storageLimitGb: 100,
    userLimit: 0,
    teamLimit: 0,
    repoLimit: 0,
  },
} as const

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
  userCount: z.number().int().min(0),
  teamCount: z.number().int().min(0),
  repoCount: z.number().int().min(0),
  updatedAt: z.string().datetime(),
})

export type TOrgUsage = z.infer<typeof OrgUsageSchema>
