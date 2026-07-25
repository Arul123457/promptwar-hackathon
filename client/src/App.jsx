import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import AuthModal from './components/AuthModal';
import DailyPulseModal from './components/DailyPulseModal';
import CrisisMode from './components/CrisisMode';
import CaregiverMode from './components/CaregiverMode';
import LearnTab from './components/LearnTab';
import { apiService } from './services/apiService';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [serverStatus, setServerStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPulseModal, setShowPulseModal] = useState(false);
  const [incidentLog, setIncidentLog] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');

    apiService.checkHealth().then((status) => setServerStatus(status));
    const interval = setInterval(() => {
      apiService.checkHealth().then((status) => setServerStatus(status));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleDemoLogin = async () => {
    try {
      const data = await apiService.demoLogin();
      if (data && data.user) {
        setUser(data.user);
        setActiveTab('crisis');
      }
    } catch (err) {
      console.warn('Demo login issue:', err);
      setUser({ id: 'demo_user_123', email: 'demo@altruist.ai', role: 'Evaluator Demo User' });
      setActiveTab('crisis');
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setActiveTab('crisis');
  };

  const handleTabSelect = (tab) => {
    if (!user && (tab === 'crisis' || tab === 'caregiver' || tab === 'learn')) {
      setShowAuthModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleLogIncident = (incident) => {
    setIncidentLog((prev) => [incident, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabSelect}
        serverStatus={serverStatus}
        onOpenPulse={() => {
          if (!user) setShowAuthModal(true);
          else setShowPulseModal(true);
        }}
        onOpenAuth={() => setShowAuthModal(true)}
        onDemoLogin={handleDemoLogin}
        user={user}
      />

      <main className="container" style={{ flex: 1, paddingTop: '20px', paddingBottom: '40px' }}>
        {activeTab === 'landing' && (
          <LandingPage
            onLaunchDemo={handleDemoLogin}
            onOpenAuth={() => setShowAuthModal(true)}
            onNavigateTab={handleTabSelect}
            user={user}
          />
        )}
        {activeTab === 'onboarding' && (
          <Onboarding
            user={user}
            onComplete={() => {
              if (!user) setShowAuthModal(true);
              else setActiveTab('crisis');
            }}
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
            user={user}
          />
        )}
        {activeTab === 'learn' && (
          <LearnTab />
        )}
      </main>

      {/* Auth Modal (Login / Register & Demo Credentials) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Daily Emotional Pulse Modal */}
      <DailyPulseModal
        isOpen={showPulseModal}
        onClose={() => setShowPulseModal(false)}
        user={user}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        background: '#ffffff',
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
          color: 'var(--text-body)'
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
