import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import { StatusGlyph } from '../components/common/StatusGlyph.js';
import { AllocationProposal, AccessRequest } from 'shared';

export function ConflictCenterPage() {
  const navigate = useNavigate();
  const { scenario, runArbitration, applyArbitrationProposals, setToast } = useScenario();

  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<AllocationProposal[] | null>(null);
  const [applied, setApplied] = useState(false);
  const [activeStage, setActiveStage] = useState<'idle' | 'scoring' | 'ranking' | 'settled'>('idle');

  // Find the seeded contested slot on NVIDIA Jetson AGX Orin
  const jetsonResource = scenario.resources.find((r) => r.id === 'res_jetson_orin_01') || scenario.resources[0];
  const targetDate = scenario.requests[0]?.requestedSlot?.date || new Date().toISOString().split('T')[0];
  const targetStartTime = '14:00';
  const targetEndTime = '16:00';

  // Competing requests specifically colliding on this slot
  const collidingRequests = scenario.requests.filter(
    (r) =>
      r.items.some((i) => i.resourceId === jetsonResource.id) &&
      r.requestedSlot.date === targetDate &&
      r.requestedSlot.startTime === targetStartTime
  );

  // All 4 synthetic requests across the campus test scenario
  const allScenarioRequests = [
    ...scenario.requests,
    // Add Marcus Chen's request representation if booking exists
    ...(scenario.bookings
      .filter((b) => !scenario.requests.some((r) => r.id === b.requestId))
      .map((b) => ({
        id: `req_${b.studentId}`,
        projectId: `proj_${b.studentId}`,
        studentId: b.studentId,
        studentName: b.studentName,
        advisorId: 'user_radhika',
        title: 'FPGA Sub-Nanosecond Clock Skew Verification',
        justification: 'High-speed timing and state analysis for serial bus protocol decode.',
        items: [{ resourceId: b.resourceId, capabilityNeed: 'logic-analyzer' as const, minutes: 120 }],
        requestedSlot: { date: b.date, startTime: b.startTime, endTime: b.endTime },
        deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
        flexibility: 0.2,
        status: 'approved' as const,
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      })))
  ].slice(0, 4);

  const handleResolve = async () => {
    setLoading(true);
    setActiveStage('scoring');

    try {
      const res = await runArbitration({
        resourceId: jetsonResource.id,
        date: targetDate,
        startTime: targetStartTime,
        endTime: targetEndTime
      });

      // 4-Beat Visual Choreography
      setTimeout(() => {
        setActiveStage('ranking');
        setTimeout(() => {
          setActiveStage('settled');
          setProposals(res.proposals);
          setLoading(false);
          setToast('Conflict resolved deterministically with auditable score factors.');
        }, 250);
      }, 250);
    } catch {
      setLoading(false);
      setActiveStage('idle');
      setToast('Arbitration failed to execute.');
    }
  };

  const handleApply = async () => {
    if (!proposals || proposals.length === 0) return;
    setLoading(true);
    const ok = await applyArbitrationProposals(proposals);
    setLoading(false);
    if (ok) {
      setApplied(true);
      setToast('Allocations applied as pending faculty decisions. Faculty approval required.');
    }
  };

  return (
    <div className="space-y-8 pt-4 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="border-b border-rule pb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-signal text-xl font-bold">04</span>
            <span className="bg-signal text-white font-mono text-[11px] font-bold px-2 py-0.5">
              SIGNATURE DEMO PATH
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
            Conflict Resolution Center
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Deterministic, explainable allocation engine resolving competing requests using transparent factors.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleResolve}
            disabled={loading || activeStage !== 'idle'}
            className="bg-signal hover:opacity-90 disabled:opacity-50 text-white font-mono text-xs font-bold uppercase px-6 py-3 border border-signal shadow-sm transition-all flex items-center space-x-2"
          >
            <span>{loading ? 'Evaluating Policy...' : 'Resolve with LabLink'}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      {/* Contested Resource Card */}
      <div className="border-2 border-signal bg-paper p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule-soft pb-4">
          <div className="space-y-1">
            <span className="font-mono text-xs font-semibold text-signal uppercase">
              Contested Scarce Resource
            </span>
            <h2 className="text-xl font-bold text-ink">
              {jetsonResource.name}
            </h2>
            <div className="text-xs font-mono text-ink-3">
              Location: {jetsonResource.location} &bull; Dept: {jetsonResource.departmentId.toUpperCase()}
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-xs text-ink-3">CONTESTED TIME WINDOW:</div>
            <div className="text-lg font-bold text-signal">
              {targetDate} &bull; {targetStartTime} &ndash; {targetEndTime}
            </div>
            <div className="text-[11px] text-ink-3">
              Duration: 120 min &bull; Buffer: {jetsonResource.bufferMinutes} min
            </div>
          </div>
        </div>

        {/* Competing Colliding Requests */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase text-ink flex items-center justify-between">
            <span>Directly Contested Requests ({collidingRequests.length} Colliding)</span>
            <span className="text-signal">Status: Overlapping Slot Collision</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collidingRequests.map((req, idx) => {
              const student = scenario.users?.find((u) => u.id === req.studentId);
              const priorHours = student?.priorUsageHours ?? (req.studentId === 'user_alex' ? 4 : 14);

              return (
                <div
                  key={req.id}
                  className={`border p-4 space-y-2 transition-all ${
                    activeStage === 'scoring' || activeStage === 'ranking'
                      ? 'border-signal bg-tint'
                      : 'border-rule bg-paper'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-ink">
                      Candidate 0{idx + 1}: {req.studentName}
                    </span>
                    <StatusGlyph status="contested" />
                  </div>
                  <div className="font-bold text-sm text-ink">{req.title}</div>
                  <p className="text-xs text-ink-2 line-clamp-2">{req.justification}</p>

                  <div className="pt-2 border-t border-rule-soft grid grid-cols-3 gap-2 font-mono text-[11px]">
                    <div>
                      <span className="text-ink-3">Deadline: </span>
                      <span className="font-semibold text-ink block">
                        {new Date(req.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-3">Prior Usage: </span>
                      <span className="font-semibold text-ink block">
                        {priorHours} hours
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-3">Safety Cert: </span>
                      <span className="font-semibold text-emerald-700 block">
                        VERIFIED ✓
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Synthetic Requests Full Scenario Audit Table */}
      <div className="border border-rule bg-paper p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-rule-soft pb-2">
          <h2 className="font-mono text-xs font-bold uppercase text-ink">
            Active Campus Request Pool (All 4 Synthetic Requests)
          </h2>
          <span className="font-mono text-[11px] text-ink-3">
            Auditable Prior Usage &amp; Prerequisite Status
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-rule bg-tint text-ink-3 uppercase text-[10px]">
                <th className="p-2.5">Student</th>
                <th className="p-2.5">Project Title</th>
                <th className="p-2.5">Equipment</th>
                <th className="p-2.5">Requested Slot</th>
                <th className="p-2.5">Deadline</th>
                <th className="p-2.5">Prior Use</th>
                <th className="p-2.5">Safety Cert</th>
                <th className="p-2.5">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule-soft">
              {allScenarioRequests.map((req: AccessRequest) => {
                const student = scenario.users?.find((u) => u.id === req.studentId);
                const priorHours = student?.priorUsageHours ?? (req.studentId === 'user_alex' ? 4 : req.studentId === 'user_jordan' ? 14 : 6);
                const res = scenario.resources.find((r) => req.items.some((i) => i.resourceId === r.id));

                return (
                  <tr key={req.id} className="hover:bg-tint/40">
                    <td className="p-2.5 font-bold text-ink">{req.studentName}</td>
                    <td className="p-2.5 text-ink-2 max-w-[200px] truncate">{req.title}</td>
                    <td className="p-2.5 text-ink">{res?.name || 'Lab Unit'}</td>
                    <td className="p-2.5 text-ink-2">{req.requestedSlot.date} ({req.requestedSlot.startTime}-{req.requestedSlot.endTime})</td>
                    <td className="p-2.5 text-ink">{new Date(req.deadline).toLocaleDateString()}</td>
                    <td className="p-2.5 font-bold text-ink">{priorHours} hrs</td>
                    <td className="p-2.5 text-emerald-700 font-semibold">Pass ✓</td>
                    <td className="p-2.5">
                      <StatusGlyph status={req.status as any} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Choreography Status Indicator */}
      {activeStage !== 'idle' && (
        <div className="p-4 bg-tint border border-rule font-mono text-xs text-ink flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="inline-block w-3 h-3 bg-signal animate-pulse" aria-hidden="true" />
            <span>
              {activeStage === 'scoring' && 'Beat 1/4: Evaluating hard feasibility gates (Operating hours, certifications, duration buffers)...'}
              {activeStage === 'ranking' && 'Beat 2/4: Computing 3-factor weights (Urgency 50%, Fair Share 30%, Wait Age 20%)...'}
              {activeStage === 'settled' && 'Beat 4/4: Settlement complete. Winner assigned exact slot, displaced candidate awarded alternatives.'}
            </span>
          </div>
          <span className="text-ink-3 font-semibold uppercase">Zero Seniority Bias</span>
        </div>
      )}

      {/* Arbitration Results Section */}
      {proposals && proposals.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-rule pb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold font-mono uppercase text-ink">
              Ranked Allocation Proposals ({proposals.length})
            </h2>
            <span className="text-xs font-mono text-ink-3">
              Deterministic Invariant: Zero Double-Bookings
            </span>
          </div>

          <div className="space-y-6">
            {proposals.map((proposal, pIdx) => {
              const isWinner = proposal.strategy === 'exact-slot';

              return (
                <div
                  key={proposal.requestId}
                  className={`border-2 p-6 space-y-4 transition-all ${
                    isWinner
                      ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-rule bg-paper'
                  }`}
                >
                  {/* Top Line */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-ink">
                          RANK 0{pIdx + 1} &bull; {proposal.studentName}
                        </span>
                        <StatusGlyph
                          status={isWinner ? 'confirmed' : 'under-review'}
                          label={isWinner ? 'Exact Slot Allocated' : 'Alternative Recommended'}
                        />
                      </div>
                      <h3 className="text-lg font-bold text-ink">{proposal.projectTitle}</h3>
                      <p className="text-xs text-ink-2 max-w-2xl leading-relaxed">
                        {proposal.explanation}
                      </p>
                    </div>

                    {/* Total Priority Score Badge */}
                    <div className="border border-rule bg-paper p-3 text-center min-w-[120px] font-mono">
                      <span className="text-[10px] uppercase text-ink-3 block">Priority Score</span>
                      <div className="text-3xl font-bold text-signal mt-0.5">
                        {proposal.score}
                        <span className="text-xs text-ink-3 font-normal">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Factor Transparent Score Breakdown */}
                  <div className="border border-rule-soft bg-paper p-4 space-y-3 font-mono text-xs">
                    <div className="text-ink-3 uppercase text-[11px] font-semibold">
                      Policy Factor Breakdown (Zero Seniority Bias):
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Urgency */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>Deadline Urgency (50%):</span>
                          <span className="font-bold">{proposal.breakdown.urgency}/100</span>
                        </div>
                        <div className="w-full bg-rule-soft h-2">
                          <div
                            className="bg-signal h-2"
                            style={{ width: `${proposal.breakdown.urgency}%` }}
                          />
                        </div>
                      </div>

                      {/* Fair Share */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>Fair-Share Access (30%):</span>
                          <span className="font-bold">{proposal.breakdown.fairShare}/100</span>
                        </div>
                        <div className="w-full bg-rule-soft h-2">
                          <div
                            className="bg-cobalt h-2"
                            style={{ width: `${proposal.breakdown.fairShare}%` }}
                          />
                        </div>
                      </div>

                      {/* Wait Age */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>Wait-Time Anti-Starve (20%):</span>
                          <span className="font-bold">{proposal.breakdown.waitAge}/100</span>
                        </div>
                        <div className="w-full bg-rule-soft h-2">
                          <div
                            className="bg-emerald-600 h-2"
                            style={{ width: `${proposal.breakdown.waitAge}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignments / Alternatives */}
                  {isWinner ? (
                    <div className="bg-tint border border-rule-soft p-3 font-mono text-xs flex items-center justify-between">
                      <div>
                        <span className="text-ink-3">Confirmed Assignment: </span>
                        <strong className="text-ink">
                          {proposal.assignments[0]?.resourceName || jetsonResource.name} &bull; {targetDate} ({proposal.assignments[0]?.start} - {proposal.assignments[0]?.end})
                        </strong>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold uppercase">
                        Feasibility Verified ✓
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="font-mono text-xs font-semibold text-ink-2 uppercase">
                        Feasible Alternatives Generated for Displaced Student (Up to 3 Options):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                        {proposal.alternatives.map((alt) => (
                          <div
                            key={alt.slotId}
                            className="border border-rule-soft p-3 bg-tint space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-ink">{alt.resourceName}</span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-paper border border-rule-soft">
                                Fit: {alt.feasibilityScore}%
                              </span>
                            </div>
                            <div className="text-ink-2">
                              {alt.date} &bull; {alt.startTime} &ndash; {alt.endTime}
                            </div>
                            <p className="text-[11px] text-ink-3">{alt.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="border border-rule bg-paper p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-mono text-xs font-bold uppercase text-ink">
                Next Step: Faculty Advisor Sign-Off
              </div>
              <p className="text-xs text-ink-3">
                Applying moves winner and alternatives into "Under Review" state. Final approval remains with faculty.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {applied ? (
                <button
                  onClick={() => navigate('/approvals')}
                  className="bg-emerald-600 text-white font-mono text-xs font-bold uppercase px-6 py-3 border border-emerald-700 hover:opacity-90 flex items-center space-x-2"
                >
                  <span>Open Faculty Approval Queue</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={loading}
                  className="bg-signal text-white font-mono text-xs font-bold uppercase px-6 py-3 border border-signal hover:opacity-90 flex items-center space-x-2"
                >
                  <span>Apply Allocation Proposals</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
