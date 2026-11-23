import { z } from 'zod';
import {
  DepartmentSchema,
  UserSchema,
  ResourceSchema,
  ProjectSchema,
  RequestItemSchema,
  AccessRequestSchema,
  ScoreBreakdownSchema,
  AlternativeSlotSchema,
  AllocationProposalSchema,
  BookingSchema,
  ApprovalDecisionSchema,
  NLSearchInterpretRequestSchema,
  NLSearchInterpretResponseSchema
} from './schemas.js';

export type Department = z.infer<typeof DepartmentSchema>;
export type User = z.infer<typeof UserSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type RequestItem = z.infer<typeof RequestItemSchema>;
export type AccessRequest = z.infer<typeof AccessRequestSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export type AlternativeSlot = z.infer<typeof AlternativeSlotSchema>;
export type AllocationProposal = z.infer<typeof AllocationProposalSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
export type NLSearchInterpretRequest = z.infer<typeof NLSearchInterpretRequestSchema>;
export type NLSearchInterpretResponse = z.infer<typeof NLSearchInterpretResponseSchema>;

export interface ConflictCluster {
  id: string;
  resourceId: string;
  resourceName: string;
  date: string;
  slot: string;
  contestedRequests: AccessRequest[];
  allocatedProposal?: AllocationProposal;
}
