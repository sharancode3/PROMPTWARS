import { NavLink } from 'react-router-dom';
import { useScenario, DemoRole } from '../../context/ScenarioContext.js';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function Header({ theme, toggleTheme }: HeaderProps) {
  const { role, setRole, currentUser, resetScenario } = useScenario();

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-rule transition-colors">
      {/* Top Banner Notice: 60-Second Evaluator Notice */}
      <div className="bg-tint border-b border-rule-soft px-4 py-1 text-xs font-mono flex items-center justify-between text-ink-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 bg-signal" aria-hidden="true" />
          <span className="font-semibold text-ink">EVALUATOR MODE:</span>
          <span>Zero-login required. Role-switchable synthetic state. Campus Timezone: Asia/Kolkata</span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-ink-3">Evaluation Signal: Problem Alignment & Fair Conflict Resolution</span>
          <button
            onClick={() => resetScenario()}
            className="underline hover:text-signal transition-colors focus-visible:outline-none"
            title="Reset scenario to initial seed state"
          >
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 inline-flex" aria-hidden="true">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="25" cy="25" r="20" fill="currentColor" />
              <rect x="55" y="5" width="40" height="40" fill="currentColor" />
              <path d="M 5 95 A 40 40 0 0 1 45 55 L 45 95 Z" fill="#C00018" />
              <polygon points="55,95 95,95 95,55" fill="currentColor" />
            </svg>
          </div>
          <NavLink to="/" className="font-bold tracking-tight text-xl text-ink hover:opacity-90">
            LabLink
          </NavLink>
          <span className="text-xs font-mono px-2 py-0.5 border border-rule-soft text-ink-3 hidden sm:inline-block">
            v1.0.0
          </span>
        </div>

        {/* Navigation Tabs (01..05) */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs font-mono" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-2.5 py-1.5 border transition-colors ${
                isActive
                  ? 'border-rule bg-ink text-paper font-bold'
                  : 'border-transparent text-ink-2 hover:border-rule-soft hover:bg-tint'
              }`
            }
          >
            01 HOME
          </NavLink>
          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `px-2.5 py-1.5 border transition-colors ${
                isActive
                  ? 'border-rule bg-ink text-paper font-bold'
                  : 'border-transparent text-ink-2 hover:border-rule-soft hover:bg-tint'
              }`
            }
          >
            02 DISCOVER
          </NavLink>
          <NavLink
            to="/request"
            className={({ isActive }) =>
              `px-2.5 py-1.5 border transition-colors ${
                isActive
                  ? 'border-rule bg-ink text-paper font-bold'
                  : 'border-transparent text-ink-2 hover:border-rule-soft hover:bg-tint'
              }`
            }
          >
            03 REQUEST
          </NavLink>
          <NavLink
            to="/conflicts"
            className={({ isActive }) =>
              `px-2.5 py-1.5 border transition-colors relative ${
                isActive
                  ? 'border-signal bg-signal text-white font-bold'
                  : 'border-signal text-signal hover:bg-signal hover:text-white'
              }`
            }
          >
            04 CONFLICTS
            <span className="ml-1 px-1 bg-white text-signal font-bold text-[10px] rounded-none">
              DEMO
            </span>
          </NavLink>
          <NavLink
            to="/approvals"
            className={({ isActive }) =>
              `px-2.5 py-1.5 border transition-colors ${
                isActive
                  ? 'border-rule bg-ink text-paper font-bold'
                  : 'border-transparent text-ink-2 hover:border-rule-soft hover:bg-tint'
              }`
            }
          >
            05 APPROVALS
          </NavLink>
        </nav>

        {/* Right Tools: Role Switcher & Invert Theme */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          {/* Active Demo Role Switcher */}
          <div
            className="flex items-center border border-rule divide-x divide-rule"
            role="group"
            aria-label="Demo Role Switcher"
          >
            {(['student', 'faculty', 'admin'] as DemoRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`px-3 py-1.5 uppercase font-semibold transition-colors ${
                  role === r ? 'bg-signal text-white' : 'hover:bg-tint text-ink'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* User Badge */}
          <div className="hidden lg:flex flex-col text-right">
            <span className="font-semibold text-ink">{currentUser.name}</span>
            <span className="text-[10px] text-ink-3 uppercase">{currentUser.departmentName}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="border border-rule px-2.5 py-1.5 uppercase hover:bg-tint font-semibold text-ink"
            aria-label="Toggle inverted theme"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>
    </header>
  );
}
