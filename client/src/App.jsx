import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CrisisMode from './components/CrisisMode';
import CaregiverMode from './components/CaregiverMode';
import LearnTab from './components/LearnTab';
import { apiService } from './services/apiService';
import { Heart, ShieldCheck, LifeBuoy } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('crisis');
  const [theme, setTheme] = useState('dark');
  const [serverStatus, setServerStatus] = useState(null);
  const [incidentLog, setIncidentLog] = useState([]);

  // Load theme and verify Express backend health
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    // Initial backend health check
    apiService.checkHealth().then((status) => {
      setServerStatus(status);
    });

    const interval = setInterval(() => {
      apiService.checkHealth().then((status) => {
        setServerStatus(status);
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogIncident = (incident) => {
    setIncidentLog((prev) => [incident, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        serverStatus={serverStatus}
      />

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, paddingTop: '20px', paddingBottom: '40px' }}>
        {activeTab === 'crisis' && (
          <CrisisMode onLogIncident={handleLogIncident} />
        )}
        {activeTab === 'caregiver' && (
          <CaregiverMode incidentLog={incidentLog} />
        )}
        {activeTab === 'learn' && (
          <LearnTab />
        )}
      </main>

      {/* Reassuring Accessible Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(11, 19, 43, 0.9)',
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
            <ShieldCheck size={18} color="var(--accent-teal)" />
            <span><strong>CrisisCare AI</strong> • Secure Express Backend & Groq LLM Integration</span>
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
