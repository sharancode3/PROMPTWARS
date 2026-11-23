import { DemoScenario, Department, Lab, LearningMaterial, Resource, User, AccessRequest, Booking, Project } from './types.js';
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
    },
    {
      id: 'dept_bio',
      name: 'Bio-Engineering & Analytical Chemistry',
      code: 'BIO',
      building: 'Pasteur Hall, 2nd Floor',
      contactEmail: 'bio-labs@campus.edu'
    }
  ];

  const labs: Lab[] = [
    {
      id: 'lab_mech_auto',
      departmentId: 'dept_mech',
      name: 'Autonomous Systems & Robotics Lab',
      roomNumber: 'Tesla Workshops 102',
      operatingHours: { open: '08:00', close: '20:00' },
      coordinatorName: 'Prof. K. Raman',
      description: 'Embedded robotics testbeds, UAV benches, and NVIDIA Jetson dev kits.',
      safetyRules: [
        'Safety goggles mandatory near spinning rotors or mechanical drives',
        'LiPo battery charging strictly restricted to certified fireproof stations'
      ]
    },
    {
      id: 'lab_bio_chem',
      departmentId: 'dept_bio',
      name: 'Bio-Molecular Spectroscopy & Analytical Lab',
      roomNumber: 'Pasteur Hall 201',
      operatingHours: { open: '08:00', close: '20:00' },
      coordinatorName: 'Dr. Elena Rostova',
      description: 'UV-Vis double-beam spectrophotometers, biochip microfluidics, and HPLC analytical benches.',
      safetyRules: [
        'Nitrile gloves, lab coat, and chemical safety goggles mandatory at all wet benches',
        'Emergency eye wash station must remain unobstructed; dispose organic solvents in labeled EHS containers'
      ]
    },
    {
      id: 'lab_cse_ml',
      departmentId: 'dept_cse',
      name: 'Machine Learning & HPC Cluster Lab',
      roomNumber: 'Turing Hall 308',
      operatingHours: { open: '08:00', close: '20:00' },
      coordinatorName: 'Dr. Aris Thorne',
      description: 'Multi-GPU deep learning training workstations, distributed AI clusters, and LLM inference testbeds.',
      safetyRules: [
        'Do not reboot active compute nodes without lab admin clearance',
        'Verify thermal limits and GPU fan speed curves before starting >4h training jobs'
      ]
    },
    {
      id: 'lab_ece_digital',
      departmentId: 'dept_ece',
      name: 'Digital Systems & VLSI Testing Lab',
      roomNumber: 'Maxwell Complex 204',
      operatingHours: { open: '08:00', close: '20:00' },
      coordinatorName: 'Prof. Radhika Sen',
      description: 'FPGA emulation stations, sub-nanosecond logic analyzers, and high-speed digital bus verification benches.',
      safetyRules: [
        'Always wear grounded ESD wrist straps prior to handling bare semiconductor boards',
        'Calibrate oscilloscope ground clips before connecting to power distribution networks'
      ]
    },
    {
      id: 'lab_mech_proto',
      departmentId: 'dept_mech',
      name: 'Rapid Prototyping & Additive Manufacturing Workshop',
      roomNumber: 'Tesla Workshops 105',
      operatingHours: { open: '08:00', close: '20:00' },
      coordinatorName: 'Prof. K. Raman',
      description: 'Industrial stereolithography (SLA) resin printers, fused deposition modeling (FDM), and laser cutting systems.',
      safetyRules: [
        'Nitrile gloves and vapor respirator required when dispensing uncured photopolymer resin',
        'IPA wash tank exhaust must remain switched on during post-curing cycles'
      ]
    },
    {
      id: 'lab_ece_rf',
      departmentId: 'dept_ece',
      name: 'RF & Microwave Wireless Communications Lab',
      roomNumber: 'Maxwell Complex 202',
      operatingHours: { open: '08:00', close: '20:00' },
      coordinatorName: 'Dr. Sandeep Nair',
      description: 'Precision GHz spectrum analyzers, gigasample oscilloscopes, and software-defined radio test facilities.',
      safetyRules: [
        'Maximum input RF power level on spectrum analyzer ports is strictly +20 dBm (100 mW)',
        'Ensure 50-ohm termination dummy loads on high-power transmitter outputs'
      ]
    }
  ];

  const materials: LearningMaterial[] = [
    {
      id: 'mat_jetson_sop',
      title: 'NVIDIA Jetson AGX Orin Edge Deployment SOP',
      type: 'sop-checklist',
      labId: 'lab_mech_auto',
      resourceId: 'res_jetson_orin_01',
      topic: 'Autonomous Robotics & Edge Inference',
      description: 'Standard operating checklist for flashing JetPack 6.0, TensorRT FP16 model compilation, and camera latency profiling.',
      source: 'Campus Autonomous Systems Lab / Prof. K. Raman',
      url: 'https://developer.nvidia.com/embedded/jetson-linux',
      verified: true,
      isDemo: true
    },
    {
      id: 'mat_clock_skew',
      title: 'Sub-Nanosecond Clock Skew & Signal Integrity Guide',
      type: 'lecture-notes',
      labId: 'lab_ece_digital',
      resourceId: 'res_keysight_la_01',
      topic: 'High-Speed Digital Instrumentation',
      description: 'Detailed technical guide covering setup/hold timing margin validation, multi-channel state acquisition, and probe impedance loading.',
      source: 'Prof. Radhika Sen — ECE Advanced VLSI Testing',
      verified: true,
      isDemo: true
    },
    {
      id: 'mat_resin_safety',
      title: 'Formlabs SLA Resin Handling & Solvent Chemical Safety SOP',
      type: 'safety-guideline',
      labId: 'lab_mech_proto',
      resourceId: 'res_formlabs_3d_01',
      topic: 'Chemical & Environmental Safety',
      description: 'Mandatory environmental protocol for handling photopolymer resin cartridges, IPA solvent bath filtration, and hazardous UV waste disposal.',
      source: 'Campus Environmental Health & Safety Division (EHS-SLA-04)',
      verified: true,
      isDemo: true
    },
    {
      id: 'mat_cuda_distributed',
      title: 'CUDA Multi-GPU Distributed Training & Mixed-Precision Best Practices',
      type: 'video-reference',
      labId: 'lab_cse_ml',
      resourceId: 'res_rtx4090_rig_01',
      topic: 'Deep Learning & Compute Optimization',
      description: 'Recorded laboratory seminar on PyTorch Distributed Data Parallel (DDP), gradient checkpointing, and thermal throttling mitigations.',
      source: 'Dr. Aris Thorne — CSE High Performance AI Seminar',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      verified: true,
      isDemo: true
    },
    {
      id: 'mat_uv_spectro_video',
      title: 'UV-Vis Spectrophotometer Operation & Cuvette Handling Demonstration',
      type: 'video-reference',
      labId: 'lab_bio_chem',
      resourceId: 'res_shimadzu_uv_01',
      topic: 'Biomolecular Analytics & Optical Spectroscopy',
      description: 'Step-by-step demonstration covering baseline calibration, quartz cuvette orientation, and optical absorbance linearity checks.',
      source: 'Dr. Elena Rostova — Bio-Molecular Spectroscopy Demonstration',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      verified: true,
      isDemo: true
    },
    {
      id: 'mat_fpga_timing',
      title: 'Xilinx Vivado Static Timing Analysis & CDC Verification Checklist',
      type: 'sop-checklist',
      labId: 'lab_ece_digital',
      resourceId: 'res_zynq_fpga_01',
      topic: 'Embedded Systems & Reconfigurable Logic',
      description: 'Checklist for clock domain crossing constraints, multi-cycle path exceptions, and hardware bitstream verification in loop.',
      source: 'Digital Systems Lab Guidelines / Maxwell Complex',
      verified: true,
      isDemo: true
    }
  ];

  const resources: Resource[] = [
    {
      id: 'res_jetson_orin_01',
      name: 'NVIDIA Jetson AGX Orin 64GB Dev Kit',
      departmentId: 'dept_mech',
      labId: 'lab_mech_auto',
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
      labId: 'lab_cse_ml',
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
      labId: 'lab_ece_digital',
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
      labId: 'lab_ece_rf',
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
      labId: 'lab_ece_digital',
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
      labId: 'lab_mech_proto',
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
      labId: 'lab_mech_proto',
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
      labId: 'lab_ece_rf',
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
      labId: 'lab_mech_auto',
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
    },
    {
      id: 'res_shimadzu_uv_01',
      name: 'Shimadzu UV-2600i Double-Beam UV-Vis Spectrometer',
      departmentId: 'dept_bio',
      labId: 'lab_bio_chem',
      category: 'instrumentation',
      capabilityTags: ['signal-measurement', 'power-analysis'],
      location: 'Pasteur Hall - Molecular Spectroscopy 201',
      description: 'High-precision double-beam optical absorption spectrophotometer for nucleic acid, protein, and nanomaterial assays.',
      requiresCertification: [],
      maxSessionMinutes: 120,
      bufferMinutes: 15,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { Wavelength: '185 to 900 nm', PhotometricRange: '-5 to 5 Abs', SpectralBandwidth: '0.1 to 5 nm' }
    },
    {
      id: 'res_agilent_hplc_01',
      name: 'Agilent 1260 Infinity II HPLC Analytical System',
      departmentId: 'dept_bio',
      labId: 'lab_bio_chem',
      category: 'instrumentation',
      capabilityTags: ['power-analysis', 'signal-measurement'],
      location: 'Pasteur Hall - Chromatography Bay 203',
      description: 'Quaternary analytical chromatography system for biomolecule purification and peptide purity quantification.',
      requiresCertification: ['SAFETY_MECH_L1'],
      maxSessionMinutes: 180,
      bufferMinutes: 30,
      operatingHours: { open: '08:00', close: '20:00' },
      status: 'available',
      specs: { Pressure: 'Up to 600 bar', FlowRate: '0.001 to 10 mL/min', Detector: 'Diode Array DAD' }
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

  const projects: Project[] = [
    {
      id: 'proj_drone_capstone',
      ownerId: 'user_alex',
      advisorId: 'user_radhika',
      title: 'Autonomous Drone Obstacle Avoidance (Capstone Final)',
      description: 'Edge-AI neural perception running on NVIDIA Jetson Orin with sub-50ms obstacle avoidance loop.',
      type: 'capstone',
      deadline: `${day3Str}T17:00:00.000Z`,
      createdAt: `${todayStr}T08:00:00.000Z`
    },
    {
      id: 'proj_cdc_verification',
      ownerId: 'user_marcus',
      advisorId: 'user_radhika',
      title: 'FPGA Clock Domain Crossing & Multi-Cycle Timing Sign-off',
      description: 'Sub-nanosecond timing margin validation using 16-channel logic analyzer and Xilinx UltraScale+ MPSoC.',
      type: 'research',
      deadline: `${day7Str}T18:00:00.000Z`,
      createdAt: `${todayStr}T08:30:00.000Z`
    },
    {
      id: 'proj_thermal_vision',
      ownerId: 'user_priya',
      advisorId: 'user_radhika',
      title: 'Multi-Modal Thermal & Optical Fusion Model',
      description: 'Thermal camera synchronization and battery pack dissipation profiling during high-rate discharge.',
      type: 'research',
      deadline: `${day7Str}T17:00:00.000Z`,
      createdAt: `${todayStr}T09:00:00.000Z`
    },
    {
      id: 'proj_intro_robotics',
      ownerId: 'user_jordan',
      advisorId: 'user_radhika',
      title: 'Introductory Robotics Lab Exercise 4',
      description: 'Coursework practice on ROS2 node communication and OpenCV edge filtering for autonomous ground rovers.',
      type: 'coursework',
      deadline: `${day18Str}T23:59:00.000Z`,
      createdAt: `${todayStr}T10:00:00.000Z`
    },
    {
      id: 'proj_protein_kinetics',
      ownerId: 'user_alex',
      advisorId: 'user_radhika',
      title: 'Biomolecular Photopolymer Resin Degradation Assay',
      description: 'UV-Vis spectrophotometric absorbance tracking of biocompatible resin degradation in saline solvents.',
      type: 'research',
      deadline: `${day18Str}T16:00:00.000Z`,
      createdAt: `${todayStr}T11:00:00.000Z`
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
    users: [...students, facultyUser],
    departments,
    labs,
    resources,
    projects,
    requests,
    bookings,
    materials,
    lastResetAt: new Date().toISOString()
  };
}
