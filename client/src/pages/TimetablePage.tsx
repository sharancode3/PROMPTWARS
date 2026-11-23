import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';

interface DailyScheduleItem {
  id: string;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  labId: string;
  labName: string;
  roomNumber: string;
  resourceId: string;
  resourceName: string;
  category: string;
  projectTitle: string;
  status: 'confirmed' | 'open' | 'maintenance' | 'priority';
  departmentCode: string;
  studentName?: string;
}

export function TimetablePage() {
  const navigate = useNavigate();
  const { scenario } = useScenario();

  // Current calendar month view: November 2026
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(10); // 0-indexed: 10 = November
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(24); // Default: Nov 24
  const [filterLab, setFilterLab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'matrix'>('calendar');

  // Days in November 2026: 30 days. Nov 1, 2026 was a Sunday (0).
  const monthName = 'November 2026';
  const totalDays = 30;
  const startDayOfWeek = 0; // Sunday

  // Seeded calendar schedule items distributed across the month
  const allScheduleItems: DailyScheduleItem[] = useMemo(() => {
    const items: DailyScheduleItem[] = [];

    // Recurring distribution generator across November 2026
    for (let day = 1; day <= totalDays; day++) {
      const dayPad = String(day).padStart(2, '0');
      const dateStr = `2026-11-${dayPad}`;
      const d = new Date(2026, 10, day);
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Skip Sundays (labs closed)
      if (d.getDay() === 0) continue;

      // Monday/Wednesday/Friday pattern
      if (d.getDay() === 1 || d.getDay() === 3 || d.getDay() === 5) {
        items.push({
          id: `item_${day}_1`,
          dateStr,
          dayOfWeek,
          startTime: '08:30',
          endTime: '11:30',
          labId: 'lab_cse_ml',
          labName: 'Machine Learning & HPC Cluster Lab',
          roomNumber: 'Turing 308',
          resourceId: 'res_rtx4090_rig_01',
          resourceName: 'NVIDIA RTX 4090 Deep Learning Rig',
          category: 'compute',
          projectTitle: 'Large Vision Model Fine-Tuning & Quantization',
          status: 'confirmed',
          departmentCode: 'CSE',
          studentName: 'Aarav Mehta'
        });

        items.push({
          id: `item_${day}_2`,
          dateStr,
          dayOfWeek,
          startTime: '12:00',
          endTime: '15:00',
          labId: 'lab_mech_auto',
          labName: 'Autonomous Systems & Robotics Lab',
          roomNumber: 'Tesla 102',
          resourceId: 'res_jetson_orin_01',
          resourceName: 'NVIDIA Jetson AGX Orin 64GB',
          category: 'compute',
          projectTitle: 'Open Walk-in Bench • Edge AI Diagnostics',
          status: 'open',
          departmentCode: 'MECH'
        });

        items.push({
          id: `item_${day}_3`,
          dateStr,
          dayOfWeek,
          startTime: '15:30',
          endTime: '18:30',
          labId: 'lab_ece_digital',
          labName: 'Digital Systems & VLSI Testing Lab',
          roomNumber: 'Maxwell 204',
          resourceId: 'res_keysight_la_01',
          resourceName: 'Keysight 16-Ch 500MHz Logic Analyzer',
          category: 'instrumentation',
          projectTitle: 'High-Speed Logic State Capture & Clock Skew',
          status: 'confirmed',
          departmentCode: 'ECE',
          studentName: 'Marcus Chen'
        });
      }

      // Tuesday/Thursday pattern (Capstone Contested Days)
      if (d.getDay() === 2 || d.getDay() === 4) {
        items.push({
          id: `item_${day}_1`,
          dateStr,
          dayOfWeek,
          startTime: '09:00',
          endTime: '12:00',
          labId: 'lab_ece_digital',
          labName: 'Digital Systems & VLSI Testing Lab',
          roomNumber: 'Maxwell 204',
          resourceId: 'res_zynq_fpga_01',
          resourceName: 'Xilinx Zynq UltraScale+ Dev Board',
          category: 'embedded',
          projectTitle: 'FPGA Accelerator RTL Synthesis',
          status: 'confirmed',
          departmentCode: 'ECE',
          studentName: 'Priya Patel'
        });

        items.push({
          id: `item_${day}_2`,
          dateStr,
          dayOfWeek,
          startTime: '13:00',
          endTime: '16:00',
          labId: 'lab_mech_auto',
          labName: 'Autonomous Systems & Robotics Lab',
          roomNumber: 'Tesla 102',
          resourceId: 'res_jetson_orin_01',
          resourceName: 'NVIDIA Jetson AGX Orin 64GB',
          category: 'compute',
          projectTitle: 'Autonomous UAV Obstacle Avoidance (Capstone)',
          status: day === 24 ? 'priority' : 'confirmed',
          departmentCode: 'MECH',
          studentName: 'Alex Rivera'
        });

        items.push({
          id: `item_${day}_3`,
          dateStr,
          dayOfWeek,
          startTime: '16:30',
          endTime: '19:30',
          labId: 'lab_ece_rf',
          labName: 'RF & Microwave Wireless Communications',
          roomNumber: 'Maxwell 202',
          resourceId: 'res_rs_spectrum_01',
          resourceName: 'Rohde & Schwarz 3GHz Spectrum Analyzer',
          category: 'instrumentation',
          projectTitle: 'Software-Defined Radio Spectral Purity',
          status: 'open',
          departmentCode: 'ECE'
        });
      }

      // Saturday (Special fabrication & testing)
      if (d.getDay() === 6) {
        items.push({
          id: `item_${day}_1`,
          dateStr,
          dayOfWeek,
          startTime: '09:00',
          endTime: '13:00',
          labId: 'lab_mech_proto',
          labName: 'Rapid Prototyping Workshop',
          roomNumber: 'Tesla 105',
          resourceId: 'res_haas_cnc_01',
          resourceName: 'Haas Mini Mill 3-Axis CNC Center',
          category: 'fabrication',
          projectTitle: 'Weekend Capstone Milling Marathon',
          status: 'open',
          departmentCode: 'MECH'
        });

        items.push({
          id: `item_${day}_2`,
          dateStr,
          dayOfWeek,
          startTime: '14:00',
          endTime: '18:00',
          labId: 'lab_mech_proto',
          labName: 'Rapid Prototyping Workshop',
          roomNumber: 'Tesla 105',
          resourceId: 'res_formlabs_3d_01',
          resourceName: 'Formlabs Form 4 SLA 3D Resin Printer',
          category: 'fabrication',
          projectTitle: 'High-Tolerance SLA Enclosure Curing',
          status: 'confirmed',
          departmentCode: 'MECH',
          studentName: 'Dev Sharma'
        });
      }
    }
    return items;
  }, []);

  // Items for the selected day
  const selectedDateStr = `2026-11-${String(selectedDayNumber).padStart(2, '0')}`;
  const selectedDateObj = new Date(currentYear, currentMonth, selectedDayNumber);
  const selectedDayName = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const daySchedule = useMemo(() => {
    return allScheduleItems.filter((item) => {
      const matchDate = item.dateStr === selectedDateStr;
      const matchLab = filterLab === 'all' || item.labId === filterLab;
      return matchDate && matchLab;
    });
  }, [allScheduleItems, selectedDateStr, filterLab]);

  // Count items per day for monthly grid badges
  const scheduleCountByDay = useMemo(() => {
    const map = new Map<number, { total: number; open: number }>();
    allScheduleItems.forEach((item) => {
      const day = parseInt(item.dateStr.split('-')[2], 10);
      const current = map.get(day) || { total: 0, open: 0 };
      current.total += 1;
      if (item.status === 'open') current.open += 1;
      map.set(day, current);
    });
    return map;
  }, [allScheduleItems]);

  const handleClaimSlot = (item: DailyScheduleItem) => {
    navigate(
      `/request?resourceId=${item.resourceId}&date=${item.dateStr}&startTime=${item.startTime}&endTime=${item.endTime}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-rule pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
            06 SCHEDULE • CAMPUS LABORATORY CALENDAR
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            Laboratory Monthly Timetable
          </h1>
          <p className="text-sm text-ink-2 mt-1 max-w-2xl">
            Select any day on the monthly calendar to inspect active research allocations, open walk-in benches, and scheduled laboratory sessions.
          </p>
        </div>

        {/* View Switcher & Facility Filter */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 border transition-colors ${
              viewMode === 'calendar'
                ? 'border-ink bg-ink text-paper font-semibold'
                : 'border-rule hover:bg-tint text-ink'
            }`}
          >
            Monthly Calendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 border transition-colors ${
              viewMode === 'matrix'
                ? 'border-ink bg-ink text-paper font-semibold'
                : 'border-rule hover:bg-tint text-ink'
            }`}
          >
            All Sessions List
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-tint/30 p-3 border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-ink-3 text-[11px] uppercase">Filter by Facility:</span>
          <select
            value={filterLab}
            onChange={(e) => setFilterLab(e.target.value)}
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

        <div className="flex items-center space-x-3 text-xs text-ink-2">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-signal inline-block" />
            <span>Open Bench</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-ink inline-block" />
            <span>Reserved Session</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-amber-500 inline-block" />
            <span>Capstone Focus</span>
          </span>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Monthly Calendar View (7 cols) */}
          <div className="lg:col-span-7 border border-rule bg-paper p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-rule-soft pb-3 font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-signal inline-block" />
                <h2 className="text-base font-bold text-ink tracking-tight uppercase">
                  {monthName}
                </h2>
              </div>
              <span className="text-xs text-ink-3">Click date to inspect day</span>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs font-semibold text-ink-3 py-1">
              <div>SUN</div>
              <div>MON</div>
              <div>TUE</div>
              <div>WED</div>
              <div>THU</div>
              <div>FRI</div>
              <div>SAT</div>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5 font-mono text-xs">
              {/* Empty leading offset days (Sunday = 0) */}
              {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                <div key={`empty_${idx}`} className="h-20 border border-transparent bg-tint/10" />
              ))}

              {/* Days 1 to 30 */}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const day = idx + 1;
                const dateMeta = scheduleCountByDay.get(day);
                const isSelected = selectedDayNumber === day;
                const isToday = day === 23; // Nov 23

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDayNumber(day)}
                    className={`h-20 p-2 border text-left flex flex-col justify-between transition-all focus-visible:outline-none ${
                      isSelected
                        ? 'border-2 border-signal bg-signal/5 ring-1 ring-signal'
                        : isToday
                        ? 'border-ink bg-tint'
                        : 'border-rule hover:border-rule-strong bg-paper'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${isSelected ? 'text-signal' : 'text-ink'}`}>
                        {day}
                      </span>
                      {isToday && (
                        <span className="text-[9px] uppercase px-1 bg-ink text-paper font-semibold">
                          Today
                        </span>
                      )}
                    </div>

                    {dateMeta ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-ink-2 block truncate">
                          {dateMeta.total} {dateMeta.total === 1 ? 'lab' : 'labs'}
                        </span>
                        {dateMeta.open > 0 && (
                          <span className="text-[9px] text-signal font-bold block truncate">
                            ● {dateMeta.open} open
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-ink-3 italic">Closed</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Timetable Schedule Detail (5 cols) */}
          <div className="lg:col-span-5 border border-rule bg-paper p-5 space-y-4">
            <div className="border-b border-rule-soft pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-signal uppercase font-bold tracking-wider">
                  SCHEDULE FOR SELECTED DATE
                </span>
                <h3 className="text-lg font-bold text-ink mt-0.5">
                  {selectedDayName}
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 border border-rule bg-tint text-ink">
                {daySchedule.length} Sessions
              </span>
            </div>

            {/* List of sessions for this day */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {daySchedule.map((session) => {
                const statusStyles = {
                  confirmed: 'border-ink bg-tint text-ink font-semibold',
                  open: 'border-signal bg-signal text-white font-bold',
                  maintenance: 'border-rule bg-tint text-ink-3',
                  priority: 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                }[session.status];

                return (
                  <div
                    key={session.id}
                    className="border border-rule p-4 space-y-2 bg-paper hover:border-ink transition-colors shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-rule-soft pb-1.5">
                      <span className="font-mono text-xs font-bold text-ink">
                        {session.startTime} — {session.endTime}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${statusStyles}`}>
                        {session.status === 'open' ? 'AVAILABLE NOW' : session.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-signal uppercase tracking-wider block">
                        {session.labName} • {session.roomNumber}
                      </span>
                      <h4 className="font-bold text-sm text-ink mt-0.5">
                        {session.resourceName}
                      </h4>
                      <p className="text-xs text-ink-2 mt-1 leading-relaxed">
                        {session.projectTitle}
                      </p>
                    </div>

                    {session.studentName && (
                      <div className="text-[11px] font-mono text-ink-3">
                        Student: <span className="font-semibold text-ink">{session.studentName}</span> ({session.departmentCode})
                      </div>
                    )}

                    <div className="pt-2 border-t border-rule-soft flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-ink-3 uppercase">
                        Dept: {session.departmentCode}
                      </span>
                      {session.status === 'open' ? (
                        <button
                          type="button"
                          onClick={() => handleClaimSlot(session)}
                          className="px-3 py-1 bg-signal text-white font-bold hover:opacity-90 transition-opacity"
                        >
                          Book Slot →
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate(`/discover?search=${encodeURIComponent(session.resourceName)}`)}
                          className="text-ink hover:underline text-[11px]"
                        >
                          Device Details →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {daySchedule.length === 0 && (
                <div className="p-8 border border-rule text-center bg-tint/10 font-mono text-xs text-ink-3">
                  No laboratory sessions scheduled for {selectedDayName}. Campus labs operate Monday through Saturday.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Matrix View of All Sessions */
        <div className="border border-rule bg-paper p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-rule-soft pb-3 font-mono text-xs">
            <h2 className="text-base font-bold text-ink">Master Month Schedule ({monthName})</h2>
            <span className="text-ink-3">{allScheduleItems.length} total blocks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allScheduleItems
              .filter((item) => filterLab === 'all' || item.labId === filterLab)
              .map((item) => (
                <div key={item.id} className="border border-rule p-3 space-y-2 bg-paper text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{item.dateStr} ({item.dayOfWeek})</span>
                    <span className="text-signal font-semibold">{item.startTime}–{item.endTime}</span>
                  </div>
                  <div className="font-semibold text-ink truncate">{item.resourceName}</div>
                  <div className="text-[11px] text-ink-3 truncate">{item.labName}</div>
                  <div className="pt-2 border-t border-rule-soft flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-ink">{item.status}</span>
                    {item.status === 'open' ? (
                      <button
                        type="button"
                        onClick={() => handleClaimSlot(item)}
                        className="text-signal font-bold hover:underline"
                      >
                        Claim Slot →
                      </button>
                    ) : (
                      <span className="text-ink-3">{item.studentName || 'Reserved'}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
