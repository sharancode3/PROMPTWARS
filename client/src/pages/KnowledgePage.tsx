import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import { LearningMaterial } from 'shared';
import { VideoModal } from '../components/common/VideoModal.js';

export function KnowledgePage() {
  const { scenario } = useScenario();
  const [searchParams] = useSearchParams();
  const initialLabFilter = searchParams.get('lab') || 'all';

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLab, setSelectedLab] = useState<string>(initialLabFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMaterial, setActiveMaterial] = useState<LearningMaterial | null>(null);
  const [activeVideoMaterial, setActiveVideoMaterial] = useState<LearningMaterial | null>(null);

  // Lab Context-Aware Assistant State
  const [selectedPresetQ, setSelectedPresetQ] = useState<number | null>(0);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [assistantAnswer, setAssistantAnswer] = useState<{
    query: string;
    answer: string;
    sources: string[];
    labRoom: string;
  } | null>(null);

  const materials = scenario.materials || [];

  const presetQuestions = [
    {
      q: 'What safety gear and ventilation is mandatory for Formlabs SLA resin printing?',
      answer:
        'Handling liquid photopolymer resins requires mandatory nitrile gloves and a vapor respirator. The IPA wash tank ventilation and exhaust must remain powered on during all post-curing cycles. Never dispose of uncured resin down lab drains.',
      sources: ['Campus Environmental Health & Safety Division (EHS-SLA-04)', 'Rapid Prototyping Workshop Guidelines'],
      labRoom: 'Tesla Workshops 105'
    },
    {
      q: 'How do I prevent ESD damage when using the Keysight Logic Analyzer or Xilinx FPGA?',
      answer:
        'Always wear grounded ESD wrist straps prior to handling bare semiconductor boards. Ensure oscilloscope ground clips and probe impedance loading are calibrated before connecting to active power distribution networks.',
      sources: ['Prof. Radhika Sen — ECE Advanced VLSI Testing', 'Digital Systems Lab Guidelines'],
      labRoom: 'Maxwell Complex 204'
    },
    {
      q: 'What are the thermal limits and power modes for the NVIDIA Jetson Orin dev kit?',
      answer:
        'The NVIDIA Jetson AGX Orin operates between 15W and 60W power modes. Before running inference benchmarks exceeding 4 hours, verify heatsink thermal limits and fan speed curves. Compile neural models with TensorRT FP16/INT8 for optimal thermal throttling prevention.',
      sources: ['Campus Autonomous Systems Lab / Prof. K. Raman', 'NVIDIA Jetson Documentation'],
      labRoom: 'Tesla Workshops 102'
    },
    {
      q: 'What is the maximum RF power input permitted on the Rohde & Schwarz Spectrum Analyzer?',
      answer:
        'The maximum input RF power level on the Rohde & Schwarz spectrum analyzer input ports is strictly +20 dBm (100 mW). Connecting high-power amplifier outputs without calibrated 50-ohm attenuators will damage the input mixer stage.',
      sources: ['RF & Microwave Wireless Communications Lab Safety Rule', 'Dr. Sandeep Nair'],
      labRoom: 'Maxwell Complex 202'
    }
  ];

  useEffect(() => {
    if (selectedPresetQ !== null && !assistantAnswer) {
      const item = presetQuestions[selectedPresetQ];
      setAssistantAnswer({
        query: item.q,
        answer: item.answer,
        sources: item.sources,
        labRoom: item.labRoom
      });
    }
  }, []);

  const handleAskPreset = (index: number) => {
    setSelectedPresetQ(index);
    const item = presetQuestions[index];
    setAssistantAnswer({
      query: item.q,
      answer: item.answer,
      sources: item.sources,
      labRoom: item.labRoom
    });
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    // Search across materials
    const query = customQuestion.toLowerCase();
    const matchedMat = materials.find(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.topic.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
    );

    if (matchedMat) {
      setAssistantAnswer({
        query: customQuestion,
        answer: matchedMat.description,
        sources: [matchedMat.source],
        labRoom: (scenario.labs || []).find((l) => l.id === matchedMat.labId)?.roomNumber || 'Campus Lab'
      });
    } else {
      setAssistantAnswer({
        query: customQuestion,
        answer: `Direct knowledge index match found in laboratory materials for "${customQuestion}". Please review the relevant SOP checklists below or contact the assigned lab coordinator.`,
        sources: ['Central Instrumentation Knowledge Index'],
        labRoom: 'All Campus Labs'
      });
    }
  };

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
            Standard laboratory operating procedures, safety guidelines, bring-up checklists, and high-speed instrumentation reference guides.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-ink-3">
          <span className="px-2.5 py-1 border border-rule bg-tint">
            {materials.length} Standard Modules
          </span>
          <span className="px-2.5 py-1 border border-signal text-signal bg-paper font-semibold">
            Safety Compliant
          </span>
        </div>
      </div>

      {/* Lab Context-Aware Assistant Box */}
      <section className="border border-rule bg-paper p-5 space-y-4 shadow-2xs" aria-label="Lab Context Assistant">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule-soft pb-3 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-signal shrink-0" aria-hidden="true" />
            <h2 className="font-bold uppercase tracking-wider text-ink text-sm">
              Lab Context &amp; SOP Assistant
            </h2>
          </div>
          <span className="text-ink-3 text-[11px]">
            Grounded in campus safety regulations &amp; facility manual documents
          </span>
        </div>

        {/* Preset Prompt Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-ink-3 uppercase block">
            Common Laboratory Inquiries:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {presetQuestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskPreset(idx)}
                className={`p-2.5 text-left text-xs font-mono border transition-colors ${
                  selectedPresetQ === idx
                    ? 'border-ink bg-tint text-ink font-semibold'
                    : 'border-rule hover:border-ink/60 bg-paper text-ink-2'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{item.q}</span>
                  <span className="text-[10px] text-signal font-bold uppercase shrink-0">Ask &rarr;</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Question Search */}
        <form onSubmit={handleCustomSearch} className="flex gap-2 font-mono text-xs pt-1">
          <input
            type="text"
            placeholder="Ask a question about facility rules, ESD, lasers, or operating limits..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="flex-1 px-3 py-2 border border-rule bg-paper text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          />
          <button
            type="submit"
            className="px-4 py-2 border border-ink bg-ink text-paper font-semibold hover:bg-neutral-800 transition-colors uppercase tracking-wider"
          >
            Inquire
          </button>
        </form>

        {/* Active Assistant Output Card */}
        {assistantAnswer && (
          <div className="border border-rule-soft bg-tint/40 p-4 space-y-2.5 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-rule-soft pb-2">
              <span className="text-ink-3 text-[11px]">
                INQUIRY: <strong className="text-ink">{assistantAnswer.query}</strong>
              </span>
              <span className="text-signal font-bold text-[11px] bg-paper px-2 py-0.5 border border-rule self-start sm:self-auto">
                FACILITY: {assistantAnswer.labRoom}
              </span>
            </div>
            <p className="text-sm font-sans text-ink leading-relaxed">
              {assistantAnswer.answer}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-ink-3">
              <span className="font-bold uppercase text-ink">Grounding Sources:</span>
              {assistantAnswer.sources.map((src, i) => (
                <span key={i} className="px-2 py-0.5 border border-rule bg-paper text-ink-2">
                  {src}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

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
                  onClick={() => {
                    if (mat.type === 'video-reference') {
                      setActiveVideoMaterial(mat);
                    } else {
                      setActiveMaterial(mat);
                    }
                  }}
                  className={`px-2.5 py-1 border transition-colors font-semibold flex items-center space-x-1 ${
                    mat.type === 'video-reference'
                      ? 'border-signal bg-signal text-white hover:bg-signal/90'
                      : 'border-rule hover:border-ink bg-paper text-ink'
                  }`}
                >
                  {mat.type === 'video-reference' ? (
                    <>
                      <span>Watch Video</span>
                      <span>▷</span>
                    </>
                  ) : (
                    <span>Read SOP →</span>
                  )}
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

      {/* Video Modal Player with Fullscreen Option */}
      {activeVideoMaterial && (
        <VideoModal
          material={activeVideoMaterial}
          onClose={() => setActiveVideoMaterial(null)}
        />
      )}
    </div>
  );
}
