import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';

export function LabsPage() {
  const { scenario } = useScenario();
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLabs = useMemo(() => {
    return (scenario.labs || []).filter((lab) => {
      const matchDept = selectedDept === 'all' || lab.departmentId === selectedDept;
      const matchSearch =
        searchQuery === '' ||
        lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lab.description && lab.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        lab.coordinatorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [scenario.labs, selectedDept, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-rule pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
            06 LABS • CAMPUS DIRECTORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            University Laboratories
          </h1>
          <p className="text-sm text-ink-2 mt-1 max-w-2xl">
            Explore inter-departmental laboratory facilities, research benches, operating hours, and illustrative safety reference guidelines. Consult facility coordinators for authoritative safety procedures.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-ink-3">
          <span className="px-2.5 py-1 border border-rule bg-tint">
            {scenario.labs?.length || 0} Registered Labs
          </span>
          <span className="px-2.5 py-1 border border-rule bg-tint">
            {scenario.resources.length} Specialised Devices
          </span>
        </div>
      </div>

      {/* Illustrative Notice & Grounding Disclaimer */}
      <div className="bg-tint/40 border-l-2 border-rule p-3 font-mono text-xs text-ink-2">
        <strong className="text-ink">Safety &amp; Compliance Notice:</strong> Laboratory safety notes, room assignments, and equipment listings are department-sourced reference materials for student orientation. In case of emergency or high-risk chemical/hardware operations, follow the direct instructions of the assigned Faculty Coordinator.
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-tint/30 p-3 border border-rule">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-ink-3 mr-1 text-[11px] uppercase">Department:</span>
          <button
            type="button"
            onClick={() => setSelectedDept('all')}
            className={`px-2.5 py-1 border text-xs transition-colors ${
              selectedDept === 'all'
                ? 'border-ink bg-ink text-paper font-semibold'
                : 'border-rule hover:bg-tint text-ink-2'
            }`}
          >
            All ({scenario.labs?.length || 0})
          </button>
          {scenario.departments.map((dept) => {
            const count = (scenario.labs || []).filter((l) => l.departmentId === dept.id).length;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDept(dept.id)}
                className={`px-2.5 py-1 border text-xs transition-colors ${
                  selectedDept === dept.id
                    ? 'border-ink bg-ink text-paper font-semibold'
                    : 'border-rule hover:bg-tint text-ink-2'
                }`}
              >
                {dept.code} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search lab name, room, coordinator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-mono px-3 py-1.5 border border-rule bg-paper text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          />
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLabs.map((lab) => {
          const dept = scenario.departments.find((d) => d.id === lab.departmentId);
          const labResources = scenario.resources.filter((r) => r.labId === lab.id);
          const labMaterials = (scenario.materials || []).filter((m) => m.labId === lab.id);

          return (
            <div
              key={lab.id}
              className="border border-rule bg-paper p-5 flex flex-col justify-between hover:border-ink transition-colors"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-signal font-semibold">
                      {dept?.name || lab.departmentId}
                    </span>
                    <h2 className="text-lg font-bold text-ink leading-snug mt-0.5">
                      {lab.name}
                    </h2>
                  </div>
                  <span className="shrink-0 text-xs font-mono px-2 py-0.5 border border-rule-soft bg-tint text-ink">
                    {lab.roomNumber}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-ink-2 leading-relaxed mb-4">
                  {lab.description || 'Specialised laboratory workstation with cross-department access.'}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-b border-rule-soft py-2.5 mb-4 bg-tint/20">
                  <div>
                    <span className="text-[10px] text-ink-3 block uppercase">Hours</span>
                    <span className="text-ink font-semibold">
                      {lab.operatingHours.open} — {lab.operatingHours.close}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-3 block uppercase">Coordinator</span>
                    <span className="text-ink font-semibold truncate block">
                      {lab.coordinatorName}
                    </span>
                  </div>
                </div>

                {/* Equipment in Lab */}
                <div className="mb-4">
                  <div className="text-[11px] font-mono text-ink-3 uppercase mb-1.5 flex items-center justify-between">
                    <span>Specialised Equipment</span>
                    <span>{labResources.length} items</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {labResources.map((res) => (
                      <Link
                        key={res.id}
                        to={`/discover?search=${encodeURIComponent(res.name)}`}
                        className="text-[11px] font-mono px-2 py-0.5 border border-rule hover:border-ink bg-paper text-ink transition-colors"
                      >
                        {res.name}
                      </Link>
                    ))}
                    {labResources.length === 0 && (
                      <span className="text-xs font-mono text-ink-3 italic">Shared facility station</span>
                    )}
                  </div>
                </div>

                {/* Safety Rules */}
                {lab.safetyRules && lab.safetyRules.length > 0 && (
                  <div className="bg-tint/40 p-2.5 border border-rule-soft text-xs mb-4">
                    <span className="text-[10px] font-mono font-bold text-signal uppercase tracking-wider block mb-1">
                      Mandatory Lab Safety Protocols
                    </span>
                    <ul className="space-y-1 text-ink-2 text-[11px]">
                      {lab.safetyRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-signal font-bold mt-0.5">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-rule-soft flex items-center justify-between text-xs font-mono">
                <Link
                  to={`/knowledge?lab=${encodeURIComponent(lab.id)}`}
                  className="text-signal hover:underline flex items-center space-x-1"
                >
                  <span>SOPs & Guides ({labMaterials.length})</span>
                  <span>→</span>
                </Link>
                <Link
                  to="/request"
                  className="px-3 py-1 bg-ink text-paper hover:bg-signal transition-colors font-medium"
                >
                  Request Lab Slot
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
