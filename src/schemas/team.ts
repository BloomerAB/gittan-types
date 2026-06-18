import { z } from "zod"

export const OrgRoleSchema = z.enum(["org-admin"])

export const TeamRoleSchema = z.enum(["team-admin", "writer", "reader"])

export const RoleSchema = z.union([OrgRoleSchema, TeamRoleSchema])

export type TRole = z.infer<typeof RoleSchema>

export const TeamMemberSchema = z.object({
  userId: z.string().min(1),
  teamId: z.string().min(1),
  role: TeamRoleSchema,
  addedAt: z.string().datetime(),
  addedBy: z.string().min(1),
})

export type TTeamMember = z.infer<typeof TeamMemberSchema>

export const TopologySchema = z.enum([
  "stream-aligned",
  "platform",
  "enabling",
  "complicated-subsystem",
])

export type TTopology = z.infer<typeof TopologySchema>

export const TeamSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(1).max(128),
  topology: TopologySchema.default("stream-aligned"),
  slackChannel: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type TTeam = z.infer<typeof TeamSchema>

export const OrgSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(1).max(128),
  oidcIssuer: z.string().url().optional(),
  oidcClientId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type TOrg = z.infer<typeof OrgSchema>
