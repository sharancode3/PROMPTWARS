import { NavLink } from 'react-router-dom';
import { useScenario } from '../../context/ScenarioContext.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { currentUser, role } = useScenario();

  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      to: '/mylab',
      label: 'My Lab Workspace',
      badge: 'STUDENT',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M9 3h6v4H9z" />
          <path d="M10 7v4L6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l-4-8V7" />
          <line x1="8" y1="15" x2="16" y2="15" />
        </svg>
      )
    },
    {
      to: '/discover',
      label: 'Equipment Catalog',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    },
    {
      to: '/request',
      label: 'Project Intake',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      )
    },
    {
      to: '/conflicts',
      label: 'Conflict Center',
      highlight: true,
      badge: 'STAR',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <polygon points="12 2 2 22 22 22" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    {
      to: '/approvals',
      label: 'Faculty Queue',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
    {
      to: '/timetable',
      label: 'Lab Timetable',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <rect x="3" y="4" width="18" height="18" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="10" y1="14" x2="14" y2="14" />
          <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
      )
    },
    {
      to: '/labs',
      label: 'University Labs',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <rect x="2" y="7" width="20" height="14" rx="0" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      to: '/bookings',
      label: 'Active Bookings',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <rect x="3" y="4" width="18" height="18" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      to: '/knowledge',
      label: 'Knowledge & SOPs',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      to: '/insights',
      label: 'Lab Analytics',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    },
    {
      to: '/settings',
      label: 'System Config',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Persistent Left Sidebar (Collapsible: w-64 expanded, w-16 collapsed) */}
      <aside
        id="sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-paper border-r border-rule flex flex-col justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-16 w-64' : 'w-64'}`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Brand header */}
          <div className={`border-b border-rule flex items-center ${isCollapsed ? 'p-3 justify-center' : 'p-4 justify-between'}`}>
            <NavLink to="/" onClick={onClose} className="flex items-center space-x-3 group" title="LabLink Home">
              <div className="w-7 h-7 shrink-0 inline-flex" aria-hidden="true">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="25" cy="25" r="20" fill="currentColor" />
                  <rect x="55" y="5" width="40" height="40" fill="currentColor" />
                  <path d="M 5 95 A 40 40 0 0 1 45 55 L 45 95 Z" fill="#C00018" />
                  <polygon points="55,95 95,95 95,55" fill="currentColor" />
                </svg>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold tracking-tight text-lg text-ink leading-tight">LabLink</span>
                  <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">Campus Lab OS</span>
                </div>
              )}
            </NavLink>

            {/* Desktop collapse toggle button */}
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex p-1.5 border border-rule hover:bg-tint text-ink items-center justify-center transition-colors focus-visible:outline-none ${isCollapsed ? 'mt-2' : ''}`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse to icon-only mode'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse to icon-only mode'}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                {isCollapsed ? (
                  <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                ) : (
                  <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                )}
              </svg>
            </button>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 border border-rule hover:bg-tint text-ink"
              aria-label="Close sidebar navigation"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Quick status indicator */}
          {!isCollapsed ? (
            <div className="px-4 py-2 border-b border-rule-soft bg-tint/50 text-[11px] font-mono flex items-center justify-between text-ink-3">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-signal inline-block" />
                <span className="font-semibold text-ink">ACTIVE ENGINE</span>
              </span>
              <span>Asia/Kolkata</span>
            </div>
          ) : (
            <div className="py-2 border-b border-rule-soft bg-tint/50 flex justify-center" title="Active Engine: Asia/Kolkata">
              <span className="w-2 h-2 bg-signal inline-block" />
            </div>
          )}

          {/* Navigation Links */}
          <nav className={`p-2 space-y-1 font-mono text-xs flex-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                title={item.label}
                className={({ isActive }) =>
                  `flex items-center border transition-all ${
                    isCollapsed
                      ? 'w-10 h-10 justify-center p-0'
                      : 'justify-between px-3 py-2 w-full'
                  } ${
                    isActive
                      ? item.highlight
                        ? 'border-signal bg-signal text-white font-bold shadow-sm'
                        : 'border-ink bg-ink text-paper font-bold'
                      : item.highlight
                      ? 'border-signal/40 text-signal hover:bg-signal/10 hover:border-signal'
                      : 'border-transparent text-ink-2 hover:border-rule-soft hover:bg-tint hover:text-ink'
                  }`
                }
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5 truncate'}`}>
                  <span className="shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 border uppercase font-bold shrink-0 ml-1 ${
                      item.highlight
                        ? 'border-white/40 bg-white/20 text-white'
                        : 'border-rule bg-paper text-ink-3'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User / Session Card at Bottom */}
        {!isCollapsed ? (
          <div className="p-3 border-t border-rule bg-tint/30 text-xs font-mono">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-ink-3 uppercase tracking-wider font-semibold">Active Session</span>
              <span className="px-1.5 py-0.2 border border-rule text-[10px] font-bold uppercase text-ink bg-paper">
                {role}
              </span>
            </div>
            <div className="font-semibold text-ink truncate">{currentUser.name}</div>
            <div className="text-[11px] text-ink-3 truncate">{currentUser.departmentName}</div>
            <div className="mt-2 pt-2 border-t border-rule-soft flex items-center justify-between text-[10px] text-ink-2">
              <span>Logged: {currentUser.priorUsageHours}h</span>
              <span>Certs: {currentUser.certifications.length}</span>
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-rule bg-tint/30 flex flex-col items-center justify-center text-xs font-mono" title={`${currentUser.name} (${role})`}>
            <span className="w-7 h-7 border border-rule flex items-center justify-center font-bold text-ink bg-paper uppercase text-[11px]">
              {currentUser.name[0]}
            </span>
          </div>
        )}
      </aside>
    </>
  );
}
