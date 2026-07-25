import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import DailyPulseModal from './components/DailyPulseModal';
import CrisisMode from './components/CrisisMode';
import CaregiverMode from './components/CaregiverMode';
import LearnTab from './components/LearnTab';
import { apiService } from './services/apiService';
import { ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [theme, setTheme] = useState('dark');
  const [serverStatus, setServerStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [showPulseModal, setShowPulseModal] = useState(false);
  const [incidentLog, setIncidentLog] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    apiService.checkHealth().then((status) => {
      setServerStatus(status);
    });

    const interval = setInterval(() => {
      apiService.checkHealth().then((status) => setServerStatus(status));
    }, 15000);

    return () => clearInterval(interval);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleDemoLogin = async () => {
    try {
      const data = await apiService.demoLogin();
      if (data && data.user) {
        setUser(data.user);
        setActiveTab('crisis');
      }
    } catch (err) {
      console.warn('Demo login issue:', err);
      setUser({ id: 'demo_user_123', email: 'demo@altruist.ai' });
      setActiveTab('crisis');
    }
  };

  const handleLogIncident = (incident) => {
    setIncidentLog((prev) => [incident, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        serverStatus={serverStatus}
        onOpenPulse={() => setShowPulseModal(true)}
        onDemoLogin={handleDemoLogin}
        user={user}
      />

      <main className="container" style={{ flex: 1, paddingTop: '20px', paddingBottom: '40px' }}>
        {activeTab === 'landing' && (
          <LandingPage
            onLaunchDemo={handleDemoLogin}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'onboarding' && (
          <Onboarding
            onComplete={() => setActiveTab('crisis')}
          />
        )}
        {activeTab === 'crisis' && (
          <CrisisMode
            onLogIncident={handleLogIncident}
            user={user}
          />
        )}
        {activeTab === 'caregiver' && (
          <CaregiverMode
            incidentLog={incidentLog}
          />
        )}
        {activeTab === 'learn' && (
          <LearnTab />
        )}
      </main>

      {/* Daily Emotional Pulse Modal */}
      <DailyPulseModal
        isOpen={showPulseModal}
        onClose={() => setShowPulseModal(false)}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '24px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--primary-blue)" />
            <span><strong>Altruist AI</strong> • Powered by Groq LLM & Supabase PostgreSQL</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span>📞 988 Suicide & Crisis Lifeline</span>
            <span>📱 Text HOME to 741741</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
