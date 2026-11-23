import { z } from 'zod';
import {
  ROLES,
  RESOURCE_CATEGORIES,
  CAPABILITY_TAGS,
  BOOKING_STATUSES,
  REQUEST_STATUSES,
  PROJECT_TYPES,
  ALLOCATION_STRATEGIES
} from './constants.js';

export const RoleSchema = z.enum(ROLES);
export const ResourceCategorySchema = z.enum(RESOURCE_CATEGORIES);
export const CapabilityTagSchema = z.enum(CAPABILITY_TAGS);
export const BookingStatusSchema = z.enum(BOOKING_STATUSES);
export const RequestStatusSchema = z.enum(REQUEST_STATUSES);
export const ProjectTypeSchema = z.enum(PROJECT_TYPES);
export const AllocationStrategySchema = z.enum(ALLOCATION_STRATEGIES);

export const DepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  building: z.string(),
  contactEmail: z.string().email()
});

export const LabSchema = z.object({
  id: z.string(),
  departmentId: z.string(),
  name: z.string(),
  roomNumber: z.string(),
  operatingHours: z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  coordinatorName: z.string()
});

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  validityDays: z.number().default(365)
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  departmentId: z.string(),
  departmentName: z.string(),
  priorUsageHours: z.number().min(0).default(0),
  certifications: z.array(z.string()).default([])
});

export const DemoUserSchema = UserSchema;

export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  departmentId: z.string(),
  category: ResourceCategorySchema,
  capabilityTags: z.array(CapabilityTagSchema),
  equivalenceGroupId: z.string().optional(),
  location: z.string(),
  description: z.string(),
  requiresCertification: z.array(z.string()).default([]),
  maxSessionMinutes: z.number().default(120),
  bufferMinutes: z.number().default(15),
  operatingHours: z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  status: z.enum(['available', 'in-use', 'maintenance']).default('available'),
  specs: z.record(z.string())
});

export const ProjectSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  advisorId: z.string().optional(),
  title: z.string().min(3),
  description: z.string(),
  type: ProjectTypeSchema,
  deadline: z.string().datetime(),
  createdAt: z.string().datetime()
});

export const RequestItemSchema = z.object({
  resourceId: z.string().optional(),
  capabilityNeed: CapabilityTagSchema.optional(),
  minutes: z.number().min(30).max(480)
});

export const AccessRequestSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  advisorId: z.string().optional(),
  title: z.string(),
  justification: z.string(),
  items: z.array(RequestItemSchema).min(1),
  requestedSlot: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  deadline: z.string().datetime(),
  flexibility: z.number().min(0).max(1).default(0.5),
  status: RequestStatusSchema.default('submitted'),
  submittedAt: z.string().datetime()
});

export const ProjectRequestSchema = AccessRequestSchema;
export const ConflictRequestSchema = AccessRequestSchema;

export const ScoreBreakdownSchema = z.object({
  urgency: z.number().min(0).max(100),
  scarceResourceAccess: z.number().min(0).max(100),
  waitingTime: z.number().min(0).max(100),
  requirementFit: z.number().min(0).max(100),
  total: z.number().min(0).max(100)
});

export const PriorityBreakdownSchema = ScoreBreakdownSchema;

export const AlternativeSlotSchema = z.object({
  slotId: z.string(),
  resourceId: z.string(),
  resourceName: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  feasibilityScore: z.number().min(0).max(100),
  reason: z.string()
});

export const AllocationProposalSchema = z.object({
  requestId: z.string(),
  studentName: z.string(),
  projectTitle: z.string(),
  strategy: AllocationStrategySchema,
  assignments: z.array(
    z.object({
      resourceId: z.string(),
      resourceName: z.string(),
      start: z.string(),
      end: z.string()
    })
  ),
  score: z.number().min(0).max(100),
  breakdown: ScoreBreakdownSchema,
  alternatives: z.array(AlternativeSlotSchema),
  explanation: z.string(),
  aiAssisted: z.boolean().default(false)
});

export const BookingSchema = z.object({
  id: z.string(),
  resourceId: z.string(),
  requestId: z.string().optional(),
  studentId: z.string(),
  studentName: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  status: BookingStatusSchema.default('confirmed'),
  checkedInAt: z.string().datetime().optional()
});

export const ApprovalDecisionSchema = z.object({
  requestId: z.string(),
  decision: z.enum(['approve', 'reject', 'request-changes']),
  reason: z.string().min(2),
  suggestedSlot: z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string()
  }).optional().nullable()
});

export const NLSearchInterpretRequestSchema = z.object({
  prompt: z.string().min(2).max(1000)
});

export const NLSearchInterpretResponseSchema = z.object({
  success: z.boolean(),
  source: z.enum(['gemini_flash', 'heuristic_fallback']),
  extractedCapabilities: z.array(CapabilityTagSchema),
  suggestedDepartment: z.string().optional(),
  reasoning: z.string()
});

export const DemoScenarioSchema = z.object({
  version: z.string(),
  currentUser: UserSchema,
  departments: z.array(DepartmentSchema),
  resources: z.array(ResourceSchema),
  requests: z.array(AccessRequestSchema),
  bookings: z.array(BookingSchema),
  lastResetAt: z.string().datetime()
});
