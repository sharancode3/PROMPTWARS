import React from 'react';

export type StatusType =
  | 'available'
  | 'confirmed'
  | 'approved'
  | 'contested'
  | 'under-review'
  | 'submitted'
  | 'rejected'
  | 'maintenance'
  | 'waitlist';

interface StatusGlyphProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusGlyph({ status, label, className = '' }: StatusGlyphProps) {
  const getDetails = (): { text: string; bg: string; fg: string; shape: React.ReactNode } => {
    switch (status) {
      case 'available':
        return {
          text: label || 'Available',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700',
          fg: '#0B6B3A',
          shape: (
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 inline-block mr-1.5" aria-hidden="true">
              <polygon points="5,1 9,9 1,9" fill="currentColor" />
            </svg>
          )
        };
      case 'confirmed':
      case 'approved':
        return {
          text: label || 'Approved',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-900 dark:text-emerald-100 dark:border-emerald-600',
          fg: '#0B6B3A',
          shape: (
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 inline-block mr-1.5" aria-hidden="true">
              <rect x="1" y="1" width="8" height="8" fill="currentColor" />
            </svg>
          )
        };
      case 'contested':
        return {
          text: label || 'Contested',
          bg: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
          fg: '#C00018',
          shape: (
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 inline-block mr-1.5" aria-hidden="true">
              <circle cx="5" cy="5" r="4" fill="#C00018" />
            </svg>
          )
        };
      case 'under-review':
        return {
          text: label || 'Under Review',
          bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700',
          fg: '#B45309',
          shape: (
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 inline-block mr-1.5" aria-hidden="true">
              <polygon points="5,1 9,5 5,9 1,5" fill="currentColor" />
            </svg>
          )
        };
      case 'submitted':
        return {
          text: label || 'Submitted',
          bg: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700',
          fg: '#1F3FD6',
          shape: (
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 inline-block mr-1.5" aria-hidden="true">
              <rect x="2" y="2" width="6" height="6" fill="currentColor" />
            </svg>
          )
        };
      case 'rejected':
        return {
          text: label || 'Rejected',
          bg: 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700',
          fg: '#5E5E59',
          shape: (
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 inline-block mr-1.5" aria-hidden="true">
              <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="2" />
              <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="2" />
            </svg>
          )
        };
      case 'maintenance':
        return {
          text: label || 'Maintenance',
          bg: 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700',
          fg: '#71717A',
          shape: (
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 inline-block mr-1.5" aria-hidden="true">
              <line x1="1" y1="9" x2="9" y2="1" stroke="currentColor" strokeWidth="2" />
            </svg>
          )
        };
      case 'waitlist':
      default:
        return {
          text: label || 'Waitlist',
          bg: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-700',
          fg: '#6B21A8',
          shape: (
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 inline-block mr-1.5" aria-hidden="true">
              <circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )
        };
    }
  };

  const { text, bg, shape } = getDetails();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium border ${bg} ${className}`}
    >
      {shape}
      <span>{text}</span>
    </span>
  );
}
