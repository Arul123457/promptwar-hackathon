import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function BreathingWidget() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [mode, setMode] = useState('breathing'); // 'breathing' | 'grounding'

  // 5-4-3-2-1 Grounding steps
  const groundingSteps = [
    { count: 5, sense: 'Things you can SEE around you', icon: '👁️', prompt: 'Look around. Name 5 distinct shapes, colors, or objects.' },
    { count: 4, sense: 'Things you can PHYSICALLY TOUCH', icon: '✋', prompt: 'Feel your feet on the floor, your chair, or clothing.' },
    { count: 3, sense: 'Things you can HEAR', icon: '👂', prompt: 'Listen closely. Notice room ambient hums, birds, or breathing.' },
    { count: 2, sense: 'Things you can SMELL', icon: '👃', prompt: 'Notice any scent in the air, soap, tea, or your shirt.' },
    { count: 1, sense: 'Thing you can TASTE', icon: '👅', prompt: 'Take a sip of cool water or notice the taste in your mouth.' }
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && mode === 'breathing') {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 1) return prev - 1;
          
          // Phase transition
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 4;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 4;
          } else {
            setPhase('Inhale');
            return 4;
          }
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, mode]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
  };

  const resetBreathing = () => {
    setIsActive(false);
    setPhase('Inhale');
    setSecondsLeft(4);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wind size={22} color="var(--accent-teal)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Grounding & Calm Companion
          </h3>
        </div>

        {/* Toggle Mode Segment */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: '3px',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)'
        }}>
          <button
            onClick={() => { setMode('breathing'); resetBreathing(); }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'breathing' ? 'var(--accent-teal)' : 'transparent',
              color: mode === 'breathing' ? '#000000' : 'var(--text-muted)'
            }}
          >
            Box Breathing
          </button>
          <button
            onClick={() => { setMode('grounding'); resetBreathing(); }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'grounding' ? 'var(--accent-purple)' : 'transparent',
              color: mode === 'grounding' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            5-4-3-2-1 Sensory
          </button>
        </div>
      </div>

      {mode === 'breathing' ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{
            position: 'relative',
            width: '150px',
            height: '150px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Animated Ring */}
            <div
              className={isActive ? 'breathe-animation' : ''}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: phase === 'Inhale' 
                  ? 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(6,182,212,0.05) 70%)' 
                  : phase === 'Hold' 
                  ? 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0.05) 70%)'
                  : 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0.05) 70%)',
                border: '2px solid var(--border-glass-bright)'
              }}
            />
            <div style={{ zIndex: 2, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
                {phase.toUpperCase()}
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                {secondsLeft}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={toggleBreathing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'var(--accent-purple)' : 'var(--accent-teal)',
                color: isActive ? '#ffffff' : '#000000',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              {isActive ? 'Pause Guide' : 'Start Breathing'}
            </button>

            <button
              onClick={resetBreathing}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {groundingSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: activeStep === idx ? '2px solid var(--accent-purple)' : '1px solid var(--border-glass)',
                  background: activeStep === idx ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                  {step.icon} <span style={{ fontWeight: 800, color: 'var(--accent-purple)' }}>{step.count}</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {step.sense}
                </div>
              </button>
            ))}
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass-bright)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <CheckCircle2 size={18} color="var(--accent-teal)" />
              <strong style={{ fontSize: '0.95rem' }}>
                Step {activeStep + 1} of 5: {groundingSteps[activeStep].sense}
              </strong>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {groundingSteps[activeStep].prompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
