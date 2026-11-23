import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import { Resource, Project, LearningMaterial, AccessRequest } from 'shared';
import { VideoModal } from '../components/common/VideoModal.js';

export function MyLabPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { scenario, role, currentUser, updateScenario, setToast } = useScenario();

  const currentTab = (searchParams.get('tab') as 'projects' | 'compare' | 'sessions' | 'pocket' | 'guide') || 'projects';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // State for Video Modal
  const [activeVideo, setActiveVideo] = useState<LearningMaterial | null>(null);

  // Tab 2: Compare Equipment State
  const allResources = scenario.resources || [];
  const [selectedResIds, setSelectedResIds] = useState<string[]>([
    allResources[0]?.id || '',
    allResources[1]?.id || '',
    allResources[2]?.id || ''
  ]);
  const [alternativeTargetId, setAlternativeTargetId] = useState<string>(allResources[0]?.id || '');

  // Tab 3: Session State
  const [readinessChecklist, setReadinessChecklist] = useState<Record<string, boolean>>({
    certConfirmed: true,
    sopReviewed: true,
    ppeEquipped: true,
    leadsInspected: false
  });
  const [diagnosticStatus, setDiagnosticStatus] = useState<string>('operational');
  const [diagnosticNote, setDiagnosticNote] = useState<string>('');
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  // Tab 5: Lab Guide State
  const [guideLabId, setGuideLabId] = useState<string>(scenario.labs[0]?.id || '');
  const [guideQuery, setGuideQuery] = useState<string>('');
  const [guideAnswer, setGuideAnswer] = useState<{
    text: string;
    citations: string[];
    linkedVideo?: LearningMaterial;
  } | null>(null);

  // Seeded Projects
  const projects: Project[] = useMemo(() => {
    return scenario.projects && scenario.projects.length > 0
      ? scenario.projects
      : [
          {
            id: 'proj_drone_capstone',
            ownerId: 'usr_student_aarav',
            advisorId: 'usr_fac_raman',
            title: 'Autonomous UAV Real-Time Vision & Edge Path Planning',
            description: 'Edge AI inference pipeline with Jetson Orin and FLIR radiometric thermal monitoring.',
            type: 'capstone',
            deadline: '2026-11-26T23:59:59Z',
            createdAt: '2026-11-20T10:00:00Z'
          },
          {
            id: 'proj_cdc_verification',
            ownerId: 'usr_student_sarah',
            advisorId: 'usr_fac_radhika',
            title: 'High-Speed Clock Domain Crossing (CDC) & Timing Closure Verification',
            description: 'FPGA hardware emulation and logic analyzer sub-nanosecond timing capture.',
            type: 'research',
            deadline: '2026-11-28T23:59:59Z',
            createdAt: '2026-11-20T11:30:00Z'
          },
          {
            id: 'proj_protein_kinetics',
            ownerId: 'usr_student_aarav',
            advisorId: 'usr_fac_elena',
            title: 'Biomolecular Protein Kinetics & Optical Absorbance Characterization',
            description: 'Double-beam UV-Vis spectrophotometry and HPLC analytical assay.',
            type: 'research',
            deadline: '2026-12-05T23:59:59Z',
            createdAt: '2026-11-22T08:00:00Z'
          }
        ];
  }, [scenario.projects]);

  // Derived Bookings for current user or session
  const activeBookings = scenario.bookings.filter((b) => b.status === 'confirmed');
  const userBookings = activeBookings.filter((b) => b.studentId === currentUser.id);
  const primaryBooking = userBookings[0] || activeBookings[0];
  const primaryResource = primaryBooking
    ? allResources.find((r) => r.id === primaryBooking.resourceId)
    : null;
  const primaryResourceName = primaryResource?.name || 'Lab Workstation Device';

  // Deterministic Alternatives Scorer
  const rankedAlternatives = useMemo(() => {
    if (!alternativeTargetId) return [];
    const target = allResources.find((r) => r.id === alternativeTargetId);
    if (!target) return [];

    return allResources
      .filter((r) => r.id !== target.id)
      .map((candidate) => {
        let score = 0;
        const reasons: string[] = [];

        // Category match (+40)
        if (candidate.category === target.category) {
          score += 40;
          reasons.push(`Same equipment class (${candidate.category})`);
        }
        // Department proximity (+30)
        if (candidate.departmentId === target.departmentId) {
          score += 30;
          reasons.push('Same host department building');
        } else {
          score += 15;
          reasons.push('Cross-department inter-lab resource');
        }
        // Availability bonus (+30)
        if (candidate.status === 'available') {
          score += 30;
          reasons.push('Immediate booking readiness');
        }

        return { candidate, score, reasons };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [allResources, alternativeTargetId]);

  // Handle Diagnostic Status Report
  const handleReportDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryBooking) return;

    updateScenario((prev) => ({
      ...prev,
      resources: prev.resources.map((r) =>
        r.id === primaryBooking.resourceId
          ? {
              ...r,
              status: diagnosticStatus === 'hardware-issue' ? 'maintenance' : r.status
            }
          : r
      )
    }));

    setToast(`Diagnostic log recorded for ${primaryResourceName}: status updated to ${diagnosticStatus.toUpperCase()}`);
    setIsDiagnosticOpen(false);
    setDiagnosticNote('');
  };

  // Handle Lab Guide Inquiry
  const handleGuideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideQuery.trim()) return;

    const queryLower = guideQuery.toLowerCase();
    const matchedMaterial = (scenario.materials || []).find(
      (m) =>
        m.labId === guideLabId &&
        (m.title.toLowerCase().includes(queryLower) ||
          m.topic.toLowerCase().includes(queryLower) ||
          m.description.toLowerCase().includes(queryLower))
    ) || (scenario.materials || []).find(
      (m) =>
        m.title.toLowerCase().includes(queryLower) ||
        m.topic.toLowerCase().includes(queryLower)
    );

    const labObj = scenario.labs.find((l) => l.id === guideLabId);

    if (matchedMaterial) {
      setGuideAnswer({
        text: `${matchedMaterial.description} Grounded in verified institutional SOP "${matchedMaterial.title}".`,
        citations: [matchedMaterial.source, labObj ? `${labObj.name} (${labObj.roomNumber})` : 'Central Facilities'],
        linkedVideo: matchedMaterial.type === 'video-reference' ? matchedMaterial : undefined
      });
    } else {
      setGuideAnswer({
        text: `Based on campus facility regulations for ${labObj?.name || 'this laboratory'}, all operators must complete safety orientation, verify equipment condition before activation, and maintain emergency eye wash clearance. For deep technical diagnostics, consult the printed reference manual at bench 01.`,
        citations: ['Campus Environmental Health & Safety Division', labObj?.roomNumber || 'Facility Desk']
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-rule pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
              STUDENT WORKSPACE • LAB OPERATIONS
            </span>
            <span className="px-1.5 py-0.5 border border-rule text-[10px] font-mono uppercase bg-paper font-bold">
              ROLE: {role}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            My Lab Workspace
          </h1>
          <p className="text-sm text-ink-2 mt-1 max-w-2xl">
            Integrated student console for tracking multi-equipment projects, side-by-side hardware comparison, session readiness execution, mobile pocket cards, and laboratory diagnostics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => navigate('/conflicts')}
            className="px-3 py-2 border border-signal bg-signal text-white font-bold hover:bg-signal/90 transition-colors shadow-xs"
          >
            Run Conflict Demo &rarr;
          </button>
          <button
            onClick={() => navigate('/request')}
            className="px-3 py-2 border border-ink bg-paper text-ink font-semibold hover:bg-tint transition-colors"
          >
            + New Access Request
          </button>
        </div>
      </div>

      {/* Navigation Tabs (5 Core Features) */}
      <div className="border-b border-rule flex flex-wrap gap-1 font-mono text-xs">
        {[
          { id: 'projects', label: '1. Projects & Bundles', count: projects.length },
          { id: 'compare', label: '2. Compare Equipment', count: `${allResources.length} Devices` },
          { id: 'sessions', label: '3. Sessions & Readiness', count: primaryBooking ? '1 Active' : '0 Scheduled' },
          { id: 'pocket', label: '4. Lab Pocket Card', count: 'Offline Sync' },
          { id: 'guide', label: '5. Lab Assistant Guide', count: 'Grounded SOPs' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center space-x-2 ${
              currentTab === tab.id
                ? 'border-signal text-signal bg-tint/40 font-bold'
                : 'border-transparent text-ink-2 hover:text-ink hover:border-rule-soft'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 border border-rule-soft bg-paper text-ink-3">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          TAB 1: PROJECTS & MULTI-DEVICE BUNDLES
         ========================================================================= */}
      {currentTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-tint/30 p-4 border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <strong className="text-ink uppercase">Project-Based Access Rules:</strong>
              <span className="text-ink-2 ml-1">
                Equipment bundles are evaluated with atomic slot feasibility. If any device in a bundle is unavailable or contested, the engine flags schedule conflicts.
              </span>
            </div>
            <span className="px-2 py-0.5 border border-rule bg-paper text-ink-3 shrink-0">
              {projects.length} Active Research Projects
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {projects.map((proj) => {
              // Find all access requests associated with this project
              const projRequests: AccessRequest[] = (scenario.requests || []).filter(
                (r) => r.projectId === proj.id
              );
              const requestedResIds = projRequests.flatMap((r) => r.items.map((it) => it.resourceId).filter(Boolean) as string[]);
              
              // Fallback to default bundle if no requests yet
              const bundleResIds = requestedResIds.length > 0
                ? requestedResIds
                : proj.id.includes('drone')
                ? ['res_jetson_orin_01', 'res_flir_thermal_01']
                : proj.id.includes('cdc')
                ? ['res_zynq_fpga_01', 'res_keysight_la_01']
                : ['res_shimadzu_uv_01', 'res_agilent_hplc_01'];

              const bundleResources = bundleResIds
                .map((id) => allResources.find((r) => r.id === id))
                .filter(Boolean) as Resource[];

              const supervisor = scenario.users.find((u) => u.id === proj.advisorId);
              const owner = scenario.users.find((u) => u.id === proj.ownerId);
              const dept = owner ? scenario.departments.find((d) => d.id === owner.departmentId) : scenario.departments[0];

              // Check if any resource in bundle is currently contested in requests
              const isContested = scenario.requests.some(
                (r) =>
                  (r.status === 'submitted' || r.status === 'under-review') &&
                  bundleResIds.some((id) => r.items.some((it) => it.resourceId === id))
              );

              const isApproved = projRequests.some((r) => r.status === 'approved');

              return (
                <div key={proj.id} className="border border-rule bg-paper p-5 space-y-4 shadow-xs">
                  {/* Project Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-rule-soft pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 border border-rule text-[10px] font-mono font-bold uppercase bg-tint text-ink">
                          {proj.type.toUpperCase()} PROJECT
                        </span>
                        <span className="text-xs font-mono text-ink-3">
                          {dept?.name} ({dept?.code})
                        </span>
                        {isContested && (
                          <span className="px-2 py-0.5 border border-signal text-[10px] font-mono font-bold uppercase bg-signal/10 text-signal">
                            ● Slot Collision Detected
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-ink">{proj.title}</h2>
                      <p className="text-xs text-ink-2 font-mono">{proj.description}</p>
                    </div>

                    <div className="text-right sm:text-right font-mono text-xs shrink-0">
                      <span className="text-ink-3 text-[10px] block uppercase">Project Deadline</span>
                      <strong className="text-signal text-sm">{proj.deadline.slice(0, 10)}</strong>
                      <span className="text-[10px] text-ink-3 block mt-0.5">
                        Supervisor: {supervisor?.name || 'Academic Committee'}
                      </span>
                    </div>
                  </div>

                  {/* Bundled Equipment Roster */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold text-ink uppercase tracking-wider block">
                      Required Equipment Bundle (Atomic Allocation)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {bundleResources.map((res) => (
                        <div
                          key={res.id}
                          className="border border-rule-soft p-3 bg-tint/20 flex items-center justify-between font-mono text-xs"
                        >
                          <div>
                            <span className="font-semibold text-ink block">{res.name}</span>
                            <span className="text-[10px] text-ink-3">
                              {res.category.toUpperCase()} • Max {res.maxSessionMinutes}m
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 border text-[10px] uppercase font-bold ${
                              res.status === 'available'
                                ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'border-amber-600 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {res.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6-Stage Lifecycle Progress Stepper */}
                  <div className="pt-2 border-t border-rule-soft">
                    <span className="text-[11px] font-mono font-bold text-ink uppercase tracking-wider block mb-2">
                      Lifecycle Progression
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center font-mono text-[10px]">
                      <div className="p-2 border border-ink bg-ink text-paper font-bold">
                        1. DRAFTED ✓
                      </div>
                      <div className={`p-2 border ${isApproved ? 'border-ink bg-ink text-paper font-bold' : 'border-rule bg-tint text-ink'}`}>
                        2. FACULTY {isApproved ? '✓' : 'REVIEW'}
                      </div>
                      <div className={`p-2 border ${isContested ? 'border-signal bg-signal/15 text-signal font-bold' : 'border-rule bg-tint text-ink-2'}`}>
                        3. RESERVATION {isContested ? '⚠' : ''}
                      </div>
                      <div className="p-2 border border-rule-soft bg-paper text-ink-3">
                        4. PRE-LAB PREP
                      </div>
                      <div className="p-2 border border-rule-soft bg-paper text-ink-3">
                        5. LAB SESSION
                      </div>
                      <div className="p-2 border border-rule-soft bg-paper text-ink-3">
                        6. COMPLETION
                      </div>
                    </div>
                  </div>

                  {/* Actions & Next Steps */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-rule-soft font-mono text-xs">
                    <div className="text-ink-2">
                      {isContested ? (
                        <span className="text-signal font-bold">
                          Blocker: Competing slot request requires fair arbitration in Conflict Center.
                        </span>
                      ) : (
                        <span>Prerequisites: Safety certifications verified. Ready for session slot confirmation.</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {isContested ? (
                        <button
                          onClick={() => navigate('/conflicts')}
                          className="px-4 py-1.5 border border-signal bg-signal text-white font-bold hover:bg-signal/90"
                        >
                          Resolve in Conflict Center &rarr;
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/timetable')}
                          className="px-4 py-1.5 border border-ink bg-ink text-paper font-semibold hover:bg-neutral-800"
                        >
                          View Schedule &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: COMPARE EQUIPMENT & DETERMINISTIC ALTERNATIVES
         ========================================================================= */}
      {currentTab === 'compare' && (
        <div className="space-y-6">
          {/* Hardware Side-by-Side Selector */}
          <div className="border border-rule bg-paper p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule-soft pb-3">
              <div>
                <h2 className="text-lg font-bold text-ink">Side-by-Side Equipment Comparison</h2>
                <p className="text-xs text-ink-2">
                  Compare specifications, safety prerequisites, turnaround buffers, and real-time availability across campus instruments.
                </p>
              </div>
              <span className="text-xs font-mono text-ink-3">Select up to 3 units</span>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="space-y-1">
                  <label htmlFor={`device-select-${idx}`} className="text-[10px] text-ink-3 uppercase block font-semibold">
                    Instrument {idx + 1}:
                  </label>
                  <select
                    id={`device-select-${idx}`}
                    value={selectedResIds[idx] || ''}
                    onChange={(e) => {
                      const next = [...selectedResIds];
                      next[idx] = e.target.value;
                      setSelectedResIds(next);
                    }}
                    className="w-full px-2.5 py-1.5 border border-rule bg-paper text-ink focus-visible:outline-none"
                  >
                    {allResources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.category.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Comparison Matrix Table */}
            <div className="overflow-x-auto border border-rule">
              <table className="w-full text-left font-mono text-xs divide-y divide-rule">
                <thead className="bg-tint/60 text-ink">
                  <tr>
                    <th className="p-3 border-r border-rule w-1/4">Specification Factor</th>
                    {selectedResIds.map((id, i) => {
                      const res = allResources.find((r) => r.id === id);
                      return (
                        <th key={i} className="p-3 border-r border-rule last:border-r-0">
                          {res?.name || `Slot ${i + 1}`}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule-soft bg-paper">
                  <tr>
                    <td className="p-3 font-semibold text-ink border-r border-rule bg-tint/20">Category & Facility</td>
                    {selectedResIds.map((id, i) => {
                      const res = allResources.find((r) => r.id === id);
                      const lab = scenario.labs.find((l) => l.id === res?.labId);
                      return (
                        <td key={i} className="p-3 border-r border-rule last:border-r-0 text-ink-2">
                          <span className="font-bold text-ink uppercase block">{res?.category}</span>
                          <span className="text-[11px] text-ink-3">{lab?.name} ({lab?.roomNumber})</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-ink border-r border-rule bg-tint/20">Key Technical Specs</td>
                    {selectedResIds.map((id, i) => {
                      const res = allResources.find((r) => r.id === id);
                      return (
                        <td key={i} className="p-3 border-r border-rule last:border-r-0 text-ink-2">
                          <div className="space-y-1 text-[11px]">
                            {res?.specs ? (
                              Object.entries(res.specs).slice(0, 4).map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                  <span className="text-ink-3 uppercase">{k}:</span>
                                  <span className="font-semibold text-ink">{String(v)}</span>
                                </div>
                              ))
                            ) : (
                              <span>Standard specification profile</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-ink border-r border-rule bg-tint/20">Max Session / Turnaround</td>
                    {selectedResIds.map((id, i) => {
                      const res = allResources.find((r) => r.id === id);
                      return (
                        <td key={i} className="p-3 border-r border-rule last:border-r-0 text-ink-2">
                          <strong>{res?.maxSessionMinutes} mins</strong> max session
                          <span className="block text-[11px] text-ink-3">Safety buffer: {res?.bufferMinutes} mins</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-ink border-r border-rule bg-tint/20">Required Prerequisites</td>
                    {selectedResIds.map((id, i) => {
                      const res = allResources.find((r) => r.id === id);
                      return (
                        <td key={i} className="p-3 border-r border-rule last:border-r-0 text-ink-2">
                          {res?.requiresCertification && res.requiresCertification.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {res.requiresCertification.map((p) => (
                                <span key={p} className="px-1.5 py-0.5 border border-rule text-[10px] bg-tint">
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Open Access (No prerequisites)</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-ink border-r border-rule bg-tint/20">Operating Status</td>
                    {selectedResIds.map((id, i) => {
                      const res = allResources.find((r) => r.id === id);
                      return (
                        <td key={i} className="p-3 border-r border-rule last:border-r-0">
                          <span className="px-2 py-0.5 border border-rule font-bold text-[10px] uppercase bg-paper text-ink">
                            {res?.status.toUpperCase()}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deterministic "Find Alternatives" Engine */}
          <div className="border border-rule bg-paper p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule-soft pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-signal font-bold">
                  DETERMINISTIC FALLBACK RESOLVER
                </span>
                <h3 className="text-lg font-bold text-ink">Find Equivalent Hardware Alternatives</h3>
                <p className="text-xs text-ink-2">
                  When primary research equipment is booked or contested, the engine ranks substitutes using strict capability similarity and department proximity.
                </p>
              </div>

              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="text-ink-3">Target Instrument:</span>
                <select
                  value={alternativeTargetId}
                  onChange={(e) => setAlternativeTargetId(e.target.value)}
                  className="px-2.5 py-1.5 border border-rule bg-paper text-ink"
                >
                  {allResources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rankedAlternatives.map(({ candidate, score, reasons }, idx) => (
                <div key={candidate.id} className="border border-rule p-4 space-y-3 bg-tint/20 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-signal">RANK #{idx + 1}</span>
                    <span className="px-2 py-0.5 border border-rule bg-paper font-bold text-ink">
                      Match: {score}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-ink text-sm">{candidate.name}</h4>
                    <span className="text-[10px] text-ink-3 block uppercase">{candidate.category}</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-ink-2 list-disc list-inside">
                    {reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate(`/discover?dept=${candidate.departmentId}`)}
                    className="w-full py-1.5 border border-ink bg-ink text-paper text-center hover:bg-neutral-800 transition-colors"
                  >
                    Select Alternative &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SESSIONS LIFECYCLE & DIAGNOSTIC REPORTING
         ========================================================================= */}
      {currentTab === 'sessions' && (
        <div className="space-y-6">
          {primaryBooking ? (
            <div className="border border-rule bg-paper p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-rule-soft pb-4">
                <div>
                  <span className="text-[10px] font-mono text-signal uppercase tracking-wider font-bold">
                    ACTIVE CONFIRMED SESSION • BOOKING REF: {primaryBooking.id}
                  </span>
                  <h2 className="text-xl font-bold text-ink mt-1">
                    {primaryResourceName}
                  </h2>
                  <p className="text-xs font-mono text-ink-3 mt-0.5">
                    Date: {primaryBooking.date} • Window: {primaryBooking.startTime} – {primaryBooking.endTime} (Asia/Kolkata)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 border border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs uppercase">
                    ● Check-In Active
                  </span>
                </div>
              </div>

              {/* Pre-Session Readiness Checklist */}
              <div className="border border-rule p-4 bg-tint/20 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-rule-soft pb-2">
                  <strong className="text-ink uppercase tracking-wider">
                    Pre-Session Readiness Checklist (Mandatory for Hardware Power-On)
                  </strong>
                  <span className="text-[10px] text-ink-3">Pass 4 of 4 criteria</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'certConfirmed', label: 'EHS & Laboratory Safety Certification Active' },
                    { key: 'sopReviewed', label: 'Equipment Bring-Up SOP & Emergency Shutdown Read' },
                    { key: 'ppeEquipped', label: 'Mandatory PPE (Goggles/ESD Strap/Lab Coat) Equipped' },
                    { key: 'leadsInspected', label: 'Probe Leads & Power Cables Inspected for Wear' }
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center space-x-2 p-2 border border-rule bg-paper cursor-pointer hover:bg-tint/50"
                    >
                      <input
                        type="checkbox"
                        checked={readinessChecklist[item.key] || false}
                        onChange={(e) =>
                          setReadinessChecklist({ ...readinessChecklist, [item.key]: e.target.checked })
                        }
                        className="rounded-none border-rule text-signal focus:ring-0"
                      />
                      <span className="text-ink font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Session Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs font-mono text-ink-2">
                  Door Access Token: <strong className="text-ink font-mono tracking-widest bg-tint px-2 py-0.5 border border-rule">LAB-{primaryBooking.id.slice(-4).toUpperCase()}</strong>
                </div>

                <div className="flex items-center space-x-3 font-mono text-xs">
                  <button
                    onClick={() => setIsDiagnosticOpen(true)}
                    className="px-3 py-2 border border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-500/10 font-bold hover:bg-amber-500/20"
                  >
                    Report Diagnostic Condition Issue
                  </button>
                  <button
                    onClick={() => {
                      setToast('Session completed. Resource released and turnaround safety buffer initiated.');
                      navigate('/bookings');
                    }}
                    className="px-4 py-2 border border-ink bg-ink text-paper font-semibold hover:bg-neutral-800"
                  >
                    Complete Session & Release &rarr;
                  </button>
                </div>
              </div>

              {/* Diagnostic Issue Modal */}
              {isDiagnosticOpen && (
                <div
                  className="fixed inset-0 bg-ink/75 z-50 flex items-center justify-center p-4"
                  role="dialog"
                  aria-modal="true"
                >
                  <form
                    onSubmit={handleReportDiagnostic}
                    className="bg-paper border-2 border-rule max-w-lg w-full p-5 space-y-4 shadow-xl font-mono text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-rule pb-2">
                      <strong className="text-ink text-sm uppercase">Log Post-Session Diagnostic</strong>
                      <button
                        type="button"
                        onClick={() => setIsDiagnosticOpen(false)}
                        className="p-1 border border-rule hover:bg-tint"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-ink-3 block uppercase">Equipment Condition State:</label>
                      <select
                        value={diagnosticStatus}
                        onChange={(e) => setDiagnosticStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-rule bg-paper text-ink"
                      >
                        <option value="operational">Operational (Full readiness)</option>
                        <option value="needs-cleaning">Needs Cleaning / Sanitization</option>
                        <option value="calibration-drift">Calibration Drift Logged</option>
                        <option value="hardware-issue">Hardware Issue (Maintenance Required)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-ink-3 block uppercase">Diagnostic Findings & Notes:</label>
                      <textarea
                        rows={3}
                        value={diagnosticNote}
                        onChange={(e) => setDiagnosticNote(e.target.value)}
                        placeholder="e.g. Probe cable 2 exhibits intermittent contact; cuvette chamber sanitized..."
                        className="w-full p-2 border border-rule bg-paper text-ink"
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-rule">
                      <button
                        type="button"
                        onClick={() => setIsDiagnosticOpen(false)}
                        className="px-3 py-1.5 border border-rule text-ink hover:bg-tint"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 border border-signal bg-signal text-white font-bold"
                      >
                        Submit Diagnostic
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-rule p-8 text-center bg-tint/10 font-mono text-xs text-ink-3 space-y-3">
              <p>No active laboratory session currently in progress.</p>
              <button
                onClick={() => navigate('/discover')}
                className="px-4 py-2 border border-ink bg-ink text-paper font-semibold hover:bg-neutral-800"
              >
                Discover Equipment & Book a Slot
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: LAB POCKET CARD (MOBILE / OFFLINE QUICK ACCESS)
         ========================================================================= */}
      {currentTab === 'pocket' && (
        <div className="space-y-6">
          {/* Offline Sync Status Indicator */}
          <div className="p-4 bg-tint border border-rule font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <strong className="text-ink uppercase">LabLink Pocket Card:</strong>
              <span className="text-ink-2">Indexed locally for low-connectivity bench operations.</span>
            </div>
            <span className="text-ink-3 text-[11px]">
              Last Synced: {new Date().toLocaleTimeString()} Asia/Kolkata
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pocket Pass 1: Next Session Pass */}
            <div className="border-2 border-ink p-5 bg-paper space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-rule pb-2">
                <span className="font-mono text-signal text-[10px] font-bold uppercase tracking-wider">
                  RAPID BENCH ACCESS PASS
                </span>
                <span className="font-mono text-xs font-bold text-ink">CAMPUS PASS</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-ink-3">Scheduled Instrument</span>
                <h3 className="text-lg font-bold text-ink">
                  {primaryResourceName}
                </h3>
                <span className="text-xs font-mono text-ink-2 block">
                  Location: Tesla Workshops 102 • Autonomous Systems Lab
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-tint/40 border border-rule-soft font-mono text-xs">
                <div>
                  <span className="text-[10px] text-ink-3 block uppercase">Session Date</span>
                  <strong className="text-ink">{primaryBooking ? primaryBooking.date : 'Tomorrow'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-ink-3 block uppercase">Slot Time</span>
                  <strong className="text-ink">{primaryBooking ? `${primaryBooking.startTime} - ${primaryBooking.endTime}` : '10:00 - 13:00'}</strong>
                </div>
              </div>

              <div className="p-3 border border-dashed border-rule text-center bg-paper">
                <span className="text-[10px] font-mono text-ink-3 block uppercase">Bench Door Lock PIN</span>
                <span className="text-2xl font-mono font-bold tracking-widest text-signal">
                  8 4 1 9 #
                </span>
              </div>
            </div>

            {/* Pocket Pass 2: Quick SOP & Video Playback */}
            <div className="border border-rule p-5 bg-paper space-y-4">
              <div className="border-b border-rule pb-2">
                <span className="font-mono text-[10px] uppercase text-ink-3 font-semibold">
                  OFFLINE REPOSITORY
                </span>
                <h3 className="text-base font-bold text-ink">Saved Lab SOPs & Video Reference</h3>
              </div>

              <div className="space-y-2">
                {(scenario.materials || []).slice(0, 3).map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3 border border-rule-soft bg-tint/20 flex items-center justify-between font-mono text-xs"
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <span className="font-semibold text-ink truncate block">{mat.title}</span>
                      <span className="text-[10px] text-ink-3">{mat.topic}</span>
                    </div>

                    {mat.type === 'video-reference' ? (
                      <button
                        onClick={() => setActiveVideo(mat)}
                        className="px-2.5 py-1 border border-signal bg-signal text-white font-bold text-[10px] shrink-0"
                      >
                        Play ▷
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/knowledge')}
                        className="px-2.5 py-1 border border-rule bg-paper text-ink font-semibold text-[10px] shrink-0 hover:bg-tint"
                      >
                        Read →
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => navigate('/knowledge')}
                  className="text-xs font-mono text-signal hover:underline font-semibold"
                >
                  View Complete Knowledge Library ({scenario.materials?.length || 0} Modules) &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: LAB ASSISTANT GUIDE (CONTEXT-AWARE GROUNDED Q&A)
         ========================================================================= */}
      {currentTab === 'guide' && (
        <div className="space-y-6">
          <div className="border border-rule bg-paper p-5 space-y-4">
            <div className="border-b border-rule-soft pb-3">
              <span className="text-[10px] font-mono text-signal font-bold uppercase tracking-wider">
                FACILITY ASSISTANT • GROUNDED IN VERIFIED SOPS
              </span>
              <h2 className="text-xl font-bold text-ink mt-0.5">
                Lab Context-Aware Assistant
              </h2>
              <p className="text-xs text-ink-2">
                Ask laboratory safety questions, power-on sequences, or chemical disposal procedures scoped to your selected facility.
              </p>
            </div>

            {/* Facility Selector */}
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-ink-3 uppercase">Target Facility:</span>
              <select
                value={guideLabId}
                onChange={(e) => setGuideLabId(e.target.value)}
                className="px-2.5 py-1.5 border border-rule bg-paper text-ink focus-visible:outline-none"
              >
                {scenario.labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.roomNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Sample Questions */}
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-ink-3 uppercase block">Suggested Diagnostic Inquiries:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'What are the mandatory PPE rules for SLA resin photopolymer handling?',
                  'How do I calibrate oscilloscope ground clips and ESD straps?',
                  'What optical wavelength does the UV-Vis Spectrometer measure?',
                  'How to configure PyTorch multi-GPU distributed data parallel?'
                ].map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setGuideQuery(q);
                    }}
                    className="px-2.5 py-1 border border-rule bg-tint/30 text-ink-2 hover:bg-tint hover:text-ink text-[11px]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleGuideSubmit} className="flex gap-2">
              <input
                type="text"
                value={guideQuery}
                onChange={(e) => setGuideQuery(e.target.value)}
                placeholder="Ask laboratory assistant regarding equipment limits, safety protocols..."
                className="flex-1 px-3 py-2 border border-rule bg-paper text-ink font-mono text-xs focus-visible:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 border border-ink bg-ink text-paper font-mono text-xs font-semibold hover:bg-neutral-800 uppercase tracking-wider"
              >
                Ask Assistant
              </button>
            </form>

            {/* Assistant Output Card */}
            {guideAnswer && (
              <div className="border border-rule bg-tint/30 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-rule-soft pb-2">
                  <span className="text-signal font-bold text-[11px]">
                    GROUNDED LABLINK RESPONSE
                  </span>
                  <span className="text-[10px] text-ink-3">
                    Institutional Knowledge Graph
                  </span>
                </div>

                <p className="text-sm font-sans text-ink leading-relaxed">
                  {guideAnswer.text}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                  <span className="font-bold uppercase text-ink">Citations:</span>
                  {guideAnswer.citations.map((src, i) => (
                    <span key={i} className="px-2 py-0.5 border border-rule bg-paper text-ink-2">
                      {src}
                    </span>
                  ))}
                </div>

                {guideAnswer.linkedVideo && (
                  <div className="pt-2 border-t border-rule-soft flex items-center justify-between">
                    <span className="text-ink font-semibold">
                      Video Demonstration Available: {guideAnswer.linkedVideo.title}
                    </span>
                    <button
                      onClick={() => setActiveVideo(guideAnswer.linkedVideo!)}
                      className="px-3 py-1 bg-signal text-white font-bold text-xs"
                    >
                      Watch Video Demo ▷
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Video Modal */}
      {activeVideo && (
        <VideoModal
          material={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
