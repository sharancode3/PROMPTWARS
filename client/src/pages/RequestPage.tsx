import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import * as api from '../api/client.js';
import { AccessRequest, Resource } from 'shared';

export function RequestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scenario, currentUser, submitNewRequest, setToast } = useScenario();

  // Extract resourceId from URL query param if present
  const queryParams = new URLSearchParams(location.search);
  const initialResourceId = queryParams.get('resourceId') || scenario.resources[0]?.id || '';

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
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');

  // AI Intake State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSourceBadge, setAiSourceBadge] = useState<string | null>(null);

  const selectedResource = scenario.resources.find((r) => r.id === selectedResourceId);

  // Check safety prerequisites
  const missingCerts = (selectedResource?.requiresCertification || []).filter(
    (c) => !currentUser.certifications?.includes(c)
  );

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
      navigate('/conflicts');
    }
  };

  return (
    <div className="space-y-8 pt-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-rule pb-6">
        <span className="font-mono text-signal text-xl font-bold">03</span>
        <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
          Project-Based Access Request
        </h1>
        <p className="text-sm text-ink-3 mt-1">
          Book dedicated laboratory time for capstones, theses, and coursework with atomic slot reservations.
        </p>
      </div>

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
            className="bg-cobalt text-white px-4 py-2 font-mono text-xs uppercase font-semibold hover:opacity-90 disabled:opacity-50 shrink-0"
          >
            {aiLoading ? 'Matching...' : 'Auto-Draft &rarr;'}
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
            className="text-xs font-mono text-ink-3 hover:text-ink"
          >
            &larr; Back to Catalog
          </button>

          <button
            type="submit"
            className="bg-signal hover:opacity-90 text-white px-6 py-3 font-mono text-xs font-bold uppercase transition-opacity"
          >
            Submit Access Request &rarr;
          </button>
        </div>
      </form>
    </div>
  );
}
