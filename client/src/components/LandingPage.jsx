import React from 'react';
import { Shield, Radio, HeartHandshake, Activity, Mic, Cpu, Database, CheckCircle, ArrowRight, Key, Sparkles, Heart, HelpCircle, Lock } from 'lucide-react';

export default function LandingPage({ onLaunchDemo, onNavigateTab }) {
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
          <Sparkles size={16} /> Public Marketing Landing Page • No Authentication Required
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
          Voice-First Crisis De-Escalation & Caregiver Support Platform
        </p>

        <p style={{
          fontSize: '1rem',
          color: 'var(--text-body)',
          maxWidth: '720px',
          margin: '0 auto 36px',
          lineHeight: '1.6'
        }}>
          <em>Altruist</em>: One who unselfishly cares for and helps others in times of acute panic, emotional distress, and caregiving strain.
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
              ⚡ Launch Live Demo App <ArrowRight size={20} />
            </button>

            <button
              onClick={() => onNavigateTab('crisis')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 28px',
                borderRadius: '12px',
                border: '2px solid var(--accent-red)',
                background: 'transparent',
                color: 'var(--accent-red)',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Radio size={20} /> Try One-Tap Crisis Button
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
              <strong>Evaluator Access Credentials:</strong> Email: <code style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>demo@altruist.ai</code> | Password: <code style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>DemoAltruist123!</code>
            </span>
          </div>
        </div>
      </section>

      {/* Feature Breakdown & Problem Statement Solution Grid */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '28px', color: 'var(--primary-blue)', textAlign: 'center' }}>
        How Altruist AI Solves Crisis & Caregiver Challenges
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '56px' }}>
        {/* Feature 1: Crisis Support */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '32px' }} onClick={() => onNavigateTab('crisis')}>
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
            1. Crisis Grounding Support
          </h3>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
            <strong>Problem Solved:</strong> During sudden panic attacks or sensory overload, individuals cannot navigate complex apps or read dense text.
          </p>

          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-page)', fontSize: '0.88rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
            ✓ Solution: One large tap/voice button delivering real-time 5-4-3-2-1 sensory grounding scripts and instant speech synthesis audio readout.
          </div>
        </div>

        {/* Feature 2: Caregiver Tools */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '32px' }} onClick={() => onNavigateTab('caregiver')}>
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
            2. Caregiver Coaching Tools
          </h3>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
            <strong>Problem Solved:</strong> Caregivers often feel helpless, unequipped with de-escalation strategies, or disconnected from patient incident trends.
          </p>

          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-page)', fontSize: '0.88rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
            ✓ Solution: Generates 6-character caregiver invite links, streams live crisis activity from Supabase, and provides Groq AI clinical de-escalation coaching.
          </div>
        </div>

        {/* Feature 3: Daily Check-Ins */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '32px' }} onClick={() => onNavigateTab('learn')}>
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
            3. Daily Emotional Pulse Check-Ins
          </h3>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
            <strong>Problem Solved:</strong> Lack of proactive mood tracking prevents identifying stress patterns before full panic episodes occur.
          </p>

          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-page)', fontSize: '0.88rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
            ✓ Solution: Quick 1-5 emotional score check-in with optional voice note recording, permanently logged in Supabase PostgreSQL tables.
          </div>
        </div>
      </div>

      {/* Tech Stack Architecture Section */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '28px', color: 'var(--primary-blue)', textAlign: 'center' }}>
        Underneath the Hood — Tech Stack Powering Altruist AI
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Cpu size={26} color="var(--secondary-blue)" />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Groq LLM Engine
            </h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
            Executes <code style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>llama-3.3-70b-versatile</code> on ultra-fast LPUs. Generates real-time grounding scripts, caregiver coaching advice, and mental health Q&A answers without hardcoded canned responses.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Database size={26} color="var(--primary-blue)" />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Supabase PostgreSQL
            </h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
            Serves as the single architectural source of truth across 5 tables: <code style={{ color: 'var(--primary-blue)' }}>profiles</code>, <code style={{ color: 'var(--primary-blue)' }}>crisis_events</code>, <code style={{ color: 'var(--primary-blue)' }}>pulse_checks</code>, <code style={{ color: 'var(--primary-blue)' }}>caregiver_links</code>, and <code style={{ color: 'var(--primary-blue)' }}>caregiver_tips</code>.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Mic size={26} color="var(--accent-red)" />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Browser Web Speech API
            </h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
            Hands-free voice accessibility using browser-native <code style={{ color: 'var(--primary-blue)' }}>SpeechRecognition</code> for voice input and <code style={{ color: 'var(--primary-blue)' }}>SpeechSynthesis</code> for soothing audio readout.
          </p>
        </div>
      </div>
    </div>
  );
}
