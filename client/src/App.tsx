import { useState } from 'react';

export default function App() {
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors duration-200">
      {/* Top Bar with 1px hairline rule */}
      <header className="sticky top-0 z-50 bg-paper border-b border-rule px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 inline-flex">
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
              <circle cx="25" cy="25" r="20" fill="currentColor" />
              <rect x="55" y="5" width="40" height="40" fill="currentColor" />
              <path d="M 5 95 A 40 40 0 0 1 45 55 L 45 95 Z" fill="#C00018" />
              <polygon points="55,95 95,95 95,55" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold tracking-tight text-lg">LabLink</span>
        </div>

        {/* Demo Role Switcher & Invert Toggle */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center border border-rule divide-x divide-rule">
            <button
              onClick={() => setRole('student')}
              className={`px-3 py-1.5 uppercase font-semibold transition-colors ${role === 'student' ? 'bg-signal text-white' : 'hover:bg-tint'}`}
            >
              Student
            </button>
            <button
              onClick={() => setRole('faculty')}
              className={`px-3 py-1.5 uppercase font-semibold transition-colors ${role === 'faculty' ? 'bg-signal text-white' : 'hover:bg-tint'}`}
            >
              Faculty
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`px-3 py-1.5 uppercase font-semibold transition-colors ${role === 'admin' ? 'bg-signal text-white' : 'hover:bg-tint'}`}
            >
              Admin
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="border border-rule px-2.5 py-1.5 uppercase hover:bg-tint"
            aria-label="Toggle inverted theme"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-rule pb-12">
          {/* Left Rail (25%) */}
          <div className="md:col-span-1">
            <span className="font-mono text-signal text-xl font-bold">01</span>
            <h1 className="text-3xl font-bold tracking-tight mt-2">Shared labs, fairly allocated.</h1>
          </div>

          {/* Right Content (75%) */}
          <div className="md:col-span-3 space-y-6">
            <p className="text-lg text-ink-2 max-w-2xl leading-relaxed">
              LabLink helps students discover and access specialized university equipment across departments, books intelligent conflict-free slots, and equips faculty with transparent arbitration.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button className="bg-signal text-white font-semibold px-6 py-3 border border-signal hover:opacity-90 flex items-center space-x-2">
                <span>Run the conflict demo</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
              <button className="bg-transparent text-ink font-semibold px-6 py-3 border border-rule hover:bg-tint flex items-center space-x-2">
                <span>Explore equipment</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 border-b border-rule divide-x divide-y md:divide-y-0 divide-rule mt-8">
          <div className="p-6">
            <span className="text-xs uppercase font-mono tracking-wider text-ink-3">Equipment Listed</span>
            <div className="text-3xl font-bold font-mono mt-1">28 Units</div>
          </div>
          <div className="p-6">
            <span className="text-xs uppercase font-mono tracking-wider text-ink-3">Departments</span>
            <div className="text-3xl font-bold font-mono mt-1">5 Faculties</div>
          </div>
          <div className="p-6">
            <span className="text-xs uppercase font-mono tracking-wider text-ink-3">Open Requests</span>
            <div className="text-3xl font-bold font-mono mt-1">14 Pending</div>
          </div>
          <div className="p-6">
            <span className="text-xs uppercase font-mono tracking-wider text-ink-3">Utilisation</span>
            <div className="text-3xl font-bold font-mono mt-1 text-signal">78.4%</div>
          </div>
        </section>
      </main>
    </div>
  );
}
