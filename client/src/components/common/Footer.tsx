import { useScenario } from '../../context/ScenarioContext.js';

export function Footer() {
  const { scenario, resetScenario } = useScenario();

  return (
    <footer className="border-t border-rule bg-paper text-ink mt-20 font-mono text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="font-bold text-sm text-ink mb-2">LabLink Platform</div>
          <p className="text-ink-3 leading-relaxed">
            GenAI-assisted campus laboratory resource-sharing platform. Built for PromptWars Hackathon.
          </p>
          <div className="mt-3 text-[11px] text-ink-3">
            Last Reset: {new Date(scenario.lastResetAt).toLocaleTimeString()}
          </div>
        </div>

        <div>
          <div className="font-bold text-sm text-ink mb-2">Golden Path</div>
          <ul className="space-y-1.5 text-ink-2">
            <li>01. Home &amp; Metrics</li>
            <li>02. Discover Equipment</li>
            <li>03. Structured Request (AI)</li>
            <li>04. Conflict Arbitration (Demo)</li>
            <li>05. Faculty Approvals</li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-sm text-ink mb-2">Architecture Standards</div>
          <ul className="space-y-1.5 text-ink-2">
            <li>WCAG 2.2 AA Contrast &amp; Focus</li>
            <li>100% Custom Inline SVG (No Emojis)</li>
            <li>Half-Open Intervals [start, end)</li>
            <li>Deterministic Fairness Engine</li>
            <li>Stateless Cloud Run Resiliency</li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-sm text-ink mb-2">Evaluator Quick Controls</div>
          <p className="text-ink-3 mb-3">
            State is persisted in browser localStorage across role switches.
          </p>
          <button
            onClick={() => resetScenario()}
            className="w-full bg-tint hover:bg-rule-soft text-ink border border-rule px-3 py-2 font-semibold uppercase text-center"
          >
            Reset Seed Data
          </button>
        </div>
      </div>
      <div className="border-t border-rule-soft py-3 px-4 text-center text-ink-3 text-[11px]">
        Designed with Swiss Minimalism &amp; Playful Geometry. Node 22 + React 18 + Vite + Tailwind CSS.
      </div>
    </footer>
  );
}
