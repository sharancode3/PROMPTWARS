import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import { StatusGlyph } from '../components/common/StatusGlyph.js';

export function HomePage() {
  const navigate = useNavigate();
  const { scenario } = useScenario();

  const totalEquipment = scenario.resources.length;
  const totalDepartments = scenario.departments.length;
  const totalBookings = scenario.bookings.length;
  const pendingRequests = scenario.requests.filter((r) => r.status === 'submitted' || r.status === 'under-review').length;
  const totalLabs = (scenario.labs || []).length;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-rule pb-12 pt-4">
        {/* Left Rail (25%) */}
        <div className="md:col-span-1">
          <span className="font-mono text-signal text-xl font-bold">01</span>
          <h1 className="text-3xl font-bold tracking-tight mt-2 text-ink">
            Shared labs, fairly allocated.
          </h1>
          <div className="mt-4 inline-block font-mono text-xs px-2.5 py-1 border border-rule-soft bg-tint text-ink-2">
            Campus Time: Asia/Kolkata
          </div>
        </div>

        {/* Right Content (75%) */}
        <div className="md:col-span-3 space-y-6">
          <p className="text-lg text-ink-2 max-w-2xl leading-relaxed">
            LabLink enables university students to discover and book scarce cross-department lab equipment, dev kits, and workstations. When project deadlines collide, LabLink arbitrates using a deterministic, transparent fairness policy.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/conflicts')}
              className="bg-signal text-white font-semibold px-6 py-3.5 border border-signal hover:opacity-95 flex items-center space-x-2 transition-all shadow-sm"
            >
              <span>Run the conflict demo</span>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="2" y1="8" x2="14" y2="8" />
                <polyline points="9 3 14 8 9 13" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/discover')}
              className="bg-transparent text-ink font-semibold px-6 py-3.5 border border-rule hover:bg-tint flex items-center space-x-2 transition-colors"
            >
              <span>Discover equipment</span>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="2" y1="8" x2="14" y2="8" />
                <polyline points="9 3 14 8 9 13" />
              </svg>
            </button>
          </div>

          <div className="p-4 bg-tint border border-rule-soft font-mono text-xs text-ink-2 flex items-center space-x-3">
            <span className="w-2.5 h-2.5 bg-signal shrink-0" aria-hidden="true" />
            <span>
              <strong>60-Second Evaluator Flow:</strong> Click "Run the conflict demo" to view 2 students competing for NVIDIA Jetson Orin on Day 2. Click "Resolve with LabLink" to see deterministic scores, alternatives, and apply allocations.
            </span>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 border border-rule divide-x divide-y md:divide-y-0 divide-rule bg-paper">
        <div className="p-6">
          <span className="text-xs uppercase font-mono tracking-wider text-ink-3">Equipment Listed</span>
          <div className="text-3xl font-bold font-mono mt-1 text-ink">{totalEquipment} Units</div>
          <span className="text-[11px] text-ink-3 font-mono mt-1 block">{totalLabs} Registered Laboratories</span>
        </div>
        <div className="p-6">
          <span className="text-xs uppercase font-mono tracking-wider text-ink-3">Academic Faculties</span>
          <div className="text-3xl font-bold font-mono mt-1 text-ink">{totalDepartments} Depts</div>
          <span className="text-[11px] text-ink-3 font-mono mt-1 block">{scenario.departments.map(d => d.code).join(', ')}</span>
        </div>
        <div className="p-6">
          <span className="text-xs uppercase font-mono tracking-wider text-ink-3">Confirmed Bookings</span>
          <div className="text-3xl font-bold font-mono mt-1 text-ink">{totalBookings} Active</div>
          <span className="text-[11px] text-ink-3 font-mono mt-1 block">Zero double bookings</span>
        </div>
        <div className="p-6">
          <span className="text-xs uppercase font-mono tracking-wider text-ink-3">Contested Queue</span>
          <div className="text-3xl font-bold font-mono mt-1 text-signal">{pendingRequests} Pending</div>
          <span className="text-[11px] text-ink-3 font-mono mt-1 block">Requires arbitration</span>
        </div>
      </section>

      {/* Golden Demo 4-Step Walkthrough */}
      <section className="space-y-6 pt-4">
        <div className="border-b border-rule pb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-ink font-mono uppercase">
            End-to-End System Walkthrough
          </h2>
          <span className="text-xs font-mono text-ink-3">Deterministic &bull; Auditable &bull; WCAG AA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div
            onClick={() => navigate('/discover')}
            className="p-6 border border-rule hover:border-signal cursor-pointer transition-colors bg-paper space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-signal">STEP 01</span>
              <StatusGlyph status="available" />
            </div>
            <h3 className="font-bold text-base text-ink group-hover:text-signal transition-colors">
              Equipment Discovery
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed">
              Find logic analyzers, GPU clusters, 3D printers, and edge AI dev kits across departments with capability filters and safety prerequisites.
            </p>
          </div>

          <div
            onClick={() => navigate('/request')}
            className="p-6 border border-rule hover:border-signal cursor-pointer transition-colors bg-paper space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-signal">STEP 02</span>
              <StatusGlyph status="submitted" />
            </div>
            <h3 className="font-bold text-base text-ink group-hover:text-signal transition-colors">
              AI-Assisted Request Intake
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed">
              Describe project requirements in natural language. Gemini Flash extracts technical capabilities and pre-fills structured requests.
            </p>
          </div>

          <div
            onClick={() => navigate('/conflicts')}
            className="p-6 border-2 border-signal cursor-pointer transition-all bg-tint space-y-3 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-signal">STEP 03 &bull; STAR</span>
              <StatusGlyph status="contested" />
            </div>
            <h3 className="font-bold text-base text-signal group-hover:opacity-90 transition-colors">
              Fair Conflict Arbitration
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed">
              Mathematical allocation based on deadline urgency (50%), fair-share usage (30%), and waiting time (20%). Generates feasible alternatives.
            </p>
          </div>

          <div
            onClick={() => navigate('/approvals')}
            className="p-6 border border-rule hover:border-signal cursor-pointer transition-colors bg-paper space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-signal">STEP 04</span>
              <StatusGlyph status="under-review" />
            </div>
            <h3 className="font-bold text-base text-ink group-hover:text-signal transition-colors">
              Faculty Approvals
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed">
              Faculty advisors review safety certifications, verify project justification, and approve bookings with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Operations & Management Tools */}
      <section className="space-y-6 pt-2 border-t border-rule">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-ink font-mono uppercase">
            Campus Operations & Specialized Tooling
          </h2>
          <span className="text-xs font-mono text-ink-3">Live Facility Management</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/timetable')}
            className="p-5 border border-rule hover:border-ink cursor-pointer transition-colors bg-paper space-y-2 group"
          >
            <div className="text-xs font-mono text-signal uppercase font-semibold">SCHEDULE • TIMETABLE</div>
            <h3 className="font-bold text-base text-ink group-hover:text-signal transition-colors">
              Campus Lab Timetable
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed">
              Track open walk-in benches, scheduled capstone blocks, and departmental priority hours Mon–Sat.
            </p>
          </div>

          <div
            onClick={() => navigate('/labs')}
            className="p-5 border border-rule hover:border-ink cursor-pointer transition-colors bg-paper space-y-2 group"
          >
            <div className="text-xs font-mono text-signal uppercase font-semibold">06 LABS</div>
            <h3 className="font-bold text-base text-ink group-hover:text-signal transition-colors">
              University Labs Directory
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed">
              Browse {totalLabs} research laboratories, room locations, coordinators, and facility guidelines.
            </p>
          </div>

          <div
            onClick={() => navigate('/bookings')}
            className="p-5 border border-rule hover:border-ink cursor-pointer transition-colors bg-paper space-y-2 group"
          >
            <div className="text-xs font-mono text-signal uppercase font-semibold">07 BOOKINGS</div>
            <h3 className="font-bold text-base text-ink group-hover:text-signal transition-colors">
              Active Bookings &amp; Check-In
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed">
              Live schedule audit trail, check-in window validation, and waitlist promotion.
            </p>
          </div>

          <div
            onClick={() => navigate('/insights')}
            className="p-5 border border-rule hover:border-ink cursor-pointer transition-colors bg-paper space-y-2 group"
          >
            <div className="text-xs font-mono text-signal uppercase font-semibold">09 INSIGHTS</div>
            <h3 className="font-bold text-base text-ink group-hover:text-signal transition-colors">
              Utilisation Telemetry
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed">
              Cross-department load tracking, idle bench rebalancing, and data-derived capacity analytics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
