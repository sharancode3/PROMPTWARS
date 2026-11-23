import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import * as api from '../api/client.js';
import { AccessRequest, Resource } from 'shared';
import { StatusGlyph } from '../components/common/StatusGlyph.js';

export function RequestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scenario, currentUser, submitNewRequest, setToast } = useScenario();

  // Extract params from URL if passed from Discover slot matrix
  const queryParams = new URLSearchParams(location.search);
  const initialResourceId = queryParams.get('resourceId') || scenario.resources[0]?.id || '';
  const initialDate = queryParams.get('date');
  const initialStart = queryParams.get('startTime');
  const initialEnd = queryParams.get('endTime');

  const [selectedResourceId, setSelectedResourceId] = useState(initialResourceId);
  const [projectTitle, setProjectTitle] = useState('Autonomous Drone Obstacle Avoidance (Capstone Final)');
  const [justification, setJustification] = useState('Final testbench for real-time inference on drone-mounted Jetson Orin before senior project defense.');
  const [durationMinutes, setDurationMinutes] = useState(120);

  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [slotDate, setSlotDate] = useState(() => {
    if (initialDate) return initialDate;
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState(initialStart || '14:00');
  const [endTime, setEndTime] = useState(initialEnd || '16:00');

  // AI Intake State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSourceBadge, setAiSourceBadge] = useState<string | null>(null);

  // Post-submission summary state
  const [submittedRequest, setSubmittedRequest] = useState<AccessRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'wizard' | 'tracker'>('wizard');
  const [trackerFilter, setTrackerFilter] = useState<string>('all');

  const selectedResource = scenario.resources.find((r) => r.id === selectedResourceId);

  // Check safety prerequisites
  const missingCerts = (selectedResource?.requiresCertification || []).filter(
    (c) => !currentUser.certifications?.includes(c)
  );

  // Check operating hours constraint (08:00 - 20:00)
  const isOutsideHours = startTime < '08:00' || endTime > '20:00';

  // Check deadline constraint
  const isAfterDeadline = slotDate > deadlineDate;

  const handleAiMatch = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const match = await api.matchProjectNeed(aiPrompt);
      if (match.draftRequest) {
        setProjectTitle(match.draftRequest.title);
        setJustification(match.draftRequest.justification);
        setDurationMinutes(match.draftRequest.durationMinutes);
        if (match.suggestedResourceId) {
          setSelectedResourceId(match.suggestedResourceId);
        }
        setAiSourceBadge(match.source === 'gemini' ? 'Gemini Flash' : 'Rule-Based Engine');
        setToast(`AI parsed project need. Drafted specifications for review.`);
      }
    } catch {
      setToast('AI parsing failed. Please complete form manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResource) return;

    const newRequest: AccessRequest = {
      id: `req_${currentUser.id}_${Date.now().toString().slice(-4)}`,
      projectId: `proj_${Date.now().toString().slice(-6)}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      advisorId: 'user_radhika',
      title: projectTitle,
      justification,
      items: [
        {
          resourceId: selectedResource.id,
          capabilityNeed: selectedResource.capabilityTags[0] || 'general-lab',
          minutes: durationMinutes
        }
      ],
      requestedSlot: {
        date: slotDate,
        startTime,
        endTime
      },
      deadline: `${deadlineDate}T17:00:00.000Z`,
      flexibility: 0.3,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    const ok = await submitNewRequest(newRequest);
    if (ok) {
      setSubmittedRequest(newRequest);
      setToast(`Request submitted. Forwarded for Faculty review.`);
    }
  };

  return (
    <div className="space-y-8 pt-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-rule pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <span className="font-mono text-signal text-xl font-bold">03</span>
          <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
            Project-Based Access Requests
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Book dedicated laboratory time for capstones, theses, and coursework with atomic slot reservations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('wizard')}
            className={`px-3 py-1.5 border transition-colors ${
              activeTab === 'wizard'
                ? 'border-ink bg-ink text-paper font-semibold'
                : 'border-rule hover:bg-tint text-ink'
            }`}
          >
            + Request Intake
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`px-3 py-1.5 border transition-colors ${
              activeTab === 'tracker'
                ? 'border-ink bg-ink text-paper font-semibold'
                : 'border-rule hover:bg-tint text-ink'
            }`}
          >
            Request Tracker ({scenario.requests.length})
          </button>
        </div>
      </div>

      {activeTab === 'tracker' ? (
        /* Lifecycle Milestone Stepper Tracker */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-tint/30 p-3 border border-rule font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-ink-3 text-[11px] uppercase">Filter Status:</span>
              {['all', 'submitted', 'under-review', 'approved', 'waitlisted'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setTrackerFilter(st)}
                  className={`px-2.5 py-1 border text-xs capitalize transition-colors ${
                    trackerFilter === st
                      ? 'border-ink bg-ink text-paper font-semibold'
                      : 'border-rule hover:bg-tint text-ink-2'
                  }`}
                >
                  {st.replace('-', ' ')}
                </button>
              ))}
            </div>
            <span className="text-ink-3 text-[11px]">Bundle Policy: Atomic all-or-nothing allocation</span>
          </div>

          <div className="space-y-4">
            {scenario.requests
              .filter((r) => trackerFilter === 'all' || r.status === trackerFilter)
              .map((req) => {
                const res = scenario.resources.find((item) => item.id === req.items[0]?.resourceId);
                const lab = (scenario.labs || []).find((l) => l.id === res?.labId);

                const isUnderReview = req.status === 'under-review' || req.status === 'approved' || req.status === 'rejected';
                const isFinal = req.status === 'approved' || req.status === 'rejected' || req.status === 'changes-requested';

                const nextActionMap: Record<string, string> = {
                  submitted: 'Pending review by Faculty Advisor (Prof. Radhika Sen).',
                  'under-review': 'Under deterministic conflict arbitration. Evaluating priority score.',
                  approved: 'Slot approved. Reservation confirmed in live laboratory schedule.',
                  rejected: 'Request declined by faculty. Alternative lab benches available in Discover.',
                  'changes-requested': 'Advisor requested time adjustment. Resubmit request.',
                  waitlisted: 'Queued on priority waitlist. Auto-promoted upon session forfeiture.',
                  draft: 'Draft pending final submission.'
                };

                return (
                  <div key={req.id} className="border border-rule bg-paper p-5 space-y-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule-soft pb-3 font-mono text-xs">
                      <div>
                        <span className="text-signal font-bold uppercase text-[10px] tracking-wider">
                          REQUEST ID: {req.id}
                        </span>
                        <h2 className="text-base font-bold text-ink mt-0.5">{req.title}</h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-ink-3">By: <strong>{req.studentName}</strong></span>
                        <span className="px-2 py-0.5 border border-rule uppercase font-bold text-[10px] bg-tint">
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {/* Stepper Milestone Graphic */}
                    <div className="grid grid-cols-4 gap-2 font-mono text-center text-xs py-2">
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-ink" />
                        <span className="text-[10px] font-bold text-ink block">1. Drafted</span>
                        <span className="text-[9px] text-ink-3 block">Intake verified</span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-ink" />
                        <span className="text-[10px] font-bold text-ink block">2. Submitted</span>
                        <span className="text-[9px] text-ink-3 block">Campus queue</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`h-1.5 w-full ${isUnderReview ? 'bg-signal' : 'bg-rule-soft'}`} />
                        <span className={`text-[10px] font-bold block ${isUnderReview ? 'text-signal' : 'text-ink-3'}`}>
                          3. Evaluation
                        </span>
                        <span className="text-[9px] text-ink-3 block">Faculty audit</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`h-1.5 w-full ${isFinal ? 'bg-emerald-600' : 'bg-rule-soft'}`} />
                        <span className={`text-[10px] font-bold block ${isFinal ? 'text-emerald-700' : 'text-ink-3'}`}>
                          4. Final Allocation
                        </span>
                        <span className="text-[9px] text-ink-3 block">{req.status}</span>
                      </div>
                    </div>

                    {/* Metadata & Next Action Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono bg-tint/20 p-3 border border-rule-soft">
                      <div className="space-y-1">
                        <div><strong className="text-ink">Facility:</strong> {lab?.name || res?.location || 'Central Instrumentation'}</div>
                        <div><strong className="text-ink">Target Device:</strong> {res?.name || req.items[0]?.resourceId}</div>
                        <div><strong className="text-ink">Requested Slot:</strong> {req.requestedSlot.date} • {req.requestedSlot.startTime}–{req.requestedSlot.endTime}</div>
                      </div>
                      <div className="space-y-1">
                        <div><strong className="text-ink">Project Deadline:</strong> {new Date(req.deadline).toLocaleDateString()}</div>
                        <div><strong className="text-ink">Bundle Policy:</strong> All-or-nothing atomic lock</div>
                        <div className="text-signal font-semibold pt-1">
                          Next Action: {nextActionMap[req.status] || 'Processing request.'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : submittedRequest ? (
        <div className="border-2 border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-600 inline-block" aria-hidden="true" />
              <span className="font-mono text-xs font-bold uppercase text-emerald-800 dark:text-emerald-200">
                Request Successfully Submitted &bull; Pending Faculty Review
              </span>
            </div>
            <StatusGlyph status="submitted" />
          </div>

          <div className="space-y-1 font-mono text-xs text-ink-2">
            <h2 className="text-lg font-bold text-ink">{submittedRequest.title}</h2>
            <div>Target Equipment: <strong>{selectedResource?.name}</strong></div>
            <div>Requested Slot: <strong>{submittedRequest.requestedSlot.date} ({submittedRequest.requestedSlot.startTime} - {submittedRequest.requestedSlot.endTime})</strong></div>
            <div>Project Deadline: <strong>{new Date(submittedRequest.deadline).toLocaleDateString()}</strong></div>
          </div>

          <p className="text-xs text-ink-3 leading-relaxed">
            Your request is now in the queue. If another student requests this slot, the deterministic conflict engine will evaluate fair allocation based on project deadlines and past usage.
          </p>

          <div className="pt-3 border-t border-rule-soft flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/conflicts')}
              className="bg-signal text-white px-5 py-2.5 font-mono text-xs uppercase font-bold hover:opacity-90"
            >
              Check Conflict Center &rarr;
            </button>
            <button
              onClick={() => setSubmittedRequest(null)}
              className="px-4 py-2.5 border border-rule font-mono text-xs uppercase text-ink hover:bg-tint"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* AI Assistant Section */}
          <div className="border border-cobalt bg-blue-50/40 dark:bg-blue-950/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-cobalt inline-block" aria-hidden="true" />
                <span className="font-mono text-xs font-bold text-cobalt uppercase">
                  AI Natural-Language Intake
                </span>
              </div>
              {aiSourceBadge && (
                <span className="font-mono text-[11px] px-2 py-0.5 border border-cobalt text-cobalt bg-paper">
                  Source: {aiSourceBadge}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-2">
              Describe what you are building or testing in plain language. LabLink will match required hardware capabilities and generate an editable request draft.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. I need an edge GPU board to run real-time YOLOv8 drone video inference before Thursday..."
                className="w-full px-3 py-2 text-xs border border-rule-soft bg-paper text-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAiMatch}
                disabled={aiLoading}
                className="bg-cobalt text-white px-4 py-2 font-mono text-xs uppercase font-semibold hover:opacity-90 disabled:opacity-50 shrink-0 inline-flex items-center space-x-1.5"
              >
                <span>{aiLoading ? 'Matching...' : 'Auto-Draft'}</span>
                {!aiLoading && (
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="2" y1="8" x2="14" y2="8" />
                    <polyline points="9 3 14 8 9 13" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Structured Request Form */}
          <form onSubmit={handleSubmit} className="border border-rule bg-paper p-6 space-y-6">
            <h2 className="font-mono text-sm font-bold uppercase text-ink border-b border-rule-soft pb-2">
              Request Specifications
            </h2>

            {/* Resource Picker */}
            <div className="space-y-1.5">
              <label htmlFor="resource-select" className="block font-mono text-xs text-ink-2 font-semibold">
                Target Equipment / Laboratory Workstation <span className="text-signal">*</span>
              </label>
              <select
                id="resource-select"
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-rule-soft bg-paper text-ink focus:outline-none"
              >
                {scenario.resources.map((res: Resource) => (
                  <option key={res.id} value={res.id}>
                    {res.name} ({res.departmentId.replace('dept_', '').toUpperCase()} &bull; {res.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Safety Prerequisite Warning */}
            {missingCerts.length > 0 && (
              <div className="p-3 border border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-xs font-mono space-y-1">
                <div className="font-bold">Missing Safety Certification:</div>
                <div>
                  You lack required certifications: <strong>{missingCerts.join(', ')}</strong>. This request may be flagged or rejected during feasibility arbitration.
                </div>
              </div>
            )}

            {/* Operating Hours & Deadline Gate Warnings */}
            {isOutsideHours && (
              <div className="p-3 border border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-mono">
                Requested time window is outside standard campus operating hours (08:00 &ndash; 20:00).
              </div>
            )}

            {isAfterDeadline && (
              <div className="p-3 border border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-xs font-mono">
                Requested slot date cannot be after the project deadline ({deadlineDate}).
              </div>
            )}

            {/* Title & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="project-title" className="block font-mono text-xs text-ink-2 font-semibold">
                  Project Title / Milestone <span className="text-signal">*</span>
                </label>
                <input
                  id="project-title"
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-rule-soft bg-paper text-ink focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="duration-min" className="block font-mono text-xs text-ink-2 font-semibold">
                  Session Duration (Minutes) <span className="text-signal">*</span>
                </label>
                <input
                  id="duration-min"
                  type="number"
                  min="30"
                  max={selectedResource?.maxSessionMinutes || 240}
                  step="15"
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-rule-soft bg-paper text-ink focus:outline-none"
                />
              </div>
            </div>

            {/* Justification */}
            <div className="space-y-1.5">
              <label htmlFor="justification" className="block font-mono text-xs text-ink-2 font-semibold">
                Academic Justification &amp; Testbench Plan <span className="text-signal">*</span>
              </label>
              <textarea
                id="justification"
                required
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-rule-soft bg-paper text-ink focus:outline-none"
              />
            </div>

            {/* Date, Time & Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label htmlFor="slot-date" className="block text-ink-2 font-semibold">
                  Slot Date <span className="text-signal">*</span>
                </label>
                <input
                  id="slot-date"
                  type="date"
                  required
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full px-3 py-2 border border-rule-soft bg-paper text-ink focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="start-time" className="block text-ink-2 font-semibold">
                  Start Time <span className="text-signal">*</span>
                </label>
                <input
                  id="start-time"
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-rule-soft bg-paper text-ink focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="end-time" className="block text-ink-2 font-semibold">
                  End Time <span className="text-signal">*</span>
                </label>
                <input
                  id="end-time"
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-rule-soft bg-paper text-ink focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="deadline-date" className="block text-ink-2 font-semibold">
                  Project Deadline <span className="text-signal">*</span>
                </label>
                <input
                  id="deadline-date"
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 border border-rule-soft bg-paper text-ink focus:outline-none"
                />
              </div>
            </div>

            {/* Form Submission */}
            <div className="pt-4 border-t border-rule-soft flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/discover')}
                className="text-xs font-mono text-ink-3 hover:text-ink inline-flex items-center space-x-1"
              >
                <span aria-hidden="true">&larr;</span>
                <span>Back to Catalog</span>
              </button>

              <button
                type="submit"
                className="bg-signal hover:opacity-90 text-white px-6 py-3 font-mono text-xs font-bold uppercase transition-opacity inline-flex items-center space-x-2"
              >
                <span>Submit Access Request</span>
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="2" y1="8" x2="14" y2="8" />
                  <polyline points="9 3 14 8 9 13" />
                </svg>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
