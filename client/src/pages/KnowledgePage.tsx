import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import { LearningMaterial } from 'shared';

export function KnowledgePage() {
  const { scenario } = useScenario();
  const [searchParams] = useSearchParams();
  const initialLabFilter = searchParams.get('lab') || 'all';

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLab, setSelectedLab] = useState<string>(initialLabFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMaterial, setActiveMaterial] = useState<LearningMaterial | null>(null);

  const materials = scenario.materials || [];

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchType = selectedType === 'all' || item.type === selectedType;
      const matchLab = selectedLab === 'all' || item.labId === selectedLab;
      const matchQuery =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchLab && matchQuery;
    });
  }, [materials, selectedType, selectedLab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-rule pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
            08 KNOWLEDGE • PROTOCOLS & GUIDES
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            Knowledge Library & SOPs
          </h1>
          <p className="text-sm text-ink-2 mt-1 max-w-2xl">
            Certified lab operating procedures, chemical safety standards, hardware bring-up checklists, and high-speed instrumentation lecture guides.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-ink-3">
          <span className="px-2.5 py-1 border border-rule bg-tint">
            {materials.length} Verified Modules
          </span>
          <span className="px-2.5 py-1 border border-signal text-signal bg-paper font-semibold">
            Safety Certified
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-tint/30 p-4 border border-rule space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink-3 mr-1 text-[11px] uppercase">Format:</span>
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'sop-checklist', label: 'SOP Checklists' },
            { id: 'safety-guideline', label: 'Safety Guidelines' },
            { id: 'lecture-notes', label: 'Lecture Notes' },
            { id: 'video-reference', label: 'Video References' }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id)}
              className={`px-2.5 py-1 border text-xs transition-colors ${
                selectedType === type.id
                  ? 'border-ink bg-ink text-paper font-semibold'
                  : 'border-rule hover:bg-tint text-ink-2'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-rule-soft">
          <div className="flex items-center space-x-2">
            <span className="text-ink-3 text-[11px] uppercase">Facility:</span>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="px-2.5 py-1 border border-rule bg-paper text-ink text-xs focus-visible:outline-none"
            >
              <option value="all">All Campus Laboratories</option>
              {(scenario.labs || []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Filter topics, procedures, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 border border-rule bg-paper text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            />
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((mat) => {
          const lab = (scenario.labs || []).find((l) => l.id === mat.labId);
          const resource = scenario.resources.find((r) => r.id === mat.resourceId);

          const typeBadgeStyles = {
            'sop-checklist': 'border-ink bg-tint text-ink',
            'safety-guideline': 'border-signal bg-signal/10 text-signal font-bold',
            'lecture-notes': 'border-rule bg-paper text-ink-2',
            'video-reference': 'border-rule bg-tint/80 text-ink'
          }[mat.type] || 'border-rule bg-tint text-ink';

          return (
            <div
              key={mat.id}
              className="border border-rule bg-paper p-4 flex flex-col justify-between hover:border-ink transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border ${typeBadgeStyles}`}>
                    {mat.type.replace('-', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-ink-3">
                    {lab?.roomNumber || 'Campus Wide'}
                  </span>
                </div>

                <h2 className="text-base font-bold text-ink leading-snug mb-2">
                  {mat.title}
                </h2>

                <div className="text-[11px] font-mono text-signal mb-2">
                  Topic: {mat.topic}
                </div>

                <p className="text-xs text-ink-2 leading-relaxed mb-4">
                  {mat.description}
                </p>

                {resource && (
                  <div className="mb-3 p-2 border border-rule-soft bg-tint/20 text-xs font-mono">
                    <span className="text-[10px] text-ink-3 block uppercase">Associated Device</span>
                    <span className="text-ink font-semibold truncate block">{resource.name}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-rule-soft flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-ink-3 truncate max-w-[160px]" title={mat.source}>
                  {mat.source}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveMaterial(mat)}
                  className="px-2.5 py-1 border border-rule hover:border-ink bg-paper text-ink transition-colors font-semibold"
                >
                  Read SOP →
                </button>
              </div>
            </div>
          );
        })}

        {filteredMaterials.length === 0 && (
          <div className="col-span-full p-8 border border-rule text-center bg-tint/10 font-mono text-xs text-ink-3">
            No knowledge modules matched your search filters.
          </div>
        )}
      </div>

      {/* Modal for Reading Verified SOP */}
      {activeMaterial && (
        <div
          className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sop-title"
        >
          <div className="bg-paper border border-rule max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-rule pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-signal font-bold">
                  LABLINK VERIFIED LABORATORY PROCEDURE
                </span>
                <h3 id="modal-sop-title" className="text-lg font-bold text-ink mt-0.5">
                  {activeMaterial.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMaterial(null)}
                className="p-1 border border-rule hover:bg-tint text-ink"
                aria-label="Close procedure modal"
              >
                ✕
              </button>
            </div>

            <div className="text-xs font-mono bg-tint/40 p-3 border border-rule-soft space-y-1">
              <div><strong className="text-ink">Topic:</strong> {activeMaterial.topic}</div>
              <div><strong className="text-ink">Source:</strong> {activeMaterial.source}</div>
              <div><strong className="text-ink">Status:</strong> Verified Safe by Lab Administrator</div>
            </div>

            <div className="space-y-3 text-xs text-ink-2 leading-relaxed">
              <h4 className="font-mono font-bold text-ink uppercase text-[11px]">Overview & Instructions</h4>
              <p>{activeMaterial.description}</p>
              
              <div className="border border-rule p-3 bg-paper space-y-2">
                <span className="font-mono font-bold text-ink text-[11px] block uppercase">Standard Checklist Steps</span>
                <ol className="list-decimal list-inside space-y-1 font-mono text-[11px]">
                  <li>Verify calibration seal and power-on self test (POST) status.</li>
                  <li>Perform electrostatic discharge (ESD) grounding before touching leads.</li>
                  <li>Follow thermal limits and log operational parameters in lab register.</li>
                  <li>On session completion, return device to standby and disinfect work surface.</li>
                </ol>
              </div>

              {activeMaterial.url && (
                <div className="pt-2">
                  <a
                    href={activeMaterial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-signal hover:underline font-mono text-xs"
                  >
                    <span>View Manufacturer Reference Manual</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-rule flex justify-end">
              <button
                type="button"
                onClick={() => setActiveMaterial(null)}
                className="px-4 py-1.5 bg-ink text-paper text-xs font-mono hover:bg-signal transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
