import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import { StatusGlyph } from '../components/common/StatusGlyph.js';
import { Resource } from 'shared';

export function DiscoverPage() {
  const navigate = useNavigate();
  const { scenario, currentUser } = useScenario();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredResources = useMemo(() => {
    return scenario.resources.filter((res) => {
      if (selectedDept !== 'all' && res.departmentId !== selectedDept) {
        return false;
      }
      if (selectedCategory !== 'all' && res.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = res.name.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesLoc = res.location.toLowerCase().includes(q);
        const matchesCap = res.capabilityTags.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesLoc && !matchesCap) {
          return false;
        }
      }
      return true;
    });
  }, [scenario.resources, selectedDept, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 pt-4">
      {/* Header Rail */}
      <div className="border-b border-rule pb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <span className="font-mono text-signal text-xl font-bold">02</span>
          <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
            Discover Laboratory Resources
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Browse specialized testbenches, FPGA boards, GPU rigs, and fabrication machinery.
          </p>
        </div>

        {/* User Certification Status Pill */}
        <div className="border border-rule-soft bg-tint px-3 py-1.5 font-mono text-xs text-ink-2">
          <span>Active User Certs: </span>
          <span className="font-semibold text-ink">
            {currentUser.certifications && currentUser.certifications.length > 0
              ? currentUser.certifications.join(', ')
              : 'None'}
          </span>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex border border-rule bg-paper">
          <div className="px-4 py-3 flex items-center text-ink-3 border-r border-rule-soft font-mono text-xs">
            SEARCH
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment, capabilities (e.g. edge-ai, fpga, 3d-printing), or locations..."
            className="w-full px-4 py-3 bg-transparent text-ink placeholder-ink-3 focus:outline-none text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 text-xs font-mono text-ink-3 hover:text-ink border-l border-rule-soft"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          {/* Department Tabs */}
          <div className="flex items-center space-x-1 border border-rule-soft p-1 bg-tint">
            <span className="text-ink-3 px-2">DEPT:</span>
            {['all', 'dept_ece', 'dept_cse', 'dept_mech'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 uppercase transition-colors ${
                  selectedDept === dept
                    ? 'bg-ink text-paper font-bold'
                    : 'text-ink-2 hover:bg-paper'
                }`}
              >
                {dept === 'all'
                  ? 'All'
                  : dept === 'dept_ece'
                  ? 'ECE'
                  : dept === 'dept_cse'
                  ? 'CSE'
                  : 'Mech'}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink-3">CATEGORY:</span>
            {['all', 'compute', 'embedded', 'instrumentation', 'fabrication'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 uppercase border transition-colors ${
                  selectedCategory === cat
                    ? 'border-rule bg-ink text-paper font-semibold'
                    : 'border-rule-soft bg-paper text-ink-2 hover:border-rule'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Count Indicator */}
      <div className="flex items-center justify-between text-xs font-mono text-ink-3 border-b border-rule-soft pb-2">
        <span>Showing {filteredResources.length} of {scenario.resources.length} units</span>
        <span>Operating Hours: 08:00 &ndash; 20:00 Asia/Kolkata</span>
      </div>

      {/* Grid of Equipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map((res: Resource) => {
          const requiresCerts = res.requiresCertification || [];
          const userHasCerts = requiresCerts.every((c) =>
            currentUser.certifications?.includes(c)
          );

          return (
            <div
              key={res.id}
              className="border border-rule bg-paper p-6 space-y-4 hover:border-signal transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3 block">
                      {res.category} &bull; {res.departmentId.replace('dept_', '').toUpperCase()}
                    </span>
                    <h3 className="font-bold text-lg text-ink leading-tight mt-0.5">
                      {res.name}
                    </h3>
                  </div>
                  <StatusGlyph status={res.status === 'available' ? 'available' : 'maintenance'} />
                </div>

                <p className="text-xs text-ink-2 leading-relaxed">
                  {res.description}
                </p>

                {/* Specs Box */}
                <div className="bg-tint border border-rule-soft p-2.5 font-mono text-[11px] grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(res.specs || {}).map(([k, v]) => (
                    <div key={k} className="truncate">
                      <span className="text-ink-3">{k}: </span>
                      <span className="font-semibold text-ink">{String(v)}</span>
                    </div>
                  ))}
                  <div>
                    <span className="text-ink-3">Max Session: </span>
                    <span className="font-semibold text-ink">{res.maxSessionMinutes} min</span>
                  </div>
                  <div>
                    <span className="text-ink-3">Safety Buffer: </span>
                    <span className="font-semibold text-ink">{res.bufferMinutes} min</span>
                  </div>
                </div>

                {/* Location & Certifications */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="text-ink-2 flex items-center space-x-1">
                    <span className="text-ink-3">Location:</span>
                    <span>{res.location}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-ink-3">Prerequisites:</span>
                    {requiresCerts.length > 0 ? (
                      requiresCerts.map((c) => (
                        <span
                          key={c}
                          className={`px-1.5 py-0.5 text-[10px] border ${
                            currentUser.certifications?.includes(c)
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                              : 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200'
                          }`}
                        >
                          {c} {currentUser.certifications?.includes(c) ? '✓' : '✗ Required'}
                        </span>
                      ))
                    ) : (
                      <span className="text-ink-3">None (Open to all students)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-rule-soft flex items-center justify-between">
                <span className="text-[11px] font-mono text-ink-3">
                  {userHasCerts ? 'Safety prerequisites met' : 'Certification required before use'}
                </span>
                <button
                  onClick={() => navigate(`/request?resourceId=${res.id}`)}
                  className="bg-ink hover:bg-signal text-paper px-4 py-2 text-xs font-mono font-semibold uppercase transition-colors"
                >
                  Request Slot &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
