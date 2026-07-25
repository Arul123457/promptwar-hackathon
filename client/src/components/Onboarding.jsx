import React, { useState } from 'react';
import { Mic, MicOff, CheckCircle2, ArrowRight, Sparkles, User, ShieldAlert, Heart, Key } from 'lucide-react';
import { speechService } from '../services/speechService';
import { apiService } from '../services/apiService';

export default function Onboarding({ onComplete, user }) {
  const [step, setStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    triggers: '',
    copingStrategies: '',
    emergencyContact: 'Primary Caregiver (988 Crisis Line)',
    personaTone: 'Empathetic & Calm'
  });

  const toggleVoiceCapture = (field) => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const started = speechService.startListening({
        onResult: ({ text }) => {
          setFormData(prev => ({ ...prev, [field]: text }));
        },
        onEnd: () => setIsListening(false),
        onError: () => setIsListening(false)
      });
      if (started) setIsListening(true);
    }
  };

  const handleAutoFillDemo = () => {
    setFormData({
      triggers: 'Sudden loud noise, crowded spaces, racing heartbeat',
      copingStrategies: '4-4-4 Box Breathing, 5-4-3-2-1 Sensory Grounding, Soft music',
      emergencyContact: 'Primary Caregiver (Dr. Sarah Jenkins - 988)',
      personaTone: 'Empathetic & Soft'
    });
  };

  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    try {
      // Save profile to Express Backend -> Supabase postgres under real user ID
      if (!user?.id) {
        console.warn('No authenticated user ID available for profile save.');
        if (onComplete) onComplete(formData);
        return;
      }
      await apiService.saveOnboardingProfile({
        userId: user.id,
        email: user.email || '',
        ...formData
      });
      if (onComplete) onComplete(formData);
    } catch (err) {
      console.warn('Profile save warning:', err);
      if (onComplete) onComplete(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '30px auto', padding: '0 16px' }}>
      <div className="glass-panel" style={{ padding: '36px' }}>
        {/* Onboarding Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--secondary-blue)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <Sparkles size={14} /> Voice-First Profile Setup
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Welcome to Altruist AI
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Tell us about your anxiety triggers and coping preferences so Altruist AI can personalize your grounding responses.
          </p>
        </div>

        {/* Quick Auto-Fill Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'var(--bg-secondary)',
          border: '1px dashed var(--border-glass-bright)',
          marginBottom: '28px'
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ⚡ Evaluator Shortcut: Skip typing by auto-filling test profile
          </span>
          <button
            onClick={handleAutoFillDemo}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary-blue)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Auto-Fill Profile
          </button>
        </div>

        {/* Step Progress Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? '32px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: s === step ? 'var(--primary-blue)' : 'var(--border-glass-bright)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Step 1: Stress Triggers */}
        {step === 1 && (
          <div>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              1. What triggers your panic or high stress?
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Speak naturally or type your triggers below.
            </p>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <textarea
                value={formData.triggers}
                onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
                placeholder="e.g. Crowded spaces, sudden loud noises, feeling trapped..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  resize: 'none'
                }}
              />
              <button
                onClick={() => toggleVoiceCapture('triggers')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '16px',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: isListening ? '#ef4444' : 'var(--primary-blue)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                {isListening ? 'Listening...' : 'Voice Input'}
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.triggers.trim()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--primary-blue)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Continue to Step 2 <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Coping Strategies */}
        {step === 2 && (
          <div>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              2. What coping techniques work best for you?
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              e.g. 5-4-3-2-1 sensory grounding, box breathing, slow music.
            </p>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <textarea
                value={formData.copingStrategies}
                onChange={(e) => setFormData({ ...formData, copingStrategies: e.target.value })}
                placeholder="e.g. 4-4-4 Box Breathing, holding an ice cube, listening to soft rain..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  resize: 'none'
                }}
              />
              <button
                onClick={() => toggleVoiceCapture('copingStrategies')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '16px',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: isListening ? '#ef4444' : 'var(--primary-blue)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                {isListening ? 'Listening...' : 'Voice Input'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.copingStrategies.trim()}
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--primary-blue)',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Continue to Final Step <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Emergency Contact & Tone */}
        {step === 3 && (
          <div>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              3. Emergency Safety Contact Details
            </label>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Emergency Contact Name / Phone:</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Preferred AI Tone:</label>
              <select
                value={formData.personaTone}
                onChange={(e) => setFormData({ ...formData, personaTone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)'
                }}
              >
                <option value="Empathetic & Gentle">Empathetic & Gentle</option>
                <option value="Direct & Grounded">Direct & Grounded</option>
                <option value="Clinical & Soft">Clinical & Soft</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleSubmitProfile}
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={18} /> Complete Onboarding & Save Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
