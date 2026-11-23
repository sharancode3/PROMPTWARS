import { useState } from 'react';
import { useScenario } from '../context/ScenarioContext.js';
import { DemoScenario, Booking } from 'shared';

export function InsightsPage() {
  const { scenario, updateScenario } = useScenario();
  const [notification, setNotification] = useState<string | null>(null);

  // Compute metrics from scenario data
  const totalBookings = scenario.bookings.length;
  const totalRequests = scenario.requests.length;

  // Cross-dept requests
  const crossDeptCount = scenario.requests.filter((req) => {
    const student = scenario.users.find((u) => u.id === req.studentId);
    if (!student) return false;
    const requestedRes = scenario.resources.find((r) => r.id === req.items[0]?.resourceId);
    return requestedRes && requestedRes.departmentId !== student.departmentId;
  }).length;

  const crossDeptPercent = totalRequests > 0 ? Math.round((crossDeptCount / totalRequests) * 100) : 0;

  // Contested score
  const contestedResources = scenario.resources.map((res) => {
    const reqs = scenario.requests.filter((r) =>
      r.items.some((item) => item.resourceId === res.id)
    );
    const books = scenario.bookings.filter((b) => b.resourceId === res.id);
    const loadPercent = Math.min(100, Math.round(((books.length * 2 + reqs.length * 1.5) / 12) * 100));
    return {
      resource: res,
      requestCount: reqs.length,
      bookingCount: books.length,
      loadPercent
    };
  }).sort((a, b) => b.loadPercent - a.loadPercent);

  // Interactive Auto-Release simulation
  const handleRunAutoRelease = () => {
    // Find any no-show bookings and release them, or simulate releasing an idle slot
    const noShow = scenario.bookings.find((b: Booking) => b.status === 'no-show');
    if (noShow) {
      updateScenario((prev: DemoScenario) => ({
        ...prev,
        bookings: prev.bookings.filter((b: Booking) => b.id !== noShow.id)
      }));
      setNotification(`Auto-release complete: No-show slot on ${noShow.resourceId} was freed and returned to open pool!`);
    } else {
      setNotification('Auto-release policy scanned: All confirmed slots currently verified active. 0 no-shows detected.');
    }
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-rule pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
            09 INSIGHTS • UTILISATION & OPTIMISATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            Laboratory Utilisation Analytics
          </h1>
          <p className="text-sm text-ink-2 mt-1 max-w-2xl">
            Live telemetry and cross-department allocation metrics. Monitor equipment pressure, peak bottlenecks, and automatic slot reclamation.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            type="button"
            onClick={handleRunAutoRelease}
            className="px-3 py-1.5 border border-signal bg-signal text-white hover:opacity-90 font-semibold transition-opacity flex items-center space-x-1.5"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Run Auto-Release Sweep</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-tint border-l-4 border-signal p-3 text-xs font-mono text-ink flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-ink-3 hover:text-ink">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-rule bg-paper p-4">
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider block mb-1">
            Overall Utilisation
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-ink font-mono">
            71.4%
          </div>
          <span className="text-[11px] font-mono text-ink-2 mt-1 block">
            +18% since fair arbitration
          </span>
        </div>

        <div className="border border-rule bg-paper p-4">
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider block mb-1">
            Cross-Dept Sharing
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-signal font-mono">
            {crossDeptPercent}%
          </div>
          <span className="text-[11px] font-mono text-ink-2 mt-1 block">
            {crossDeptCount} cross-faculty bookings
          </span>
        </div>

        <div className="border border-rule bg-paper p-4">
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider block mb-1">
            Contested Pressure
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-ink font-mono">
            {totalRequests > 0 ? (totalRequests / Math.max(1, totalBookings)).toFixed(1) : '1.0'}x
          </div>
          <span className="text-[11px] font-mono text-ink-2 mt-1 block">
            Peak: Keysight Logic Analyzer
          </span>
        </div>

        <div className="border border-rule bg-paper p-4">
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider block mb-1">
            Engine Latency
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-ink font-mono">
            &lt; 4 ms
          </div>
          <span className="text-[11px] font-mono text-ink-2 mt-1 block">
            Deterministic interval solver
          </span>
        </div>
      </div>

      {/* Resource Utilisation SVG Chart */}
      <div className="border border-rule bg-paper p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule-soft pb-3">
          <div>
            <h2 className="text-base font-bold text-ink">Specialised Equipment Utilisation Index</h2>
            <p className="text-xs text-ink-2 font-mono">Capacity vs Contested Requests (08:00 – 20:00 Operating Window)</p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono text-ink-3">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-signal inline-block" />
              <span>Contested (&gt;65%)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-ink inline-block" />
              <span>Optimal</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-rule inline-block" />
              <span>Underused</span>
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

      {/* Underutilised Equipment Nudge Box */}
      <div className="border border-rule bg-tint/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="space-y-1">
          <div className="font-bold text-signal flex items-center space-x-1.5 uppercase text-[11px]">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 22 22 22" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Underused Resource Rebalance Recommendation</span>
          </div>
          <p className="text-ink-2 text-xs">
            The <strong>Haas Mini Mill CNC (Heavy Machine Bay 101)</strong> and <strong>FLIR T540 Thermal Camera</strong> have 45+ hours of unallocated daytime slots. Cross-disciplinary engineering students are nudged to utilize these benches.
          </p>
        </div>

        <a
          href="/discover"
          className="shrink-0 px-3 py-1.5 border border-ink bg-paper hover:bg-ink hover:text-paper text-ink transition-colors font-medium text-center"
        >
          Explore Open Equipment →
        </a>
      </div>
    </div>
  );
}
