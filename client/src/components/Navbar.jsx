import React from 'react';
import { Shield, Radio, HeartHandshake, BookOpen, Home, Activity, Key, LogIn, UserCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, serverStatus, onOpenPulse, onOpenAuth, onDemoLogin, user }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
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
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'var(--primary-blue)',
              letterSpacing: '-0.02em'
            }}>
              Altruist AI
            </h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-body)', display: 'flex', alignItems: 'center', gap: '5px' }}>
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

        {/* Mode Navigation Tabs - Protected App Tabs Only Visible When Authenticated */}
        <nav style={{
          display: 'flex',
          background: 'var(--bg-page)',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid var(--border)'
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
              color: activeTab === 'landing' ? '#ffffff' : 'var(--text-body)'
            }}
          >
            <Home size={16} /> Home
          </button>

          {/* Protected Navigation Tabs - Gated by User Authentication */}
          {user && (
            <>
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
                  background: activeTab === 'crisis' ? 'var(--accent-red)' : 'transparent',
                  color: activeTab === 'crisis' ? '#ffffff' : 'var(--text-body)'
                }}
              >
                <Radio size={16} /> Crisis Mode
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
                  background: activeTab === 'caregiver' ? 'var(--secondary-blue)' : 'transparent',
                  color: activeTab === 'caregiver' ? '#ffffff' : 'var(--text-body)'
                }}
              >
                <HeartHandshake size={16} /> Caregiver Mode
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
                  background: activeTab === 'learn' ? 'var(--hover-blue)' : 'transparent',
                  color: activeTab === 'learn' ? '#ffffff' : 'var(--text-body)'
                }}
              >
                <BookOpen size={16} /> Learn Hub
              </button>
            </>
          )}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user && (
            <button
              onClick={onOpenPulse}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--primary-blue)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Activity size={16} /> Daily Pulse
            </button>
          )}

          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10b981',
              color: '#059669',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <UserCheck size={16} /> {user.email?.split('@')[0] || 'Authenticated User'}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary-blue)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <LogIn size={15} /> Sign In / Register
            </button>
          )}

          <button
            onClick={onDemoLogin}
            title="1-Click Evaluator Demo Access"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px dashed var(--secondary-blue)',
              background: 'var(--bg-page)',
              color: 'var(--primary-blue)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Key size={14} /> Demo Access
          </button>
        </div>
      </div>
    </header>
  );
}
