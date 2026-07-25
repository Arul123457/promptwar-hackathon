import React from 'react';
import { Shield, Radio, HeartHandshake, Activity, Mic, Cpu, Database, ArrowRight, Key, Sparkles, UserPlus } from 'lucide-react';

export default function LandingPage({ onLaunchDemo, onOpenAuth, onNavigateTab, user }) {
  return (
    <div style={{ padding: '20px 0 60px' }}>
      {/* Hero Header Section */}
      <section className="glass-panel" style={{
        padding: '56px 40px',
        marginBottom: '48px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 18px',
          borderRadius: '20px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid var(--secondary-blue)',
          color: 'var(--secondary-blue)',
          fontSize: '0.88rem',
          fontWeight: 700,
          marginBottom: '20px'
        }}>
          <Sparkles size={16} /> GenAI-Powered Recovery & Prevention Platform
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '3rem',
          fontWeight: 800,
          marginBottom: '16px',
          color: 'var(--primary-blue)',
          letterSpacing: '-0.02em'
        }}>
          Altruist AI
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-heading)',
          maxWidth: '800px',
          margin: '0 auto 16px',
          lineHeight: '1.6',
          fontWeight: 600
        }}>
          Voice-First Substance Use Recovery & Caregiver Support Platform
        </p>

        <p style={{
          fontSize: '1rem',
          color: 'var(--text-body)',
          maxWidth: '720px',
          margin: '0 auto 36px',
          lineHeight: '1.6'
        }}>
          Empowering individuals in substance use recovery and their families with zero-typing crisis interventions,
          personalized emergency scripts, and contextual safety tools — when cognitive load is at its highest.
        </p>

        {/* CTA Buttons & Evaluator Test Access Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={onLaunchDemo}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 36px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--gradient-primary)',
                color: '#ffffff',
                fontSize: '1.1rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)'
              }}
            >
              ⚡ 1-Click Evaluator Demo Access <ArrowRight size={20} />
            </button>

            <button
              onClick={() => {
                if (user) onNavigateTab('onboarding');
                else onOpenAuth();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 28px',
                borderRadius: '12px',
                border: '2px solid var(--primary-blue)',
                background: 'transparent',
                color: 'var(--primary-blue)',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <UserPlus size={20} /> Begin Recovery Onboarding
            </button>
          </div>

          {/* Test Credentials Card for Evaluators */}
          <div style={{
            padding: '14px 24px',
            borderRadius: '12px',
            background: 'var(--bg-page)',
            border: '1px dashed var(--secondary-blue)',
            fontSize: '0.88rem',
            color: 'var(--text-body)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Key size={18} color="var(--secondary-blue)" />
            <span>
              <strong>Demo Access Credentials:</strong> Email: <code style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>demo@altruist.ai</code> | Password: <code style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>DemoAltruist123!</code>
            </span>
          </div>
        </div>
      </section>

      {/* Feature Breakdown & Problem Statement Solution Grid */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '28px', color: 'var(--primary-blue)', textAlign: 'center' }}>
        How Altruist AI Supports Recovery & Prevents Relapse
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '56px' }}>
        {/* Feature 1: Crisis Support */}
        <div
          className="glass-panel glass-panel-interactive"
          style={{ padding: '32px' }}
          onClick={() => {
            if (user) onNavigateTab('crisis');
            else onOpenAuth();
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--accent-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Radio size={28} />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-heading)' }}>
            1. Crisis & Craving Intervention
          </h3>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
            <strong>Problem Solved:</strong> During a craving surge or relapse crisis, individuals cannot navigate complex apps, read text, or think clearly due to peak cognitive load.
          </p>

          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-page)', fontSize: '0.88rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
            ✓ One large voice-activated button delivers a real-time, AI-generated personalized grounding script with automatic audio readout — zero typing required.
          </div>
        </div>

        {/* Feature 2: Caregiver Tools */}
        <div
          className="glass-panel glass-panel-interactive"
          style={{ padding: '32px' }}
          onClick={() => {
            if (user) onNavigateTab('caregiver');
            else onOpenAuth();
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--secondary-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <HeartHandshake size={28} />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-heading)' }}>
            2. Family & Caregiver Support Tools
          </h3>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
            <strong>Problem Solved:</strong> Families feel helpless, unequipped with de-escalation techniques, and disconnected from their loved one's relapse risk trends.
          </p>

          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-page)', fontSize: '0.88rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
            ✓ Generates secure caregiver access links, provides live recovery activity monitoring, and delivers AI-guided de-escalation coaching tailored to the patient's history.
          </div>
        </div>

        {/* Feature 3: Daily Check-Ins */}
        <div
          className="glass-panel glass-panel-interactive"
          style={{ padding: '32px' }}
          onClick={() => {
            if (user) onNavigateTab('learn');
            else onOpenAuth();
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(30, 58, 138, 0.1)',
            color: 'var(--primary-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Activity size={28} />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-heading)' }}>
            3. Daily Recovery Check-Ins
          </h3>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
            <strong>Problem Solved:</strong> Without consistent mood monitoring, relapse triggers and early warning signs go undetected until a full crisis erupts.
          </p>

          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-page)', fontSize: '0.88rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
            ✓ Daily 1-5 craving/stability score check-in with optional voice note — securely logged and accessible to caregivers for proactive intervention.
          </div>
        </div>
      </div>

      {/* Platform Architecture Section */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '28px', color: 'var(--primary-blue)', textAlign: 'center' }}>
        Platform Architecture — How It Works
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Cpu size={26} color="var(--secondary-blue)" />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Generative AI Engine
            </h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
            Runs a large language model via ultra-fast LPU inference to generate real-time personalized recovery scripts, de-escalation guidance, and educational Q&A — never a canned response.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Database size={26} color="var(--primary-blue)" />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Secure Cloud Database
            </h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
            Persistent PostgreSQL storage with authenticated access across 5 tables: user profiles, crisis events, daily check-ins, caregiver links, and AI coaching tips.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Mic size={26} color="var(--accent-red)" />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Zero-Typing Voice Interface
            </h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
            Fully hands-free interaction using browser-native voice recognition for input and speech synthesis for audio readout — designed for high-stress, high-cognitive-load moments.
          </p>
        </div>
      </div>
    </div>
  );
}
