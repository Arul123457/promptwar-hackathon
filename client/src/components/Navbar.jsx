import React from 'react';
import { Shield, HeartHandshake, BookOpen, Sun, Moon, Radio, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme, serverStatus }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(11, 19, 43, 0.75)',
      backdropFilter: 'blur(12px)',
      sticky: 'top',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)'
          }}>
            <Shield size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              CrisisCare AI
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: serverStatus?.status === 'ok' ? '#10b981' : '#f59e0b',
                display: 'inline-block'
              }} />
              {serverStatus?.status === 'ok' ? 'Groq Backend Connected' : 'Local Fallback Mode'}
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
            id="tab-crisis-mode"
            onClick={() => setActiveTab('crisis')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'crisis'
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'transparent',
              color: activeTab === 'crisis' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'crisis' ? '0 4px 14px rgba(239, 68, 68, 0.35)' : 'none'
            }}
          >
            <Radio size={18} />
            Crisis Mode
          </button>

          <button
            id="tab-caregiver-mode"
            onClick={() => setActiveTab('caregiver')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'caregiver'
                ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                : 'transparent',
              color: activeTab === 'caregiver' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'caregiver' ? '0 4px 14px rgba(139, 92, 246, 0.35)' : 'none'
            }}
          >
            <HeartHandshake size={18} />
            Caregiver Mode
          </button>

          <button
            id="tab-learn-mode"
            onClick={() => setActiveTab('learn')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'learn'
                ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)'
                : 'transparent',
              color: activeTab === 'learn' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'learn' ? '0 4px 14px rgba(6, 182, 212, 0.35)' : 'none'
            }}
          >
            <BookOpen size={18} />
            Learn
          </button>
        </nav>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle Dark Light Theme"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#8b5cf6" />}
        </button>
      </div>
    </header>
  );
}
