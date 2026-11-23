import { z } from 'zod';
import {
  DepartmentSchema,
  LabSchema,
  LearningMaterialSchema,
  CertificationSchema,
  UserSchema,
  DemoUserSchema,
  ResourceSchema,
  ProjectSchema,
  RequestItemSchema,
  AccessRequestSchema,
  ProjectRequestSchema,
  ConflictRequestSchema,
  ScoreBreakdownSchema,
  PriorityBreakdownSchema,
  AlternativeSlotSchema,
  AllocationProposalSchema,
  SessionFeedbackSchema,
  BookingSchema,
  ApprovalDecisionSchema,
  NLSearchInterpretRequestSchema,
  NLSearchInterpretResponseSchema,
  DemoScenarioSchema
} from './schemas.js';

export type Department = z.infer<typeof DepartmentSchema>;
export type Lab = z.infer<typeof LabSchema>;
export type LearningMaterial = z.infer<typeof LearningMaterialSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type User = z.infer<typeof UserSchema>;
export type DemoUser = z.infer<typeof DemoUserSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type RequestItem = z.infer<typeof RequestItemSchema>;
export type AccessRequest = z.infer<typeof AccessRequestSchema>;
export type ProjectRequest = z.infer<typeof ProjectRequestSchema>;
export type ConflictRequest = z.infer<typeof ConflictRequestSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export type PriorityBreakdown = z.infer<typeof PriorityBreakdownSchema>;
export type AlternativeSlot = z.infer<typeof AlternativeSlotSchema>;
export type AllocationProposal = z.infer<typeof AllocationProposalSchema>;
export type SessionFeedback = z.infer<typeof SessionFeedbackSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
export type NLSearchInterpretRequest = z.infer<typeof NLSearchInterpretRequestSchema>;
export type NLSearchInterpretResponse = z.infer<typeof NLSearchInterpretResponseSchema>;
export type DemoScenario = z.infer<typeof DemoScenarioSchema>;

export interface ConflictCluster {
  id: string;
  resourceId: string;
  resourceName: string;
  date: string;
  slot: string;
  contestedRequests: AccessRequest[];
  allocatedProposal?: AllocationProposal;
}
