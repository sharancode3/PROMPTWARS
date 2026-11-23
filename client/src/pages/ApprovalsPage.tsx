import { useState } from 'react';
import { useScenario } from '../context/ScenarioContext.js';
import { StatusGlyph } from '../components/common/StatusGlyph.js';
import { AccessRequest, Booking } from 'shared';

export function ApprovalsPage() {
  const { scenario, role, setRole, currentUser, decideApproval, setToast } = useScenario();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Capstone project schedule adjusted; slot deferred to next week.');

  // Find requests pending faculty approval
  const pendingRequests = scenario.requests.filter(
    (r) => r.status === 'submitted' || r.status === 'under-review'
  );

  const handleApprove = async (req: AccessRequest) => {
    const ok = await decideApproval(
      req.id,
      'approve',
      'Verified prerequisite safety certification and capstone timeline alignment.'
    );
    if (ok) {
      setToast(`Request "${req.title}" approved. Confirmed booking created.`);
    }
  };

  const handleRejectConfirm = async (reqId: string) => {
    if (!rejectReason.trim()) return;
    const ok = await decideApproval(reqId, 'reject', rejectReason);
    if (ok) {
      setRejectingId(null);
      setToast(`Request marked as rejected with reason recorded.`);
    }
  };

  return (
    <div className="space-y-8 pt-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-rule pb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <span className="font-mono text-signal text-xl font-bold">05</span>
          <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
            Faculty Advisor Approval Queue
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Review prerequisite safety certifications, verify project justification, and authorize bookings.
          </p>
        </div>

        <div className="font-mono text-xs border border-rule-soft bg-tint px-3 py-1.5 text-ink-2">
          {role === 'student' ? (
            <>
              <span>Viewer Role: </span>
              <strong className="text-ink">{currentUser.name} (Student)</strong>
              <span className="text-signal ml-2">[Read-Only Queue]</span>
            </>
          ) : (
            <>
              <span>Authorized Reviewer: </span>
              <strong className="text-ink">{currentUser.name}</strong>
              <span className="text-ink-3"> ({currentUser.departmentName || 'Campus Administration'})</span>
            </>
          )}
        </div>
      </div>

      {/* Student Role Warning Banner */}
      {role === 'student' && (
        <div className="border border-signal/60 bg-signal/5 p-4 font-mono text-xs space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-signal font-bold">
              <span className="w-2 h-2 bg-signal" aria-hidden="true" />
              <span className="uppercase">STUDENT VIEW • APPROVAL ACTIONS RESTRICTED</span>
            </div>
            <p className="text-ink-2 font-sans text-xs">
              You are signed in as <strong>{currentUser.name} (Student)</strong>. Faculty review, prerequisite sign-offs, and allocation decisions require Faculty Advisor or Administrator authorization.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRole('faculty')}
            className="bg-signal text-white px-4 py-2 font-mono text-xs font-bold uppercase hover:opacity-90 transition-opacity whitespace-nowrap self-start sm:self-center"
          >
            Switch to Faculty Persona &rarr;
          </button>
        </div>
      )}

      {/* Pending Requests List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-rule-soft pb-2">
          <h2 className="font-mono text-sm font-bold uppercase text-ink">
            Pending Queue ({pendingRequests.length} Requests Awaiting Action)
          </h2>
          <span className="text-xs font-mono text-ink-3">
            Atomic State Mutations &bull; Audit Trail
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="border border-rule bg-paper p-8 text-center space-y-2 font-mono">
            <span className="text-signal font-bold text-sm">NO PENDING REQUESTS</span>
            <p className="text-xs text-ink-3">
              All student access requests have been approved or resolved.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req: AccessRequest) => {
              const resource = scenario.resources.find((r) =>
                req.items.some((i) => i.resourceId === r.id)
              );

              return (
                <div
                  key={req.id}
                  className="border border-rule bg-paper p-6 space-y-4 hover:border-rule transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule-soft pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-ink">
                          {req.studentName}
                        </span>
                        <StatusGlyph status={req.status} />
                      </div>
                      <h3 className="text-lg font-bold text-ink">{req.title}</h3>
                      <div className="text-xs font-mono text-ink-3">
                        Target Equipment: <strong>{resource?.name || 'Lab Workstation'}</strong> ({resource?.location})
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs space-y-1">
                      <div className="text-ink-3">REQUESTED WINDOW:</div>
                      <div className="text-sm font-bold text-signal">
                        {req.requestedSlot.date} &bull; {req.requestedSlot.startTime} &ndash; {req.requestedSlot.endTime}
                      </div>
                      <div className="text-[11px] text-ink-3">
                        Deadline: {new Date(req.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Justification & Safety Checks */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="md:col-span-2 space-y-1">
                      <span className="text-ink-3 uppercase text-[10px]">Academic Justification:</span>
                      <p className="text-ink-2 leading-relaxed bg-tint p-3 border border-rule-soft">
                        {req.justification}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-ink-3 uppercase text-[10px]">Prerequisites Check:</span>
                      <div className="bg-tint p-3 border border-rule-soft space-y-1 text-[11px]">
                        <div>Safety Certs: <span className="text-emerald-700 font-bold">VERIFIED ✓</span></div>
                        <div>Duration Limit: <span className="text-emerald-700 font-bold">WITHIN CAP ✓</span></div>
                        <div>Operating Hours: <span className="text-emerald-700 font-bold">VALID (08:00-20:00) ✓</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  {rejectingId === req.id ? (
                    <div className="p-4 border border-rule-soft bg-tint space-y-3 font-mono text-xs">
                      <label className="block font-bold text-ink">Reason for Rejection / Changes:</label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border border-rule-soft bg-paper text-ink"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-3 py-1.5 border border-rule text-ink hover:bg-paper"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRejectConfirm(req.id)}
                          className="px-4 py-1.5 bg-signal text-white font-bold"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : role === 'student' ? (
                    <div className="pt-2 border-t border-rule-soft flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                      <span className="text-signal font-semibold">Faculty Authorization Required to Authorize Slot</span>
                      <button
                        type="button"
                        onClick={() => setRole('faculty')}
                        className="px-4 py-2 bg-ink text-paper hover:bg-signal font-bold uppercase transition-colors inline-flex items-center space-x-1.5"
                      >
                        <span>Switch to Faculty Persona &rarr;</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-rule-soft flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                      <span className="text-ink-3">Action Required by Faculty Advisor</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setRejectingId(req.id)}
                          className="px-4 py-2 border border-rule text-ink hover:bg-tint font-semibold"
                        >
                          Reject with Note
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase transition-colors inline-flex items-center space-x-1.5"
                        >
                          <span>Approve Slot</span>
                          <span aria-hidden="true">&rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmed Bookings Audit Trail */}
      <div className="border border-rule bg-paper p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-rule-soft pb-2">
          <h2 className="font-mono text-sm font-bold uppercase text-ink">
            Confirmed Laboratory Schedule &amp; Audit Trail ({scenario.bookings.length} Bookings)
          </h2>
          <span className="text-xs font-mono text-ink-3">
            Real-time Utilization Sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-rule bg-tint text-ink-3 uppercase text-[10px]">
                <th className="p-3">Booking ID</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Student</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time Window</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule-soft">
              {scenario.bookings.map((b: Booking) => {
                const res = scenario.resources.find((r) => r.id === b.resourceId);
                return (
                  <tr key={b.id} className="hover:bg-tint/50">
                    <td className="p-3 font-semibold text-ink">{b.id}</td>
                    <td className="p-3 text-ink">{res?.name || b.resourceId}</td>
                    <td className="p-3 text-ink-2">{b.studentName}</td>
                    <td className="p-3 text-ink-2">{b.date}</td>
                    <td className="p-3 font-bold text-signal">{b.startTime} &ndash; {b.endTime}</td>
                    <td className="p-3">
                      <StatusGlyph status="confirmed" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
