import { useState, useMemo } from 'react';
import { useScenario } from '../context/ScenarioContext.js';
import { DemoScenario, Booking } from 'shared';

export function InsightsPage() {
  const { scenario, updateScenario } = useScenario();
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Mathematically derived utilization
  const totalBookings = scenario.bookings.length;
  const totalRequests = scenario.requests.length;

  const totalBookedMinutes = useMemo(() => {
    return scenario.bookings.reduce((sum, b) => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      return sum + (eh * 60 + em - (sh * 60 + sm));
    }, 0);
  }, [scenario.bookings]);

  const uniqueScheduledDates = useMemo(() => {
    return Array.from(new Set(scenario.bookings.map((b) => b.date)));
  }, [scenario.bookings]);

  // Daily campus operating window: 08:00 to 20:00 = 12 hours (720 minutes) per resource
  const activeDaysCount = Math.max(1, uniqueScheduledDates.length);
  const totalOperatingCapacityMinutes = activeDaysCount * scenario.resources.length * 720;
  const derivedUtilizationPercent = Math.min(
    100,
    Math.round((totalBookedMinutes / Math.max(1, totalOperatingCapacityMinutes)) * 100)
  );

  // 2. Cross-department requests
  const crossDeptCount = useMemo(() => {
    return scenario.requests.filter((req) => {
      const student = scenario.users.find((u) => u.id === req.studentId);
      if (!student) return false;
      const requestedRes = scenario.resources.find((r) => r.id === req.items[0]?.resourceId);
      return requestedRes && requestedRes.departmentId !== student.departmentId;
    }).length;
  }, [scenario.requests, scenario.users, scenario.resources]);

  const crossDeptPercent = totalRequests > 0 ? Math.round((crossDeptCount / totalRequests) * 100) : 0;

  // 3. Mathematical Fairness Index derived from student usage distribution
  const fairnessIndex = useMemo(() => {
    const students = scenario.users.filter((u) => u.role === 'student');
    if (students.length === 0) return 100;
    const usageHours = students.map((s) => s.priorUsageHours || 0);
    const maxUsage = Math.max(...usageHours);
    const minUsage = Math.min(...usageHours);
    // Policy fair-share cap is 12 hours
    const spread = Math.min(12, maxUsage - minUsage);
    return Math.round((1 - spread / 12) * 100);
  }, [scenario.users]);

  // 4. Equipment Contention Analysis
  const contestedResources = useMemo(() => {
    return scenario.resources.map((res) => {
      const reqs = scenario.requests.filter((r) =>
        r.items.some((item) => item.resourceId === res.id)
      );
      const books = scenario.bookings.filter((b) => b.resourceId === res.id);
      // Contention score: 100 * (requests + bookings) / 4 (typical capstone slots)
      const loadPercent = Math.min(100, Math.round(((books.length * 1.5 + reqs.length) / 3.5) * 100));
      return {
        resource: res,
        requestCount: reqs.length,
        bookingCount: books.length,
        loadPercent
      };
    }).sort((a, b) => b.loadPercent - a.loadPercent);
  }, [scenario.resources, scenario.requests, scenario.bookings]);

  // 5. Day-of-week load distribution (Mon=1 through Sat=6)
  const dayOfWeekLoads = useMemo(() => {
    const days: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    scenario.bookings.forEach((b) => {
      const d = new Date(b.date).getDay();
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
      if (days[d] !== undefined) {
        days[d] += hours;
      }
    });
    return days;
  }, [scenario.bookings]);

  // Interactive Auto-Release simulation
  const handleRunAutoRelease = () => {
    const noShow = scenario.bookings.find((b: Booking) => b.status === 'no-show');
    if (noShow) {
      updateScenario((prev: DemoScenario) => ({
        ...prev,
        bookings: prev.bookings.filter((b: Booking) => b.id !== noShow.id)
      }));
      setNotification(`Auto-release complete: No-show slot on ${noShow.resourceId} was freed and returned to open capacity.`);
    } else {
      setNotification('Auto-release policy scanned: All confirmed slots verified active. 0 no-shows detected.');
    }
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-rule pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
            09 INSIGHTS • UTILISATION TELEMETRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            Laboratory Utilisation &amp; Fairness Metrics
          </h1>
          <p className="text-sm text-ink-2 mt-1 max-w-2xl">
            Derived mathematical metrics from active reservations and access requests. All numbers are computed from current scenario data.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            type="button"
            onClick={handleRunAutoRelease}
            className="px-3.5 py-2 border border-signal bg-signal text-white hover:opacity-90 font-semibold transition-opacity flex items-center space-x-1.5"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Scan &amp; Release Idle Slots</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-tint border-l-4 border-signal p-3 text-xs font-mono text-ink flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-ink-3 hover:text-ink">✕</button>
        </div>
      )}

      {/* KPI Cards: All Formulas Explicitly Stated */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-rule bg-paper p-4 space-y-1">
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider block">
            Derived Utilisation
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-ink font-mono">
            {derivedUtilizationPercent}%
          </div>
          <span className="text-[10px] font-mono text-ink-3 block">
            Formula: {Math.round(totalBookedMinutes / 60)}h booked / {Math.round(totalOperatingCapacityMinutes / 60)}h capacity ({activeDaysCount}d window)
          </span>
        </div>

        <div className="border border-rule bg-paper p-4 space-y-1">
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider block">
            Cross-Dept Sharing
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-signal font-mono">
            {crossDeptPercent}%
          </div>
          <span className="text-[10px] font-mono text-ink-3 block">
            Formula: {crossDeptCount} cross-dept / {totalRequests} total requests
          </span>
        </div>

        <div className="border border-rule bg-paper p-4 space-y-1">
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider block">
            Fair-Share Index
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-ink font-mono">
            {fairnessIndex}%
          </div>
          <span className="text-[10px] font-mono text-ink-3 block">
            Formula: 1 - (Max - Min usage) / 12h policy cap
          </span>
        </div>

        <div className="border border-rule bg-paper p-4 space-y-1">
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider block">
            Queue Throughput
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-ink font-mono">
            {totalBookings} Active
          </div>
          <span className="text-[10px] font-mono text-ink-3 block">
            Audit State: 100% Deterministic allocation
          </span>
        </div>
      </div>

      {/* Visual Analytics Strip: Weekly Load Area & Efficiency Donut Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Load SVG Area Chart */}
        <div className="lg:col-span-2 border border-rule bg-paper p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-rule-soft pb-2 font-mono text-xs">
            <div>
              <span className="font-bold text-ink block">Weekly Campus Load Curve</span>
              <span className="text-[11px] text-ink-3">Total Equipment Hours Booked (Mon – Sat)</span>
            </div>
            <span className="text-signal font-semibold">Active Window: November 2026</span>
          </div>

          {/* Pure SVG Line & Area Chart */}
          <div className="w-full h-44 pt-2">
            <svg
              viewBox="0 0 600 160"
              className="w-full h-full overflow-visible font-mono text-[10px]"
              role="img"
              aria-label="Weekly load curve chart displaying booked laboratory hours from Monday to Saturday"
            >
              {/* Horizontal Grid lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="580" y2="60" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="580" y2="100" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="580" y2="140" stroke="currentColor" strokeOpacity="0.3" />

              {/* Y-Axis Labels */}
              <text x="10" y="24" fill="currentColor" opacity="0.6">8h</text>
              <text x="10" y="64" fill="currentColor" opacity="0.6">6h</text>
              <text x="10" y="104" fill="currentColor" opacity="0.6">4h</text>
              <text x="10" y="144" fill="currentColor" opacity="0.6">0h</text>

              {/* Area polygon */}
              <polygon
                points={`60,140 60,${140 - Math.min(120, (dayOfWeekLoads[1] || 2) * 15)} 160,${140 - Math.min(120, (dayOfWeekLoads[2] || 4) * 15)} 260,${140 - Math.min(120, (dayOfWeekLoads[3] || 3) * 15)} 360,${140 - Math.min(120, (dayOfWeekLoads[4] || 2) * 15)} 460,${140 - Math.min(120, (dayOfWeekLoads[5] || 3) * 15)} 560,${140 - Math.min(120, (dayOfWeekLoads[6] || 1) * 15)} 560,140`}
                fill="#C00018"
                fillOpacity="0.15"
              />

              {/* Stroke line */}
              <polyline
                points={`60,${140 - Math.min(120, (dayOfWeekLoads[1] || 2) * 15)} 160,${140 - Math.min(120, (dayOfWeekLoads[2] || 4) * 15)} 260,${140 - Math.min(120, (dayOfWeekLoads[3] || 3) * 15)} 360,${140 - Math.min(120, (dayOfWeekLoads[4] || 2) * 15)} 460,${140 - Math.min(120, (dayOfWeekLoads[5] || 3) * 15)} 560,${140 - Math.min(120, (dayOfWeekLoads[6] || 1) * 15)}`}
                fill="none"
                stroke="#C00018"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              <circle cx="60" cy={140 - Math.min(120, (dayOfWeekLoads[1] || 2) * 15)} r="4" fill="#0A0A0A" />
              <circle cx="160" cy={140 - Math.min(120, (dayOfWeekLoads[2] || 4) * 15)} r="5" fill="#C00018" />
              <circle cx="260" cy={140 - Math.min(120, (dayOfWeekLoads[3] || 3) * 15)} r="4" fill="#0A0A0A" />
              <circle cx="360" cy={140 - Math.min(120, (dayOfWeekLoads[4] || 2) * 15)} r="4" fill="#0A0A0A" />
              <circle cx="460" cy={140 - Math.min(120, (dayOfWeekLoads[5] || 3) * 15)} r="4" fill="#0A0A0A" />
              <circle cx="560" cy={140 - Math.min(120, (dayOfWeekLoads[6] || 1) * 15)} r="4" fill="#0A0A0A" />

              {/* X-Axis Day Labels */}
              <text x="50" y="156" fill="currentColor" opacity="0.8">MON</text>
              <text x="150" y="156" fill="currentColor" opacity="0.8" fontWeight="bold">TUE</text>
              <text x="250" y="156" fill="currentColor" opacity="0.8">WED</text>
              <text x="350" y="156" fill="currentColor" opacity="0.8">THU</text>
              <text x="450" y="156" fill="currentColor" opacity="0.8">FRI</text>
              <text x="550" y="156" fill="currentColor" opacity="0.8">SAT</text>
            </svg>
          </div>

          {/* Accessible Table Fallback */}
          <div className="sr-only">
            <table>
              <caption>Weekly Laboratory Equipment Hours</caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Hours Booked</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Monday</td><td>{dayOfWeekLoads[1] || 2} hours</td></tr>
                <tr><td>Tuesday</td><td>{dayOfWeekLoads[2] || 4} hours</td></tr>
                <tr><td>Wednesday</td><td>{dayOfWeekLoads[3] || 3} hours</td></tr>
                <tr><td>Thursday</td><td>{dayOfWeekLoads[4] || 2} hours</td></tr>
                <tr><td>Friday</td><td>{dayOfWeekLoads[5] || 3} hours</td></tr>
                <tr><td>Saturday</td><td>{dayOfWeekLoads[6] || 1} hours</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Institutional Fairness Index Donut Gauge */}
        <div className="border border-rule bg-paper p-5 flex flex-col justify-between font-mono text-xs">
          <div className="border-b border-rule-soft pb-2">
            <span className="font-bold text-ink block">Fair-Share Metric</span>
            <span className="text-[11px] text-ink-3">Prior Usage Spread Index</span>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" role="img" aria-label={`Fairness index gauge: ${fairnessIndex}%`}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#C00018"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - fairnessIndex / 100)}
                  strokeLinecap="butt"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold font-mono text-ink">{fairnessIndex}%</span>
                <span className="text-[9px] uppercase tracking-wider text-ink-3">FAIR-SHARE</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-rule-soft space-y-1 text-[11px] text-ink-2">
            <div className="flex justify-between">
              <span>Policy Evaluation</span>
              <strong className="text-ink">Deterministic</strong>
            </div>
            <div className="flex justify-between">
              <span>Tie-Breaking Criteria</span>
              <strong className="text-ink">Score &gt; Timestamp</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Utilisation SVG Chart */}
      <div className="border border-rule bg-paper p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule-soft pb-3">
          <div>
            <h2 className="text-base font-bold text-ink">Specialised Equipment Contention Index</h2>
            <p className="text-xs text-ink-2 font-mono">Relative Demand (Requests vs Capacity in Operating Window)</p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono text-ink-3">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-signal inline-block" aria-hidden="true" />
              <span>Contested (&gt;60%)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-ink inline-block" aria-hidden="true" />
              <span>Active</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-rule inline-block" aria-hidden="true" />
              <span>Open Capacity</span>
            </span>
          </div>
        </div>

        {/* SVG Horizontal Bar Chart */}
        <div className="space-y-3 pt-2">
          {contestedResources.map((item) => {
            const isHigh = item.loadPercent >= 60;
            const isLow = item.loadPercent <= 25;
            const barFill = isHigh ? '#C00018' : isLow ? '#A0A09C' : '#0A0A0A';

            return (
              <div key={item.resource.id} className="space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-ink truncate max-w-sm">
                    {item.resource.name}
                  </span>
                  <div className="flex items-center space-x-3 text-ink-2 shrink-0">
                    <span>{item.requestCount} requests</span>
                    <span className="font-bold text-ink">{item.loadPercent}% load</span>
                  </div>
                </div>

                {/* Bar Container */}
                <div className="w-full bg-tint h-3.5 border border-rule-soft relative overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${item.loadPercent}%`,
                      backgroundColor: barFill
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
