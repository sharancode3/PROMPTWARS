import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import { Booking, DemoScenario, SessionFeedback } from 'shared';

export function BookingsPage() {
  const { scenario, role, setRole, updateScenario, setToast } = useScenario();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [noShowModalBooking, setNoShowModalBooking] = useState<Booking | null>(null);
  const [feedbackModalBooking, setFeedbackModalBooking] = useState<Booking | null>(null);

  // Feedback form state
  const [fbCondition, setFbCondition] = useState<SessionFeedback['condition']>('operational');
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbIssues, setFbIssues] = useState<string[]>(['Clean lenses', 'Power cables intact']);
  const [fbComment, setFbComment] = useState<string>('Hardware operated within nominal thermal and calibration limits.');

  const bookings = scenario.bookings || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredBookings = useMemo(() => {
    if (selectedStatus === 'all') return bookings;
    return bookings.filter((b) => b.status === selectedStatus);
  }, [bookings, selectedStatus]);

  const handleCheckIn = (bookingId: string) => {
    updateScenario((prev: DemoScenario) => ({
      ...prev,
      bookings: prev.bookings.map((b: Booking) =>
        b.id === bookingId
          ? { ...b, status: 'in-progress' as const, checkedInAt: new Date().toISOString() }
          : b
      )
    }));
    setToast('Student checked in. Session status transitioned to In Progress.');
  };

  const handleOpenNoShowModal = (b: Booking) => {
    if (role === 'student') {
      setToast('No-show declarations require Faculty Advisor or Lab Admin authorization.');
      return;
    }
    setNoShowModalBooking(b);
  };

  const handleConfirmNoShow = () => {
    if (!noShowModalBooking) return;
    const targetBooking = noShowModalBooking;

    // Search for waitlisted requests for this equipment
    const waitlisted = scenario.requests.find(
      (r) => r.status === 'waitlisted' && r.items.some((i) => i.resourceId === targetBooking.resourceId)
    );

    updateScenario((prev: DemoScenario) => {
      let updatedBookings = prev.bookings.map((b) =>
        b.id === targetBooking.id ? { ...b, status: 'no-show' as const } : b
      );
      let updatedRequests = prev.requests;

      if (waitlisted) {
        // Promote waitlisted student
        updatedRequests = updatedRequests.map((r) =>
          r.id === waitlisted.id ? { ...r, status: 'approved' as const } : r
        );
        const newBooking: Booking = {
          id: `book_promo_${Date.now()}`,
          resourceId: targetBooking.resourceId,
          requestId: waitlisted.id,
          studentId: waitlisted.studentId,
          studentName: waitlisted.studentName,
          date: targetBooking.date,
          startTime: targetBooking.startTime,
          endTime: targetBooking.endTime,
          status: 'confirmed'
        };
        updatedBookings = [...updatedBookings, newBooking];
      }

      return {
        ...prev,
        bookings: updatedBookings,
        requests: updatedRequests
      };
    });

    if (waitlisted) {
      setToast(`Slot forfeited. Waitlisted student ${waitlisted.studentName} automatically promoted to confirmed reservation!`);
    } else {
      setToast(`Slot marked as no-show and released back to open campus capacity.`);
    }
    setNoShowModalBooking(null);
  };

  const handleOpenFeedback = (b: Booking) => {
    setFeedbackModalBooking(b);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalBooking) return;

    const feedback: SessionFeedback = {
      condition: fbCondition,
      rating: fbRating,
      issueTags: fbIssues,
      comment: fbComment.trim() || undefined,
      submittedAt: new Date().toISOString()
    };

    updateScenario((prev: DemoScenario) => ({
      ...prev,
      bookings: prev.bookings.map((b: Booking) =>
        b.id === feedbackModalBooking.id
          ? { ...b, status: 'completed' as const, feedback }
          : b
      )
    }));

    setToast(`Session finalized. Diagnostic feedback recorded for facility telemetry.`);
    setFeedbackModalBooking(null);
  };

  const toggleIssueTag = (tag: string) => {
    setFbIssues((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-rule pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
            07 BOOKINGS • SCHEDULE TIMELINE
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            Laboratory Slot Bookings
          </h1>
          <p className="text-sm text-ink-2 mt-1 max-w-2xl">
            Live schedule audit trail, check-in window validation, and waitlist promotion.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link
            to="/discover"
            className="px-3.5 py-2 bg-ink text-paper hover:bg-signal transition-colors font-medium"
          >
            + Book New Slot
          </Link>
        </div>
      </div>

      {/* Role Reminder for No-Show Execution */}
      {role === 'student' && (
        <div className="bg-tint/40 border border-rule-soft p-3 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-ink-2">
            Viewing as Student ({scenario.users?.find((u) => u.role === 'student')?.name || 'Alex Rivera'}). Slot forfeiture &amp; no-show management is restricted to Faculty/Admin roles.
          </span>
          <button
            type="button"
            onClick={() => setRole('faculty')}
            className="text-signal hover:underline font-bold text-left sm:text-right shrink-0"
          >
            Switch to Faculty &rarr;
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs bg-tint/30 p-3 border border-rule">
        <span className="text-ink-3 mr-1 text-[11px] uppercase">Status:</span>
        {[
          { id: 'all', label: `All (${bookings.length})` },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'in-progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'no-show', label: 'No-Show' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-3 py-1 border transition-colors ${
              selectedStatus === tab.id
                ? 'border-ink bg-ink text-paper font-semibold'
                : 'border-rule hover:bg-tint text-ink-2'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((b: Booking) => {
          const res = scenario.resources.find((r) => r.id === b.resourceId);
          const lab = (scenario.labs || []).find((l) => l.id === res?.labId);

          const isToday = b.date === todayStr;

          const statusStyles = {
            confirmed: 'border-ink bg-tint text-ink font-semibold',
            'in-progress': 'border-signal bg-signal text-white font-bold',
            completed: 'border-rule bg-paper text-ink-3',
            'no-show': 'border-signal bg-signal/10 text-signal font-bold',
            pending: 'border-rule-soft bg-tint text-ink-2',
            cancelled: 'border-rule bg-tint text-ink-3 line-through'
          }[b.status] || 'border-rule text-ink';

          return (
            <div
              key={b.id}
              className="border border-rule bg-paper p-5 space-y-4 hover:border-ink transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className={`text-[10px] uppercase px-2 py-0.5 border ${statusStyles}`}>
                      {b.status}
                    </span>
                    <span className="text-xs text-ink-3">BOOKING REF: {b.id}</span>
                  </div>

                  <div className="font-bold text-lg text-ink">
                    {res?.name || b.resourceId}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-ink-2 pt-1">
                    <div>
                      <span className="text-ink-3 block text-[10px] uppercase">Reservee</span>
                      <span className="font-semibold text-ink">{b.studentName}</span>
                    </div>
                    <div>
                      <span className="text-ink-3 block text-[10px] uppercase">Scheduled Date</span>
                      <span className="font-semibold text-ink">{b.date}</span>
                    </div>
                    <div>
                      <span className="text-ink-3 block text-[10px] uppercase">Allocated Window</span>
                      <span className="font-semibold text-ink">{b.startTime} — {b.endTime}</span>
                    </div>
                    <div>
                      <span className="text-ink-3 block text-[10px] uppercase">Facility Room</span>
                      <span>{lab?.roomNumber || res?.location || 'Campus Lab'}</span>
                    </div>
                  </div>

                  {b.checkedInAt && (
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                      ● Checked in at {new Date(b.checkedInAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>

                {/* Actions Button Cluster */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs shrink-0 pt-2 md:pt-0">
                  {b.status === 'confirmed' && (
                    <>
                      {isToday ? (
                        <button
                          type="button"
                          onClick={() => handleCheckIn(b.id)}
                          className="px-3.5 py-2 bg-ink text-paper hover:bg-signal transition-colors font-medium"
                        >
                          Check In Now
                        </button>
                      ) : (
                        <div className="space-y-1">
                          <span
                            className="inline-block px-2.5 py-1.5 border border-rule-soft bg-tint text-ink-3 text-[11px]"
                            title="Check-in opens on the scheduled reservation date"
                          >
                            Check-In Window: {b.date} ({b.startTime})
                          </span>
                          {(role === 'faculty' || role === 'admin') && (
                            <button
                              type="button"
                              onClick={() => handleCheckIn(b.id)}
                              className="block text-[10px] text-signal underline hover:opacity-80"
                            >
                              Authorize Early Check-In
                            </button>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenNoShowModal(b)}
                        className={`px-3 py-1.5 border border-signal text-signal transition-colors ${
                          role === 'student' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-signal hover:text-white'
                        }`}
                        title={
                          role === 'student'
                            ? 'Admin or Faculty authorization required'
                            : 'Mark student as absent and promote waitlist'
                        }
                      >
                        Declare No-Show
                      </button>
                    </>
                  )}

                  {b.status === 'in-progress' && (
                    <button
                      type="button"
                      onClick={() => handleOpenFeedback(b)}
                      className="px-3.5 py-2 bg-emerald-700 text-white hover:bg-emerald-800 transition-colors font-bold uppercase tracking-wider"
                    >
                      Complete &amp; Submit Feedback &rarr;
                    </button>
                  )}

                  {b.status === 'completed' && !b.feedback && (
                    <button
                      type="button"
                      onClick={() => handleOpenFeedback(b)}
                      className="px-3 py-1.5 border border-rule hover:bg-tint text-ink text-xs"
                    >
                      + Add Wrap-up Diagnostic
                    </button>
                  )}

                  {b.status === 'no-show' && (
                    <span className="text-xs text-signal font-mono font-semibold">
                      [Slot Forfeited]
                    </span>
                  )}
                </div>
              </div>

              {/* Submitted Diagnostic Feedback Display */}
              {b.feedback && (
                <div className="border-t border-rule-soft pt-3 bg-tint/20 p-3 font-mono text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink uppercase text-[11px]">
                      Post-Session Diagnostic Wrap-Up:
                    </span>
                    <span className="text-ink-3 text-[10px]">
                      Rating: {'★'.repeat(b.feedback.rating)}{'☆'.repeat(5 - b.feedback.rating)} • Condition: <strong>{b.feedback.condition}</strong>
                    </span>
                  </div>
                  {b.feedback.comment && (
                    <p className="text-ink-2 font-sans text-xs italic">
                      "{b.feedback.comment}"
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {b.feedback.issueTags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 border border-rule-soft bg-paper text-ink-3">
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredBookings.length === 0 && (
          <div className="p-8 border border-rule text-center bg-tint/10 font-mono text-xs text-ink-3">
            No bookings recorded under status: {selectedStatus}.
          </div>
        )}
      </div>

      {/* No-Show Confirmation Dialog */}
      {noShowModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-paper border-2 border-signal p-6 max-w-md w-full space-y-4 font-mono text-xs shadow-xl">
            <div className="flex items-center space-x-2 text-signal font-bold text-sm">
              <span className="w-2.5 h-2.5 bg-signal" aria-hidden="true" />
              <h2 className="uppercase">Confirm Slot Forfeiture (No-Show)</h2>
            </div>
            <p className="text-ink-2 font-sans text-sm leading-relaxed">
              Are you sure you want to declare a no-show for <strong>{noShowModalBooking.studentName}</strong> on <strong>{noShowModalBooking.date}</strong> ({noShowModalBooking.startTime}–{noShowModalBooking.endTime})?
            </p>
            <div className="bg-tint/40 p-3 border border-rule-soft space-y-1">
              <div className="font-bold text-ink">Target Hardware: {scenario.resources.find(r => r.id === noShowModalBooking.resourceId)?.name}</div>
              <div className="text-ink-3">Outcome: Slot is released immediately. Any eligible waitlisted students will be auto-promoted.</div>
            </div>
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setNoShowModalBooking(null)}
                className="px-4 py-2 border border-rule text-ink hover:bg-tint"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmNoShow}
                className="px-5 py-2 bg-signal text-white font-bold uppercase hover:opacity-90"
              >
                Confirm Slot Forfeiture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Wrap-Up Feedback Modal */}
      {feedbackModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitFeedback}
            className="bg-paper border-2 border-ink p-6 max-w-lg w-full space-y-4 font-mono text-xs shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-rule-soft pb-2">
              <h2 className="text-sm font-bold uppercase text-ink">
                Session Wrap-Up &amp; Bench Diagnostic
              </h2>
              <button
                type="button"
                onClick={() => setFeedbackModalBooking(null)}
                className="text-ink-3 hover:text-ink text-base font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-ink-2 font-sans text-xs">
              Briefly log instrument condition and equipment readiness for subsequent student reservations. Does not impact student academic standing.
            </p>

            {/* Condition Picker */}
            <div className="space-y-1">
              <label className="block text-ink font-bold uppercase text-[11px]">
                Hardware Operational Condition:
              </label>
              <select
                value={fbCondition}
                onChange={(e) => setFbCondition(e.target.value as any)}
                className="w-full px-3 py-2 border border-rule bg-paper text-ink"
              >
                <option value="operational">Operational — Nominal Performance</option>
                <option value="needs-cleaning">Needs Cleaning / Debris on Stage</option>
                <option value="calibration-drift">Minor Calibration Drift Observed</option>
                <option value="hardware-issue">Hardware Malfunction / Defective Accessory</option>
              </select>
            </div>

            {/* Rating Stars */}
            <div className="space-y-1">
              <label className="block text-ink font-bold uppercase text-[11px]">
                Overall Session Utility (1 to 5):
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFbRating(val)}
                    className={`px-3 py-1.5 border font-bold text-sm ${
                      fbRating === val
                        ? 'border-ink bg-ink text-paper'
                        : 'border-rule hover:bg-tint text-ink-2'
                    }`}
                  >
                    {val} ★
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Tags */}
            <div className="space-y-1">
              <label className="block text-ink font-bold uppercase text-[11px]">
                Readiness Checklist Items:
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  'Clean lenses',
                  'Power cables intact',
                  'Environment reset',
                  'Software updated',
                  'Probes calibrated',
                  'Exhaust cleared'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleIssueTag(tag)}
                    className={`p-2 border text-left transition-colors ${
                      fbIssues.includes(tag)
                        ? 'border-ink bg-tint font-bold text-ink'
                        : 'border-rule text-ink-3 hover:text-ink'
                    }`}
                  >
                    {fbIssues.includes(tag) ? '✓ ' : '+ '} {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="block text-ink font-bold uppercase text-[11px]">
                Optional Field Observation:
              </label>
              <input
                type="text"
                value={fbComment}
                onChange={(e) => setFbComment(e.target.value)}
                placeholder="e.g. Heatsink temperature nominal; cleaned resin vat after job."
                className="w-full px-3 py-2 border border-rule bg-paper text-ink"
              />
            </div>

            <div className="pt-2 border-t border-rule-soft flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setFeedbackModalBooking(null)}
                className="px-4 py-2 border border-rule text-ink hover:bg-tint"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 text-white font-bold uppercase hover:bg-emerald-800"
              >
                Record Diagnostic &amp; Finish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
