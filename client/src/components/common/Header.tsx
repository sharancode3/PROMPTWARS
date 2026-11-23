import { useScenario, DemoRole } from '../../context/ScenarioContext.js';
import { ThemeToggle } from './ThemeToggle.js';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenMobileMenu: () => void;
}

export function Header({ theme, toggleTheme, onOpenMobileMenu }: HeaderProps) {
  const { role, setRole, resetScenario } = useScenario();

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur-sm border-b border-rule">
      {/* Top Banner Notice: Calm Demo Indicator */}
      <div className="bg-tint/60 border-b border-rule-soft px-4 py-1.5 text-xs font-mono flex items-center justify-between text-ink-2">
        <div className="flex items-center space-x-2 truncate">
          <span className="inline-block w-2 h-2 bg-signal shrink-0" aria-hidden="true" />
          <span className="font-semibold text-ink">DEMO MODE:</span>
          <span className="truncate">No login required • Pure deterministic allocation engine • Asia/Kolkata</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-xs shrink-0">
          <button
            onClick={() => resetScenario()}
            className="text-ink-2 hover:text-signal hover:underline transition-colors focus-visible:outline-none"
            title="Reset scenario to clean initial seed state"
          >
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* Main Top Action Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Mobile menu hamburger toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 border border-rule hover:bg-tint text-ink focus-visible:outline-none"
            aria-label="Open sidebar menu"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Platform Tagline / Context Breadcrumb */}
          <div className="hidden sm:flex items-center space-x-2 font-mono text-xs text-ink-3">
            <span className="font-semibold text-ink">LabLink Campus System</span>
            <span>/</span>
            <span className="text-signal">Inter-Department Allocation</span>
          </div>
        </div>

        {/* Right side controls: Role Switcher & Theme Toggle */}
        <div className="flex items-center space-x-3">
          {/* Role Switcher Pill */}
          <div className="flex items-center border border-rule p-0.5 bg-tint text-xs font-mono" role="group" aria-label="Role Switcher">
            <span className="text-ink-3 px-2 text-[10px] uppercase hidden md:inline">ROLE:</span>
            {(['student', 'faculty', 'admin'] as DemoRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`px-2.5 py-1 text-xs uppercase font-medium transition-colors focus-visible:outline-none ${
                  role === r
                    ? 'bg-ink text-paper font-bold shadow-xs'
                    : 'text-ink-2 hover:text-ink'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Geometric Theme Toggle */}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </header>
  );
}
