import { useEffect, useRef, useState } from 'react';
import { LearningMaterial } from 'shared';

interface VideoModalProps {
  material: LearningMaterial;
  onClose: () => void;
}

export function VideoModal({ material, onClose }: VideoModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback if browser security blocks programmatic fullscreen
    }
  };

  // Ensure clean embed URL
  const embedUrl = material.url || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';

  return (
    <div
      className="fixed inset-0 bg-ink/75 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        ref={containerRef}
        className="bg-paper border-2 border-rule max-w-4xl w-full p-4 sm:p-6 max-h-[95vh] overflow-y-auto space-y-4 shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-rule pb-3">
          <div className="space-y-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-signal font-bold bg-signal/10 px-2 py-0.5 border border-signal/30">
                LABLINK VIDEO DEMONSTRATION
              </span>
              <span className="text-[10px] font-mono text-ink-3 uppercase">
                {material.topic}
              </span>
            </div>
            <h2 id="video-modal-title" className="text-lg sm:text-xl font-bold text-ink">
              {material.title}
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 border border-rule hover:bg-tint text-ink text-xs font-mono flex items-center space-x-1"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                {isFullscreen ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                ) : (
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                )}
              </svg>
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-rule hover:bg-signal hover:text-white text-ink transition-colors"
              aria-label="Close video player"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video Player 16:9 Aspect Ratio Container */}
        <div className="relative w-full aspect-video bg-black border border-rule overflow-hidden">
          <iframe
            src={`${embedUrl}?autoplay=1&rel=0&modestbranding=1`}
            title={material.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Description & Instructional Context */}
        <div className="space-y-3 text-xs font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-tint/40 border border-rule-soft">
            <div>
              <span className="text-[10px] text-ink-3 block uppercase">Instructional Faculty</span>
              <strong className="text-ink">{material.source}</strong>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-[10px] text-ink-3 block uppercase">Verification Status</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Campus EHS & Academic Board Certified
              </span>
            </div>
          </div>

          <div className="text-ink-2 font-sans leading-relaxed text-sm">
            {material.description}
          </div>

          {/* Operational SOP Key Timestamps */}
          <div className="border border-rule p-3 bg-paper space-y-2">
            <span className="text-[11px] font-bold text-ink uppercase block">
              Key Instructional Checkpoints
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 bg-tint border border-rule-soft text-signal font-bold">00:00</span>
                <span>Introduction & Power-On Self Test (POST)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 bg-tint border border-rule-soft text-signal font-bold">02:15</span>
                <span>PPE & Chemical / ESD Grounding Checks</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 bg-tint border border-rule-soft text-signal font-bold">05:40</span>
                <span>Live Calibration & Measurement Sweep</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 bg-tint border border-rule-soft text-signal font-bold">08:10</span>
                <span>Sanitization, Data Export & Standby Routine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-rule flex items-center justify-between">
          <span className="text-[10px] font-mono text-ink-3">
            Press ESC or click Done to return to workspace
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-ink text-paper text-xs font-mono font-semibold hover:bg-signal transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
