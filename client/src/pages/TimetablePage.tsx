import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';

interface TimetableBlock {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  timeSlot: string; // e.g. "09:00 - 11:00"
  startTime: string;
  endTime: string;
  labId: string;
  labName: string;
  roomNumber: string;
  resourceName: string;
  resourceId: string;
  projectTitle: string;
  status: 'confirmed' | 'open' | 'maintenance' | 'department-priority';
  departmentCode: string;
  studentName?: string;
}

export function TimetablePage() {
  const navigate = useNavigate();
  const { scenario } = useScenario();

  const [selectedLab, setSelectedLab] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

  // Master weekly schedule synthesized from campus labs & confirmed allocations
  const timetableSchedule: TimetableBlock[] = useMemo(() => {
    return [
      // Monday
      {
        id: 'tt_mon_1',
        day: 'Mon',
        timeSlot: '08:30 — 11:30',
        startTime: '08:30',
        endTime: '11:30',
        labId: 'lab_cse_ml',
        labName: 'Machine Learning & HPC Cluster Lab',
        roomNumber: 'Turing 308',
        resourceName: 'NVIDIA RTX 4090 Deep Learning Rig',
        resourceId: 'res_rtx4090_rig_01',
        projectTitle: 'Multi-Modal Transformer Pre-training',
        status: 'confirmed',
        departmentCode: 'CSE',
        studentName: 'Aarav Mehta'
      },
      {
        id: 'tt_mon_2',
        day: 'Mon',
        timeSlot: '12:00 — 14:00',
        startTime: '12:00',
        endTime: '14:00',
        labId: 'lab_mech_auto',
        labName: 'Autonomous Systems & Robotics Lab',
        roomNumber: 'Tesla 102',
        resourceName: 'NVIDIA Jetson AGX Orin 64GB',
        resourceId: 'res_jetson_orin_01',
        projectTitle: 'Open Walk-In Bench / Edge AI Diagnostics',
        status: 'open',
        departmentCode: 'MECH'
      },
      {
        id: 'tt_mon_3',
        day: 'Mon',
        timeSlot: '14:30 — 17:30',
        startTime: '14:30',
        endTime: '17:30',
        labId: 'lab_ece_digital',
        labName: 'Digital Systems & VLSI Testing Lab',
        roomNumber: 'Maxwell 204',
        resourceName: 'Keysight 16-Ch 500MHz Logic Analyzer',
        resourceId: 'res_keysight_la_01',
        projectTitle: 'Sub-Nanosecond Clock Skew Verification',
        status: 'confirmed',
        departmentCode: 'ECE',
        studentName: 'Marcus Chen'
      },
      {
        id: 'tt_mon_4',
        day: 'Mon',
        timeSlot: '18:00 — 20:00',
        startTime: '18:00',
        endTime: '20:00',
        labId: 'lab_mech_proto',
        labName: 'Rapid Prototyping Workshop',
        roomNumber: 'Tesla 105',
        resourceName: 'Formlabs Form 4 SLA 3D Resin Printer',
        resourceId: 'res_formlabs_3d_01',
        projectTitle: 'Post-Cure Chemical Protocol Calibration',
        status: 'maintenance',
        departmentCode: 'MECH'
      },

      // Tuesday
      {
        id: 'tt_tue_1',
        day: 'Tue',
        timeSlot: '09:00 — 12:00',
        startTime: '09:00',
        endTime: '12:00',
        labId: 'lab_ece_digital',
        labName: 'Digital Systems & VLSI Testing Lab',
        roomNumber: 'Maxwell 204',
        resourceName: 'Xilinx Zynq UltraScale+ Dev Board',
        resourceId: 'res_zynq_fpga_01',
        projectTitle: 'FPGA Accelerator RTL Synthesis',
        status: 'confirmed',
        departmentCode: 'ECE',
        studentName: 'Priya Patel'
      },
      {
        id: 'tt_tue_2',
        day: 'Tue',
        timeSlot: '13:00 — 16:00',
        startTime: '13:00',
        endTime: '16:00',
        labId: 'lab_mech_auto',
        labName: 'Autonomous Systems & Robotics Lab',
        roomNumber: 'Tesla 102',
        resourceName: 'NVIDIA Jetson AGX Orin 64GB',
        resourceId: 'res_jetson_orin_01',
        projectTitle: 'Autonomous Drone Path Planning (Capstone)',
        status: 'confirmed',
        departmentCode: 'MECH',
        studentName: 'Alex Rivera'
      },
      {
        id: 'tt_tue_3',
        day: 'Tue',
        timeSlot: '16:30 — 19:30',
        startTime: '16:30',
        endTime: '19:30',
        labId: 'lab_ece_rf',
        labName: 'RF & Microwave Wireless Communications',
        roomNumber: 'Maxwell 202',
        resourceName: 'Rohde & Schwarz 3GHz Spectrum Analyzer',
        resourceId: 'res_rs_spectrum_01',
        projectTitle: '5G SDR Harmonic Distortion Testing',
        status: 'department-priority',
        departmentCode: 'ECE'
      },

      // Wednesday
      {
        id: 'tt_wed_1',
        day: 'Wed',
        timeSlot: '08:30 — 11:30',
        startTime: '08:30',
        endTime: '11:30',
        labId: 'lab_mech_proto',
        labName: 'Rapid Prototyping Workshop',
        roomNumber: 'Tesla 105',
        resourceName: 'Haas Mini Mill 3-Axis CNC Center',
        resourceId: 'res_haas_cnc_01',
        projectTitle: 'Precision Aluminum Enclosure Machining',
        status: 'confirmed',
        departmentCode: 'MECH',
        studentName: 'Jordan Lee'
      },
      {
        id: 'tt_wed_2',
        day: 'Wed',
        timeSlot: '12:00 — 15:00',
        startTime: '12:00',
        endTime: '15:00',
        labId: 'lab_cse_ml',
        labName: 'Machine Learning & HPC Cluster Lab',
        roomNumber: 'Turing 308',
        resourceName: 'NVIDIA RTX 4090 Deep Learning Rig',
        resourceId: 'res_rtx4090_rig_01',
        projectTitle: 'Open High-Throughput Fine-Tuning Slot',
        status: 'open',
        departmentCode: 'CSE'
      },
      {
        id: 'tt_wed_3',
        day: 'Wed',
        timeSlot: '15:30 — 18:30',
        startTime: '15:30',
        endTime: '18:30',
        labId: 'lab_mech_auto',
        labName: 'Autonomous Systems & Robotics Lab',
        roomNumber: 'Tesla 102',
        resourceName: 'FLIR T540 High-Speed Thermal Camera',
        resourceId: 'res_flir_thermal_01',
        projectTitle: 'Battery Thermal Runaway Profiling',
        status: 'confirmed',
        departmentCode: 'MECH',
        studentName: 'Priya Patel'
      },

      // Thursday
      {
        id: 'tt_thu_1',
        day: 'Thu',
        timeSlot: '09:00 — 12:00',
        startTime: '09:00',
        endTime: '12:00',
        labId: 'lab_ece_rf',
        labName: 'RF & Microwave Wireless Communications',
        roomNumber: 'Maxwell 202',
        resourceName: 'Tektronix 4-Ch 1GHz Digital Oscilloscope',
        resourceId: 'res_tektronix_scope_01',
        projectTitle: 'Signal Integrity & Jitter Debugging',
        status: 'open',
        departmentCode: 'ECE'
      },
      {
        id: 'tt_thu_2',
        day: 'Thu',
        timeSlot: '13:00 — 16:00',
        startTime: '13:00',
        endTime: '16:00',
        labId: 'lab_ece_digital',
        labName: 'Digital Systems & VLSI Testing Lab',
        roomNumber: 'Maxwell 204',
        resourceName: 'Keysight 16-Ch 500MHz Logic Analyzer',
        resourceId: 'res_keysight_la_01',
        projectTitle: 'Inter-Department FPGA Bus Testing',
        status: 'confirmed',
        departmentCode: 'ECE',
        studentName: 'Alex Rivera'
      },
      {
        id: 'tt_thu_3',
        day: 'Thu',
        timeSlot: '16:30 — 19:30',
        startTime: '16:30',
        endTime: '19:30',
        labId: 'lab_mech_proto',
        labName: 'Rapid Prototyping Workshop',
        roomNumber: 'Tesla 105',
        resourceName: 'Formlabs Form 4 SLA 3D Resin Printer',
        resourceId: 'res_formlabs_3d_01',
        projectTitle: 'SLA Biocompatible Sensor Casing',
        status: 'confirmed',
        departmentCode: 'MECH',
        studentName: 'Dev Sharma'
      },

      // Friday
      {
        id: 'tt_fri_1',
        day: 'Fri',
        timeSlot: '08:30 — 11:30',
        startTime: '08:30',
        endTime: '11:30',
        labId: 'lab_cse_ml',
        labName: 'Machine Learning & HPC Cluster Lab',
        roomNumber: 'Turing 308',
        resourceName: 'NVIDIA RTX 4090 Deep Learning Rig',
        resourceId: 'res_rtx4090_rig_01',
        projectTitle: 'Graduate Seminar Model Benchmarks',
        status: 'department-priority',
        departmentCode: 'CSE'
      },
      {
        id: 'tt_fri_2',
        day: 'Fri',
        timeSlot: '12:00 — 15:00',
        startTime: '12:00',
        endTime: '15:00',
        labId: 'lab_mech_auto',
        labName: 'Autonomous Systems & Robotics Lab',
        roomNumber: 'Tesla 102',
        resourceName: 'NVIDIA Jetson AGX Orin 64GB',
        resourceId: 'res_jetson_orin_01',
        projectTitle: 'Open Project Exploration Window',
        status: 'open',
        departmentCode: 'MECH'
      },
      {
        id: 'tt_fri_3',
        day: 'Fri',
        timeSlot: '15:30 — 18:30',
        startTime: '15:30',
        endTime: '18:30',
        labId: 'lab_ece_digital',
        labName: 'Digital Systems & VLSI Testing Lab',
        roomNumber: 'Maxwell 204',
        resourceName: 'Xilinx Zynq UltraScale+ Dev Board',
        resourceId: 'res_zynq_fpga_01',
        projectTitle: 'Hardware In Loop (HIL) Flight Sim',
        status: 'confirmed',
        departmentCode: 'ECE',
        studentName: 'Jordan Lee'
      },

      // Saturday
      {
        id: 'tt_sat_1',
        day: 'Sat',
        timeSlot: '09:00 — 13:00',
        startTime: '09:00',
        endTime: '13:00',
        labId: 'lab_mech_proto',
        labName: 'Rapid Prototyping Workshop',
        roomNumber: 'Tesla 105',
        resourceName: 'Haas Mini Mill 3-Axis CNC Center',
        resourceId: 'res_haas_cnc_01',
        projectTitle: 'Weekend Capstone Sprint Machining',
        status: 'open',
        departmentCode: 'MECH'
      },
      {
        id: 'tt_sat_2',
        day: 'Sat',
        timeSlot: '13:30 — 17:30',
        startTime: '13:30',
        endTime: '17:30',
        labId: 'lab_cse_ml',
        labName: 'Machine Learning & HPC Cluster Lab',
        roomNumber: 'Turing 308',
        resourceName: 'NVIDIA RTX 4090 Deep Learning Rig',
        resourceId: 'res_rtx4090_rig_01',
        projectTitle: 'Multi-Department Open Compute Marathon',
        status: 'open',
        departmentCode: 'CSE'
      }
    ];
  }, []);

  const filteredBlocks = useMemo(() => {
    return timetableSchedule.filter((block) => {
      const matchLab = selectedLab === 'all' || block.labId === selectedLab;
      const matchDay = selectedDay === 'all' || block.day === selectedDay;
      return matchLab && matchDay;
    });
  }, [timetableSchedule, selectedLab, selectedDay]);

  const handleBookSlot = (block: TimetableBlock) => {
    navigate(
      `/request?resourceId=${block.resourceId}&startTime=${block.startTime}&endTime=${block.endTime}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-rule pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
            06 SCHEDULE • MASTER LABORATORY TIMETABLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            Campus Laboratory Timetable
          </h1>
          <p className="text-sm text-ink-2 mt-1 max-w-2xl">
            Live weekly schedule tracking active reservations, departmental priorities, and certified open walk-in windows across campus facilities.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 border border-rule bg-tint text-ink">
            Mon — Sat • 08:00 – 20:00 IST
          </span>
          <span className="px-2.5 py-1 border border-signal text-signal bg-paper font-semibold">
            Real-time Telemetry
          </span>
        </div>
      </div>

      {/* Filter Rails */}
      <div className="bg-tint/30 p-3 border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-ink-3 mr-1 text-[11px] uppercase">Day of Week:</span>
          <button
            type="button"
            onClick={() => setSelectedDay('all')}
            className={`px-2.5 py-1 border text-xs transition-colors ${
              selectedDay === 'all'
                ? 'border-ink bg-ink text-paper font-semibold'
                : 'border-rule hover:bg-tint text-ink-2'
            }`}
          >
            All Week
          </button>
          {daysOfWeek.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-2.5 py-1 border text-xs transition-colors ${
                selectedDay === day
                  ? 'border-ink bg-ink text-paper font-semibold'
                  : 'border-rule hover:bg-tint text-ink-2'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-ink-3 text-[11px] uppercase">Facility:</span>
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="px-2.5 py-1 border border-rule bg-paper text-ink text-xs focus-visible:outline-none"
          >
            <option value="all">All University Laboratories</option>
            {(scenario.labs || []).map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name} ({lab.roomNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-ink-2 px-1">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 bg-ink inline-block" />
          <span>Active Allocation</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 border-2 border-signal bg-signal/20 inline-block" />
          <span className="text-signal font-semibold">Open Walk-in Bench (Available)</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 bg-amber-400 inline-block" />
          <span>Department Priority Hours</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 bg-rule-strong inline-block" />
          <span>Calibration Maintenance</span>
        </span>
      </div>

      {/* Timetable Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBlocks.map((block) => {
          const statusBadge = {
            confirmed: 'border-ink bg-ink text-paper',
            open: 'border-signal bg-signal text-white font-bold animate-pulse',
            maintenance: 'border-rule bg-tint text-ink-3',
            'department-priority': 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
          }[block.status];

          const cardBorder = block.status === 'open' ? 'border-2 border-signal' : 'border border-rule';

          return (
            <div
              key={block.id}
              className={`${cardBorder} bg-paper p-4 flex flex-col justify-between hover:border-ink transition-colors shadow-2xs`}
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-rule-soft">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 border border-rule font-mono text-xs font-bold text-ink bg-tint">
                      {block.day}
                    </span>
                    <span className="font-mono text-xs font-semibold text-ink">
                      {block.timeSlot}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 ${statusBadge}`}>
                    {block.status.replace('-', ' ')}
                  </span>
                </div>

                {/* Facility & Device */}
                <div className="text-[11px] font-mono text-signal uppercase tracking-wider font-semibold">
                  {block.labName} • {block.roomNumber}
                </div>

                <h3 className="text-sm font-bold text-ink leading-snug mt-1 mb-2">
                  {block.resourceName}
                </h3>

                <p className="text-xs text-ink-2 leading-relaxed mb-3">
                  <strong className="text-ink">Project / Context:</strong> {block.projectTitle}
                </p>

                {block.studentName && (
                  <div className="text-[11px] font-mono text-ink-3">
                    Assigned: <span className="font-semibold text-ink">{block.studentName}</span> ({block.departmentCode})
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-rule-soft mt-3 flex items-center justify-between font-mono text-xs">
                <span className="text-[11px] text-ink-3">
                  {block.departmentCode} Facility
                </span>
                {block.status === 'open' ? (
                  <button
                    type="button"
                    onClick={() => handleBookSlot(block)}
                    className="px-3 py-1.5 bg-signal text-white font-bold hover:opacity-90 transition-opacity"
                  >
                    Claim Slot →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/discover?search=${encodeURIComponent(block.resourceName)}`)}
                    className="text-ink hover:underline text-[11px]"
                  >
                    View Device Specs →
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredBlocks.length === 0 && (
          <div className="col-span-full p-8 border border-rule text-center bg-tint/10 font-mono text-xs text-ink-3">
            No laboratory sessions scheduled for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
