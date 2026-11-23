import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext.js';
import { Booking, DemoScenario } from 'shared';

export function BookingsPage() {
  const { scenario, updateScenario } = useScenario();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const bookings = scenario.bookings || [];

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
  };

  const handleSimulateNoShow = (bookingId: string) => {
    updateScenario((prev: DemoScenario) => ({
      ...prev,
      bookings: prev.bookings.map((b: Booking) =>
        b.id === bookingId ? { ...b, status: 'no-show' as const } : b
      )
    }));
  };

  const handleComplete = (bookingId: string) => {
    updateScenario((prev: DemoScenario) => ({
      ...prev,
      bookings: prev.bookings.map((b: Booking) =>
        b.id === bookingId ? { ...b, status: 'completed' as const } : b
      )
    }));
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
            Review confirmed, active, and completed laboratory allocations. Test check-in events and auto-release no-show policies.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link
            to="/discover"
            className="px-3 py-1.5 bg-ink text-paper hover:bg-signal transition-colors font-medium"
          >
            + Book New Slot
          </Link>
        </div>
      </div>

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
      <div className="space-y-3">
        {filteredBookings.map((b: Booking) => {
          const res = scenario.resources.find((r) => r.id === b.resourceId);
          const lab = (scenario.labs || []).find((l) => l.id === res?.labId);

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
              className="border border-rule bg-paper p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-ink transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${statusStyles}`}>
                    {b.status}
                  </span>
                  <span className="text-xs font-mono text-ink-3">ID: {b.id}</span>
                </div>

                <div className="font-bold text-base text-ink">
                  {res?.name || b.resourceId}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-ink-2">
                  <div>
                    <span className="text-ink-3">Reservee: </span>
                    <span className="font-semibold text-ink">{b.studentName}</span>
                  </div>
                  <div>
                    <span className="text-ink-3">Date: </span>
                    <span className="font-semibold text-ink">{b.date}</span>
                  </div>
                  <div>
                    <span className="text-ink-3">Window: </span>
                    <span className="font-semibold text-ink">{b.startTime} — {b.endTime}</span>
                  </div>
                  <div>
                    <span className="text-ink-3">Facility: </span>
                    <span>{lab?.name || res?.location || 'Campus Lab'}</span>
                  </div>
                </div>

                {b.checkedInAt && (
                  <div className="text-[11px] font-mono text-signal">
                    Checked in at {new Date(b.checkedInAt).toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 font-mono text-xs shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-rule-soft">
                {b.status === 'confirmed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCheckIn(b.id)}
                      className="px-3 py-1.5 bg-ink text-paper hover:bg-signal transition-colors font-medium"
                    >
                      Check In Now
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateNoShow(b.id)}
                      className="px-2.5 py-1.5 border border-signal text-signal hover:bg-signal hover:text-white transition-colors"
                      title="Demonstrate slot forfeiture and waitlist notification"
                    >
                      Trigger No-Show
                    </button>
                  </>
                )}

                {b.status === 'in-progress' && (
                  <button
                    type="button"
                    onClick={() => handleComplete(b.id)}
                    className="px-3 py-1.5 border border-ink text-ink hover:bg-ink hover:text-paper transition-colors font-medium"
                  >
                    Mark Finished
                  </button>
                )}

                {(b.status === 'completed' || b.status === 'no-show') && (
                  <span className="text-xs text-ink-3 italic">Session finalized</span>
                )}
              </div>
            </div>
          );
        })}

        {filteredBookings.length === 0 && (
          <div className="p-8 border border-rule text-center bg-tint/10 font-mono text-xs text-ink-3">
            No bookings recorded under status: {selectedStatus}.
          </div>
        )}
      </div>
    </div>
  );
}
