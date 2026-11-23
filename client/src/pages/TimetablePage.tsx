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
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(24); // Default: Nov 24
  const [filterLab, setFilterLab] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'day' | 'agenda'>('month');

  // Days in November 2026: 30 days. Nov 1, 2026 was a Sunday (0).
  const monthName = 'November 2026';
  const totalDays = 30;
  const startDayOfWeek = 0; // Sunday

  // Derive schedule items from canonical bookings + feasible slots
  const allScheduleItems: DailyScheduleItem[] = useMemo(() => {
    const items: DailyScheduleItem[] = [];

    // 1. Ingest all scenario bookings (Ground Truth)
    (scenario.bookings || []).forEach((b) => {
      const res = scenario.resources.find((r) => r.id === b.resourceId);
      const lab = (scenario.labs || []).find((l) => l.id === res?.labId);
      const d = new Date(b.date);
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });

      items.push({
        id: `book_${b.id}`,
        dateStr: b.date,
        dayOfWeek,
        startTime: b.startTime,
        endTime: b.endTime,
        labId: lab?.id || res?.labId || 'lab_general',
        labName: lab?.name || 'Central Instrumentation Facility',
        roomNumber: lab?.roomNumber || res?.location || 'Campus Lab',
        resourceId: b.resourceId,
        resourceName: res?.name || b.resourceId,
        category: res?.category || 'compute',
        projectTitle: b.studentName ? `${b.studentName} — Confirmed Slot` : 'Reserved Session',
        status: 'confirmed',
        departmentCode: res?.departmentId.replace('dept_', '').toUpperCase() || 'ENG',
        studentName: b.studentName
      });
    });

    // 2. Derive feasible open walk-in slots for weekdays
    for (let day = 1; day <= totalDays; day++) {
      const dayPad = String(day).padStart(2, '0');
      const dateStr = `2026-11-${dayPad}`;
      const d = new Date(2026, 10, day);
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Sundays closed
      if (d.getDay() === 0) continue;

      // For key campus equipment, check if an open slot exists that doesn't overlap bookings
      scenario.resources.forEach((res) => {
        const bookingsOnDate = items.filter(
          (item) => item.dateStr === dateStr && item.resourceId === res.id && item.status === 'confirmed'
        );

        // Candidate time slots within operating hours (08:00 - 20:00)
        const candidateSlots = [
          { start: '09:00', end: '12:00' },
          { start: '13:00', end: '16:00' },
          { start: '16:30', end: '19:30' }
        ];

        candidateSlots.forEach((slot, sIdx) => {
          const overlaps = bookingsOnDate.some(
            (b) => !(slot.end <= b.startTime || slot.start >= b.endTime)
          );

          if (!overlaps) {
            // Only add a few feasible open slots per day to keep timetable realistic and uncluttered
            const shouldAdd = (day + sIdx + res.id.length) % 3 === 0;
            if (shouldAdd) {
              const lab = (scenario.labs || []).find((l) => l.id === res.labId);
              items.push({
                id: `open_${day}_${res.id}_${sIdx}`,
                dateStr,
                dayOfWeek,
                startTime: slot.start,
                endTime: slot.end,
                labId: lab?.id || res.labId || 'lab_general',
                labName: lab?.name || 'Central Instrumentation',
                roomNumber: lab?.roomNumber || res.location,
                resourceId: res.id,
                resourceName: res.name,
                category: res.category,
                projectTitle: `Open Bench Window • Walk-In Feasible (${res.category.toUpperCase()})`,
                status: 'open',
                departmentCode: res.departmentId.replace('dept_', '').toUpperCase()
              });
            }
          }
        });
      });
    }

    return items;
  }, [scenario.bookings, scenario.resources, scenario.labs]);

  // Filter items based on active criteria
  const filteredSchedule = useMemo(() => {
    return allScheduleItems.filter((item) => {
      const matchLab = filterLab === 'all' || item.labId === filterLab;
      const matchCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchLab && matchCategory;
    });
  }, [allScheduleItems, filterLab, filterCategory]);

  // Selected date schedule
  const selectedDateStr = `2026-11-${String(selectedDayNumber).padStart(2, '0')}`;
  const daySchedule = useMemo(() => {
    return filteredSchedule
      .filter((item) => item.dateStr === selectedDateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [filteredSchedule, selectedDateStr]);

  const selectedDayName = useMemo(() => {
    const d = new Date(2026, 10, selectedDayNumber);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDayNumber]);

  // Aggregate stats per day of month
  const scheduleCountByDay = useMemo(() => {
    const map = new Map<number, { total: number; open: number; confirmed: number }>();
    filteredSchedule.forEach((item) => {
      const day = parseInt(item.dateStr.split('-')[2], 10);
      const current = map.get(day) || { total: 0, open: 0, confirmed: 0 };
      current.total += 1;
      if (item.status === 'open') current.open += 1;
      if (item.status === 'confirmed') current.confirmed += 1;
      map.set(day, current);
    });
    return map;
  }, [filteredSchedule]);

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
            Select any day to inspect active research allocations, open walk-in benches, and scheduled laboratory sessions derived from the live scheduler.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 border border-rule p-0.5 bg-tint text-xs font-mono">
          {(['month', 'day', 'agenda'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 uppercase font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-ink text-paper font-bold shadow-xs'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              {mode === 'month' ? 'Month Grid' : mode === 'day' ? 'Day Timeline' : 'Agenda View'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Timezone Bar */}
      <div className="bg-tint/30 p-3.5 border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-ink-3 text-[11px] uppercase">Facility:</span>
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

          <div className="flex items-center space-x-2">
            <span className="text-ink-3 text-[11px] uppercase">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1 border border-rule bg-paper text-ink text-xs focus-visible:outline-none"
            >
              <option value="all">All Equipment Types</option>
              <option value="compute">Compute &amp; HPC</option>
              <option value="embedded">Embedded &amp; FPGA</option>
              <option value="instrumentation">RF &amp; Instrumentation</option>
              <option value="fabrication">Prototyping &amp; CNC</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-ink-2">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-signal inline-block" aria-hidden="true" />
            <span>Open Bench</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-ink inline-block" aria-hidden="true" />
            <span>Reserved Session</span>
          </span>
          <span className="text-ink-3 text-[11px] pl-2 border-l border-rule-soft">
            Campus Standard Time: Asia/Kolkata
          </span>
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid (7 cols) */}
          <div className="lg:col-span-7 border border-rule bg-paper p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-rule-soft pb-3 font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-signal inline-block" aria-hidden="true" />
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
              {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                <div key={`empty_${idx}`} className="h-20 border border-transparent bg-tint/10" />
              ))}

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
                          {dateMeta.total} {dateMeta.total === 1 ? 'slot' : 'slots'}
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

          {/* Selected Day Timetable Detail (5 cols) */}
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

                    <div className="pt-2 border-t border-rule-soft flex items-center justify-between font-mono text-xs">
                      <span className="text-ink-3 text-[11px]">
                        DEPT: {session.departmentCode} • CAT: {session.category.toUpperCase()}
                      </span>

                      {session.status === 'open' ? (
                        <button
                          type="button"
                          onClick={() => handleClaimSlot(session)}
                          className="px-3 py-1 bg-signal text-white font-bold uppercase text-[10px] hover:opacity-90 inline-flex items-center space-x-1"
                        >
                          <span>Claim Slot</span>
                          <span aria-hidden="true">&rarr;</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-ink-3">
                          {session.studentName ? `Booked by ${session.studentName}` : 'Reserved'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {daySchedule.length === 0 && (
                <div className="p-8 border border-rule text-center bg-tint/10 font-mono text-xs text-ink-3 space-y-2">
                  <span className="text-signal font-bold block">NO SCHEDULED EVENTS</span>
                  <p>No active sessions or open benches recorded for {selectedDayName}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DAY TIMELINE VIEW */}
      {viewMode === 'day' && (
        <div className="border border-rule bg-paper p-5 space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule-soft pb-3">
            <div>
              <span className="text-signal font-bold uppercase text-[10px]">HOURLY FACILITY TIMELINE</span>
              <h2 className="text-base font-bold text-ink mt-0.5">{selectedDayName} (08:00 – 20:00)</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedDayNumber((p) => Math.max(1, p - 1))}
                className="px-2 py-1 border border-rule hover:bg-tint"
              >
                &larr; Prev Day
              </button>
              <button
                type="button"
                onClick={() => setSelectedDayNumber((p) => Math.min(totalDays, p + 1))}
                className="px-2 py-1 border border-rule hover:bg-tint"
              >
                Next Day &rarr;
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((hour) => {
              const matchedSessions = daySchedule.filter(
                (s) => s.startTime <= hour && s.endTime > hour
              );

              return (
                <div key={hour} className="grid grid-cols-12 gap-3 p-3 border border-rule-soft bg-tint/20 items-center">
                  <div className="col-span-2 font-bold text-ink text-sm">{hour}</div>
                  <div className="col-span-10 flex flex-wrap gap-2">
                    {matchedSessions.length > 0 ? (
                      matchedSessions.map((s) => (
                        <div
                          key={s.id}
                          className={`p-2 border text-xs flex-1 min-w-[200px] ${
                            s.status === 'open'
                              ? 'border-signal bg-signal/10 text-signal font-bold'
                              : 'border-ink bg-paper text-ink'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{s.resourceName}</span>
                            <span>{s.startTime}–{s.endTime}</span>
                          </div>
                          <span className="text-[10px] text-ink-3 block mt-0.5">{s.roomNumber} • {s.projectTitle}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-ink-3 text-xs italic py-1">Open facility capacity across laboratories</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="border border-rule bg-paper p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-rule-soft pb-3">
            <h2 className="text-base font-bold text-ink uppercase">
              Chronological Agenda ({filteredSchedule.length} Sessions across November)
            </h2>
            <span className="text-ink-3 text-xs">Zero double-bookings</span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredSchedule.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-ink transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-ink">{item.dateStr}</span>
                    <span className="text-ink-3">({item.dayOfWeek})</span>
                    <span className="text-signal font-semibold">{item.startTime} — {item.endTime}</span>
                  </div>
                  <div className="text-sm font-bold text-ink">{item.resourceName}</div>
                  <div className="text-ink-3 text-[11px]">{item.labName} • {item.roomNumber}</div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 border text-[10px] uppercase font-bold ${
                      item.status === 'open'
                        ? 'border-signal bg-signal text-white'
                        : 'border-ink bg-tint text-ink'
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => handleClaimSlot(item)}
                      className="px-3 py-1 bg-ink text-paper hover:bg-signal font-semibold text-[10px] uppercase"
                    >
                      Book &rarr;
                    </button>
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
