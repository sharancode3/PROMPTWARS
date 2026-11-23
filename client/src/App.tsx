import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ScenarioProvider } from './context/ScenarioContext.js';
import { Sidebar } from './components/common/Sidebar.js';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { LiveRegion } from './components/common/LiveRegion.js';
import { HomePage } from './pages/HomePage.js';
import { DiscoverPage } from './pages/DiscoverPage.js';
import { RequestPage } from './pages/RequestPage.js';
import { ConflictCenterPage } from './pages/ConflictCenterPage.js';
import { ApprovalsPage } from './pages/ApprovalsPage.js';
import { TimetablePage } from './pages/TimetablePage.js';
import { LabsPage } from './pages/LabsPage.js';
import { BookingsPage } from './pages/BookingsPage.js';
import { KnowledgePage } from './pages/KnowledgePage.js';
import { InsightsPage } from './pages/InsightsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

function ScrollToTopAndFocus() {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo(0, 0);
      }
    } catch {
      // Environment without DOM scroll implementation
    }
    // Find page h1 and set focus for accessibility unless a modal is open
    const isModalOpen = document.querySelector('[role="dialog"]');
    if (!isModalOpen) {
      const heading = document.querySelector('h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }, [pathname]);

  return null;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <BrowserRouter>
      <ScrollToTopAndFocus />
      <ScenarioProvider>
        <div className="min-h-screen bg-paper text-ink transition-colors duration-150 flex flex-col justify-between">
          {/* Skip Link for Accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-ink focus:text-paper font-mono text-xs"
          >
            Skip to main content
          </a>

          {/* Persistent Sidebar on Desktop, Drawer on Mobile */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />

          {/* Main Content Area (dynamically offset by sidebar width) */}
          <div className={`${isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'} flex flex-col flex-1 min-w-0 transition-all duration-200`}>
            <Header
              theme={theme}
              toggleTheme={toggleTheme}
              onOpenMobileMenu={() => setIsSidebarOpen(true)}
            />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6" id="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/request" element={<RequestPage />} />
                <Route path="/conflicts" element={<ConflictCenterPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/labs" element={<LabsPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>

            <Footer />
          </div>

          <LiveRegion />
        </div>
      </ScenarioProvider>
    </BrowserRouter>
  );
}
