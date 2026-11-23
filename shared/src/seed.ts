import { DemoScenario, Department, Resource, User, AccessRequest, Booking } from './types.js';
import { DEMO_SCENARIO_VERSION } from './constants.js';

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

export function createSeedScenario(baseDate: Date = new Date()): DemoScenario {
  const today = new Date(baseDate);
  const todayStr = formatDate(today);
  const day1Str = formatDate(addDays(today, 1));
  const day2Str = formatDate(addDays(today, 2));
  const day3Str = formatDate(addDays(today, 3));
  const day7Str = formatDate(addDays(today, 7));
  const day18Str = formatDate(addDays(today, 18));

  const departments: Department[] = [
    {
      id: 'dept_cse',
      name: 'Computer Science & Engineering',
      code: 'CSE',
      building: 'Turing Hall, 3rd Floor',
      contactEmail: 'cse-labs@campus.edu'
    },
    {
      id: 'dept_ece',
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      building: 'Maxwell Complex, 2nd Floor',
      contactEmail: 'ece-labs@campus.edu'
    },
    {
      id: 'dept_mech',
      name: 'Mechanical & Mechatronics Engineering',
      code: 'MECH',
      building: 'Tesla Workshops, Ground Floor',
      contactEmail: 'mech-labs@campus.edu'
    }
  ];

  const resources: Resource[] = [
    {
      id: 'res_jetson_orin_01',
      name: 'NVIDIA Jetson AGX Orin 64GB Dev Kit',
      departmentId: 'dept_mech',
      category: 'compute',
      capabilityTags: ['edge-ai', 'gpu-compute', 'cuda-training', 'iot-prototyping'],
      equivalenceGroupId: 'group_edge_ai',
      location: 'Tesla Workshops - Autonomous Systems Lab 102',
      description: '275 TOPS edge AI platform designed for autonomous robotics, real-time vision, and UAV path planning.',
      requiresCertification: ['SAFETY_MECH_L1'],
      maxSessionMinutes: 180,
      bufferMinutes: 15,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { TOPS: '275', RAM: '64GB Unified', Arch: 'Ampere 2048-core', Power: '15W-60W' }
    },
    {
      id: 'res_rtx4090_rig_01',
      name: 'NVIDIA RTX 4090 Deep Learning Rig',
      departmentId: 'dept_cse',
      category: 'compute',
      capabilityTags: ['gpu-compute', 'cuda-training', 'llm-inference'],
      equivalenceGroupId: 'group_gpu_cluster',
      location: 'Turing Hall - Machine Learning Lab 308',
      description: 'Dedicated GPU workstation with 24GB VRAM and liquid cooling for deep learning model fine-tuning.',
      requiresCertification: [],
      maxSessionMinutes: 240,
      bufferMinutes: 15,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { VRAM: '24GB GDDR6X', Cores: '16384 CUDA', HostRAM: '128GB DDR5' }
    },
    {
      id: 'res_keysight_la_01',
      name: 'Keysight 16-Channel 500MHz Logic Analyzer',
      departmentId: 'dept_ece',
      category: 'instrumentation',
      capabilityTags: ['logic-analyzer', 'signal-measurement', 'fpga-synthesis'],
      equivalenceGroupId: 'group_timing_analyzer',
      location: 'Maxwell Complex - Digital Systems Lab 204',
      description: 'High-speed timing and state analyzer for sub-nanosecond FPGA clock skew and protocol verification.',
      requiresCertification: ['ESD_SAFETY_L1'],
      maxSessionMinutes: 120,
      bufferMinutes: 15,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { Channels: '16 Digital', SampleRate: '2.5 GSa/s', Bandwidth: '500 MHz' }
    },
    {
      id: 'res_tektronix_scope_01',
      name: 'Tektronix 4-Channel 1GHz Digital Oscilloscope',
      departmentId: 'dept_ece',
      category: 'instrumentation',
      capabilityTags: ['oscilloscope-high-speed', 'signal-measurement', 'power-analysis'],
      location: 'Maxwell Complex - RF & Microwave Lab 202',
      description: 'Precision digital phosphor oscilloscope with serial bus decode and jitter analysis capabilities.',
      requiresCertification: ['ESD_SAFETY_L1'],
      maxSessionMinutes: 120,
      bufferMinutes: 15,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { Bandwidth: '1 GHz', Channels: '4 Analog', SampleRate: '5 GSa/s' }
    },
    {
      id: 'res_zynq_fpga_01',
      name: 'Xilinx Zynq UltraScale+ MPSoC Dev Board',
      departmentId: 'dept_ece',
      category: 'embedded',
      capabilityTags: ['fpga-synthesis', 'microcontroller-arm', 'edge-ai'],
      location: 'Maxwell Complex - Embedded Systems Lab 206',
      description: 'Heterogeneous ARM Cortex-A53 quad-core with programmable logic for custom accelerator synthesis.',
      requiresCertification: ['ESD_SAFETY_L1'],
      maxSessionMinutes: 180,
      bufferMinutes: 15,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { FPGA_Logic: '256K System Logic Cells', CPU: 'Quad ARM A53', RAM: '4GB DDR4' }
    },
    {
      id: 'res_formlabs_3d_01',
      name: 'Formlabs Form 4 SLA 3D Resin Printer',
      departmentId: 'dept_mech',
      category: 'fabrication',
      capabilityTags: ['3d-printing-sla', 'laser-cutting'],
      location: 'Tesla Workshops - Prototyping Bay 105',
      description: 'Industrial stereolithography 3D printer for ultra-precise mechanical tolerances and smooth enclosures.',
      requiresCertification: ['RESIN_SAFETY_L2'],
      maxSessionMinutes: 240,
      bufferMinutes: 30,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { Technology: 'Low Force Stereolithography', XY_Res: '25 microns', BuildVol: '145x145x175 mm' }
    },
    {
      id: 'res_haas_cnc_01',
      name: 'Haas Mini Mill 3-Axis CNC Machining Center',
      departmentId: 'dept_mech',
      category: 'fabrication',
      capabilityTags: ['cnc-milling'],
      location: 'Tesla Workshops - Heavy Machine Bay 101',
      description: 'High-rigidity compact vertical machining center for precision aluminum and steel bracket milling.',
      requiresCertification: ['CNC_OPERATOR_CERT'],
      maxSessionMinutes: 180,
      bufferMinutes: 30,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { Spindle: '6000 RPM', Travel: '406 x 305 x 254 mm', Power: '7.5 HP' }
    },
    {
      id: 'res_rs_spectrum_01',
      name: 'Rohde & Schwarz 3GHz Spectrum Analyzer',
      departmentId: 'dept_ece',
      category: 'instrumentation',
      capabilityTags: ['spectrum-analysis', 'rf-microwave', 'sdr-software-radio'],
      location: 'Maxwell Complex - RF & Microwave Lab 202',
      description: 'High-sensitivity spectral analysis for wireless transmission testing and antenna harmonics measurement.',
      requiresCertification: ['ESD_SAFETY_L1'],
      maxSessionMinutes: 120,
      bufferMinutes: 15,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { FreqRange: '9 kHz to 3 GHz', DANL: '-161 dBm', RBW: '10 Hz to 3 MHz' }
    },
    {
      id: 'res_flir_thermal_01',
      name: 'FLIR T540 High-Speed Thermal Imaging Camera',
      departmentId: 'dept_mech',
      category: 'instrumentation',
      capabilityTags: ['thermal-imaging', 'battery-cycling-test'],
      location: 'Tesla Workshops - Thermal Dynamics Lab 108',
      description: 'Non-contact temperature measurement up to 1500°C with 464x348 true native infrared resolution.',
      requiresCertification: [],
      maxSessionMinutes: 90,
      bufferMinutes: 15,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { IR_Res: '464 x 348', ThermalSens: '<0.03°C at 30°C', Accuracy: '±2%' }
    },
    {
      id: 'res_rpi_cluster_01',
      name: 'Raspberry Pi 5 & Jetson Nano Edge Cluster',
      departmentId: 'dept_cse',
      category: 'embedded',
      capabilityTags: ['iot-prototyping', 'edge-ai', 'network-packet-sniffing'],
      location: 'Turing Hall - Distributed Systems Lab 304',
      description: '8-node clustered SBC testbed for distributed sensor data ingestion and lightweight container orchestration.',
      requiresCertification: [],
      maxSessionMinutes: 180,
      bufferMinutes: 15,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { Nodes: '8x RPi5 8GB', Network: 'Gigabit PoE Switch', Storage: '1TB NVMe' }
    }
  ];

  const students: User[] = [
    {
      id: 'user_alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      role: 'student',
      departmentId: 'dept_mech',
      departmentName: 'Mechanical & Mechatronics',
      priorUsageHours: 4,
      certifications: ['SAFETY_MECH_L1', 'ESD_SAFETY_L1']
    },
    {
      id: 'user_jordan',
      name: 'Jordan Lee',
      email: 'jordan.lee@campus.edu',
      role: 'student',
      departmentId: 'dept_cse',
      departmentName: 'Computer Science & Engineering',
      priorUsageHours: 14,
      certifications: ['SAFETY_MECH_L1']
    },
    {
      id: 'user_priya',
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      role: 'student',
      departmentId: 'dept_ece',
      departmentName: 'Electronics & Communication',
      priorUsageHours: 6,
      certifications: ['ESD_SAFETY_L1', 'SAFETY_MECH_L1']
    },
    {
      id: 'user_marcus',
      name: 'Marcus Chen',
      email: 'marcus.chen@campus.edu',
      role: 'student',
      departmentId: 'dept_ece',
      departmentName: 'Electronics & Communication',
      priorUsageHours: 2,
      certifications: ['ESD_SAFETY_L1']
    }
  ];

  const facultyUser: User = {
    id: 'user_radhika',
    name: 'Dr. Radhika Iyer',
    email: 'radhika.iyer@campus.edu',
    role: 'faculty',
    departmentId: 'dept_ece',
    departmentName: 'Electronics & Communication',
    priorUsageHours: 0,
    certifications: ['SAFETY_MECH_L1', 'ESD_SAFETY_L1', 'RESIN_SAFETY_L2', 'CNC_OPERATOR_CERT']
  };

  // Seed Contested Requests on Jetson Orin on day2Str (14:00 - 16:00)
  const requests: AccessRequest[] = [
    {
      id: 'req_alex_capstone',
      projectId: 'proj_drone_capstone',
      studentId: 'user_alex',
      studentName: 'Alex Rivera',
      advisorId: 'user_radhika',
      title: 'Autonomous Drone Obstacle Avoidance (Capstone Final)',
      justification: 'Final testbench for real-time YOLOv8 inference on drone-mounted Jetson Orin before senior project defense.',
      items: [
        {
          resourceId: 'res_jetson_orin_01',
          capabilityNeed: 'edge-ai',
          minutes: 120
        }
      ],
      requestedSlot: {
        date: day2Str,
        startTime: '14:00',
        endTime: '16:00'
      },
      deadline: `${day3Str}T17:00:00.000Z`,
      flexibility: 0.2,
      status: 'submitted',
      submittedAt: `${todayStr}T09:15:00.000Z`
    },
    {
      id: 'req_jordan_coursework',
      projectId: 'proj_intro_robotics',
      studentId: 'user_jordan',
      studentName: 'Jordan Lee',
      advisorId: 'user_radhika',
      title: 'Introductory Robotics Lab Exercise 4',
      justification: 'Coursework practice on ROS2 node communication and OpenCV edge filtering.',
      items: [
        {
          resourceId: 'res_jetson_orin_01',
          capabilityNeed: 'edge-ai',
          minutes: 120
        }
      ],
      requestedSlot: {
        date: day2Str,
        startTime: '14:00',
        endTime: '16:00'
      },
      deadline: `${day18Str}T23:59:00.000Z`,
      flexibility: 0.8,
      status: 'submitted',
      submittedAt: `${todayStr}T11:30:00.000Z`
    },
    {
      id: 'req_priya_thesis',
      projectId: 'proj_thermal_vision',
      studentId: 'user_priya',
      studentName: 'Priya Patel',
      advisorId: 'user_radhika',
      title: 'Multi-Modal Thermal & Optical Fusion Model',
      justification: 'Benchmark camera frame synchronization on hardware testbed.',
      items: [
        {
          resourceId: 'res_flir_thermal_01',
          capabilityNeed: 'thermal-imaging',
          minutes: 90
        }
      ],
      requestedSlot: {
        date: day1Str,
        startTime: '10:00',
        endTime: '11:30'
      },
      deadline: `${day7Str}T18:00:00.000Z`,
      flexibility: 0.5,
      status: 'submitted',
      submittedAt: `${todayStr}T08:00:00.000Z`
    }
  ];

  // Pre-existing confirmed bookings
  const bookings: Booking[] = [
    {
      id: 'book_marcus_scope',
      resourceId: 'res_keysight_la_01',
      studentId: 'user_marcus',
      studentName: 'Marcus Chen',
      date: day1Str,
      startTime: '14:00',
      endTime: '16:00',
      status: 'confirmed'
    }
  ];

  return {
    version: DEMO_SCENARIO_VERSION,
    currentUser: students[0], // Default: Alex Rivera (Student)
    departments,
    resources,
    requests,
    bookings,
    lastResetAt: new Date().toISOString()
  };
}
