import { useScenario } from '../../context/ScenarioContext.js';

export function LiveRegion() {
  const { toastMessage, setToast } = useScenario();

  return (
    <>
      {/* Screen-reader announcement container */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toastMessage}
      </div>

      {/* Visual Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 max-w-md bg-ink text-paper border border-signal p-4 shadow-xl font-mono text-xs flex items-start justify-between space-x-3 transition-opacity animate-in fade-in"
        >
          <div className="flex items-start space-x-2">
            <span className="inline-block w-2 h-2 mt-1 bg-signal shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-paper/70 hover:text-paper font-bold focus-visible:outline-none"
            aria-label="Dismiss toast"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
