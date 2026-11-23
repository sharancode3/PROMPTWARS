import { useState } from 'react';
import { useScenario, DemoRole } from '../context/ScenarioContext.js';

export function SettingsPage() {
  const { role, setRole, resetScenario, scenario } = useScenario();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleConfirmReset = () => {
    resetScenario();
    setShowConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  const toggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    if (next) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-rule pb-5">
        <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
          10 SETTINGS • SYSTEM & ENVIRONMENT CONFIGURATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
          System Settings & Environment
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Manage evaluator demonstration state, active session roles, accessibility preferences, and AI inference fallbacks.
        </p>
      </div>

      {resetSuccess && (
        <div className="bg-tint border-l-4 border-signal p-3 text-xs font-mono text-ink flex items-center justify-between animate-fadeIn">
          <span>✓ Scenario state restored to canonical seed baseline. All test clusters ready.</span>
          <button onClick={() => setResetSuccess(false)} className="text-ink-3 hover:text-ink">✕</button>
        </div>
      )}

      {/* Section 1: Evaluator State Management */}
      <div className="border border-rule bg-paper p-5 space-y-4">
        <div className="border-b border-rule-soft pb-3">
          <h2 className="text-base font-bold text-ink">Scenario State &amp; Reset</h2>
          <p className="text-xs text-ink-2 font-mono mt-0.5">
            Reset all synthetic bookings, requests, and arbitration proposals to the initial benchmark dataset.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="space-y-1">
            <div className="text-ink font-semibold">Active Scenario Version: {scenario.version}</div>
            <div className="text-ink-3 text-[11px]">
              Last initialized: {new Date(scenario.lastResetAt).toLocaleString()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 border border-signal bg-signal/10 text-signal hover:bg-signal hover:text-white font-bold transition-colors shrink-0"
          >
            Reset Seed Data Baseline
          </button>
        </div>
      </div>

      {/* Demonstration Data Disclosure */}
      <div className="border border-rule bg-tint/30 p-4 space-y-2 font-mono text-xs">
        <div className="flex items-center space-x-2 text-ink font-bold">
          <span className="w-2 h-2 bg-signal" aria-hidden="true" />
          <h3 className="uppercase text-xs">Demonstration Data Disclosure</h3>
        </div>
        <p className="text-ink-2 font-sans text-xs leading-relaxed">
          All campus equipment records, lab operating hours, safety notes, student profiles, and reservations in LabLink are synthetic illustrative models created for hackathon evaluation. They simulate real-world university resource sharing but do not constitute official university certifications or live legal safety approvals.
        </p>
      </div>

      {/* Section 2: Demo Role Switcher */}
      <div className="border border-rule bg-paper p-5 space-y-4">
        <div className="border-b border-rule-soft pb-3">
          <h2 className="text-base font-bold text-ink">Active Session Persona</h2>
          <p className="text-xs text-ink-2 font-mono mt-0.5">
            Switch perspective without campus SSO authentication to test student request flows, faculty approvals, or admin controls.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {[
            {
              r: 'student' as DemoRole,
              title: 'Student (Alex Rivera)',
              desc: 'Submits capstone requests, views feasible equipment slots, and tracks arbitration rank.'
            },
            {
              r: 'faculty' as DemoRole,
              title: 'Faculty Advisor (Prof. Sen)',
              desc: 'Reviews pending slot requests, examines AI briefs, and issues approvals/changes.'
            },
            {
              r: 'admin' as DemoRole,
              title: 'Lab Administrator',
              desc: 'Manages multi-lab schedules, triggers conflict arbitration, and oversees equipment load.'
            }
          ].map((item) => (
            <button
              key={item.r}
              type="button"
              onClick={() => setRole(item.r)}
              className={`p-3 border text-left flex flex-col justify-between transition-colors ${
                role === item.r
                  ? 'border-ink bg-ink text-paper'
                  : 'border-rule hover:border-rule-strong bg-paper text-ink'
              }`}
            >
              <div>
                <div className="font-bold uppercase text-[11px] mb-1 flex items-center justify-between">
                  <span>{item.r}</span>
                  {role === item.r && <span className="text-signal">● ACTIVE</span>}
                </div>
                <div className={`text-xs font-semibold mb-1 ${role === item.r ? 'text-paper' : 'text-ink'}`}>
                  {item.title}
                </div>
                <p className={`text-[11px] leading-relaxed ${role === item.r ? 'text-rule' : 'text-ink-2'}`}>
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Campus Timezone & Operating Hours */}
      <div className="border border-rule bg-paper p-5 space-y-4 font-mono text-xs">
        <div className="border-b border-rule-soft pb-3">
          <h2 className="text-base font-bold text-ink font-sans">Campus Timezone & Facility Constraints</h2>
          <p className="text-xs text-ink-2 mt-0.5">
            Fixed operational constraints respected by the interval arbitration engine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 border border-rule bg-tint/30 space-y-1">
            <span className="text-[10px] text-ink-3 uppercase block">Campus Timezone</span>
            <span className="text-sm font-bold text-ink block">Asia/Kolkata (IST • UTC+05:30)</span>
            <span className="text-[11px] text-ink-2">Standardized university reference clock</span>
          </div>

          <div className="p-3 border border-rule bg-tint/30 space-y-1">
            <span className="text-[10px] text-ink-3 uppercase block">Standard Laboratory Windows</span>
            <span className="text-sm font-bold text-ink block">08:00 — 20:00 IST</span>
            <span className="text-[11px] text-ink-2">Sessions outside this window are automatically rejected</span>
          </div>
        </div>
      </div>

      {/* Section 4: AI Engine Pipeline & Safe Fallbacks */}
      <div className="border border-rule bg-paper p-5 space-y-4 font-mono text-xs">
        <div className="border-b border-rule-soft pb-3">
          <h2 className="text-base font-bold text-ink font-sans">GenAI Pipeline & Deterministic Fallbacks</h2>
          <p className="text-xs text-ink-2 mt-0.5">
            LabLink uses Gemini 2.5 Flash for natural language parsing and narration. Safe deterministic logic arbitrates allocations.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 border border-rule bg-tint/20">
            <div className="space-y-0.5">
              <span className="font-bold text-ink block">Natural Language Equipment Parser</span>
              <span className="text-[11px] text-ink-2">Model: Gemini 2.5 Flash (via official @google/genai SDK)</span>
            </div>
            <span className="px-2 py-0.5 border border-rule bg-paper text-ink font-semibold">
              Schema-Constrained
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 border border-rule bg-tint/20">
            <div className="space-y-0.5">
              <span className="font-bold text-ink block">Deterministic Fallback Mechanism</span>
              <span className="text-[11px] text-ink-2">Active when GEMINI_API_KEY is unset or upstream network is unavailable</span>
            </div>
            <span className="px-2 py-0.5 border border-signal bg-signal/10 text-signal font-bold">
              100% Operational
            </span>
          </div>
        </div>
      </div>

      {/* Section 5: Accessibility & Motion */}
      <div className="border border-rule bg-paper p-5 space-y-4 font-mono text-xs">
        <div className="border-b border-rule-soft pb-3">
          <h2 className="text-base font-bold text-ink font-sans">Accessibility (WCAG 2.2 AA)</h2>
          <p className="text-xs text-ink-2 mt-0.5">
            LabLink adheres strictly to WCAG 2.2 AA contrast, full keyboard navigation, and motion standards.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 border border-rule bg-tint/20">
          <div className="space-y-0.5">
            <span className="font-bold text-ink block">Reduce Motion Animations</span>
            <span className="text-[11px] text-ink-2">Minimizes transitions, choreography flashes, and layout transforms</span>
          </div>
          <button
            type="button"
            onClick={toggleReducedMotion}
            aria-pressed={reducedMotion}
            className={`px-3 py-1.5 border font-semibold transition-colors ${
              reducedMotion
                ? 'border-ink bg-ink text-paper'
                : 'border-rule bg-paper text-ink hover:bg-tint'
            }`}
          >
            {reducedMotion ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div
          className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-reset-title"
        >
          <div className="bg-paper border-2 border-signal max-w-md w-full p-6 space-y-4 font-mono">
            <div className="flex items-center space-x-2 text-signal">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 22 22 22" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h3 id="modal-reset-title" className="text-base font-bold text-ink">
                Confirm Scenario Reset
              </h3>
            </div>

            <p className="text-xs text-ink-2 leading-relaxed font-sans">
              Are you sure you want to restore the canonical seed dataset? This will reset all active requests, clear temporary bookings, and restore the initial 4-student conflict cluster on the Keysight Logic Analyzer.
            </p>

            <div className="pt-2 border-t border-rule flex items-center justify-end space-x-3 text-xs">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 border border-rule hover:bg-tint text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-1.5 bg-signal text-white font-bold hover:opacity-90"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
