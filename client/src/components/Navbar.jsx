import React from 'react';
import { Shield, Radio, HeartHandshake, BookOpen, Sun, Moon, Home, Activity, Key } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme, serverStatus, onOpenPulse, onDemoLogin, user }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* Brand Logo & Name */}
        <div
          onClick={() => setActiveTab('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              Altruist AI
            </h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: serverStatus?.status === 'ok' ? '#10b981' : '#f59e0b',
                display: 'inline-block'
              }} />
              {serverStatus?.status === 'ok' ? 'Live Groq & Supabase' : 'Offline Driver'}
            </span>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <nav style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid var(--border-glass)'
        }}>
          <button
            id="tab-landing-mode"
            onClick={() => setActiveTab('landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'landing' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'landing' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Home size={16} /> Home
          </button>

          <button
            id="tab-crisis-mode"
            onClick={() => setActiveTab('crisis')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'crisis' ? '#ef4444' : 'transparent',
              color: activeTab === 'crisis' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Radio size={16} /> Crisis
          </button>

          <button
            id="tab-caregiver-mode"
            onClick={() => setActiveTab('caregiver')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'caregiver' ? '#3b82f6' : 'transparent',
              color: activeTab === 'caregiver' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <HeartHandshake size={16} /> Caregiver
          </button>

          <button
            id="tab-learn-mode"
            onClick={() => setActiveTab('learn')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'learn' ? '#a855f7' : 'transparent',
              color: activeTab === 'learn' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <BookOpen size={16} /> Learn
          </button>
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenPulse}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(37, 99, 235, 0.15)',
              color: '#60a5fa',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Activity size={16} /> Daily Pulse
          </button>

          <button
            onClick={onDemoLogin}
            title="Log in as Evaluator Demo User"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass-bright)',
              background: user ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
              color: user ? '#10b981' : 'var(--accent-amber)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Key size={14} /> {user ? 'Demo Active' : 'Evaluator Demo'}
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Light Theme"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#8b5cf6" />}
          </button>
        </div>
      </div>
    </header>
  );
}
