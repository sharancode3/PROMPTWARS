export const CAMPUS_TIMEZONE = 'Asia/Kolkata';

export const ROLES = ['student', 'faculty', 'admin'] as const;
export type Role = typeof ROLES[number];

export const RESOURCE_CATEGORIES = [
  'instrumentation',
  'compute',
  'embedded',
  'fabrication',
  'bio-chem',
  'xr-media',
  'networking'
] as const;
export type ResourceCategory = typeof RESOURCE_CATEGORIES[number];

export const CAPABILITY_TAGS = [
  'signal-measurement',
  'oscilloscope-high-speed',
  'spectrum-analysis',
  'logic-analyzer',
  'rf-microwave',
  'gpu-compute',
  'cuda-training',
  'llm-inference',
  'edge-ai',
  'fpga-synthesis',
  'pcb-soldering',
  'iot-prototyping',
  'microcontroller-arm',
  'power-analysis',
  '3d-printing-fdm',
  '3d-printing-sla',
  'cnc-milling',
  'laser-cutting',
  'spectroscopy',
  'chromatography-hplc',
  'centrifugation',
  'thermal-imaging',
  'vr-hmd-testing',
  'motion-capture',
  'audio-spatial-recording',
  'sdr-software-radio',
  'network-packet-sniffing',
  'battery-cycling-test'
] as const;
export type CapabilityTag = typeof CAPABILITY_TAGS[number];

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'in-progress',
  'completed',
  'cancelled',
  'no-show'
] as const;
export type BookingStatus = typeof BOOKING_STATUSES[number];

export const REQUEST_STATUSES = [
  'draft',
  'submitted',
  'under-review',
  'changes-requested',
  'approved',
  'rejected',
  'partially-allocated',
  'waitlisted',
  'cancelled'
] as const;
export type RequestStatus = typeof REQUEST_STATUSES[number];

export const PROJECT_TYPES = [
  'capstone',
  'research',
  'coursework',
  'personal'
] as const;
export type ProjectType = typeof PROJECT_TYPES[number];

export const ALLOCATION_STRATEGIES = [
  'exact-slot',
  'nearest-slot',
  'equivalent-resource',
  'split-sessions',
  'waitlist'
] as const;
export type AllocationStrategy = typeof ALLOCATION_STRATEGIES[number];

// Transparent Demo Policy Weights & Thresholds (App Policy - Not Organizer Policy)
export const FAIRNESS_POLICY = {
  WEIGHTS: {
    URGENCY: 0.50,
    FAIR_SHARE: 0.30,
    WAIT_AGE: 0.20
  },
  THRESHOLDS: {
    MAX_DEADLINE_DAYS: 30,
    MAX_SCARCE_HOURS: 12,
    MAX_WAIT_HOURS: 72
  }
} as const;

export const DEFAULT_OPERATING_HOURS = {
  open: '08:00',
  close: '20:00'
} as const;

export const DEMO_SCENARIO_VERSION = '1.0.0';
