import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScenarioProvider } from './context/ScenarioContext.js';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { LiveRegion } from './components/common/LiveRegion.js';
import { HomePage } from './pages/HomePage.js';
import { DiscoverPage } from './pages/DiscoverPage.js';
import { RequestPage } from './pages/RequestPage.js';
import { ConflictCenterPage } from './pages/ConflictCenterPage.js';
import { ApprovalsPage } from './pages/ApprovalsPage.js';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <BrowserRouter>
      <ScenarioProvider>
        <div className="min-h-screen bg-paper text-ink transition-colors duration-150 flex flex-col justify-between">
          <div>
            <Header theme={theme} toggleTheme={toggleTheme} />
            <main className="max-w-7xl mx-auto px-4 py-6" id="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/request" element={<RequestPage />} />
                <Route path="/conflicts" element={<ConflictCenterPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
          </div>
          <Footer />
          <LiveRegion />
        </div>
      </ScenarioProvider>
    </BrowserRouter>
  );
}
