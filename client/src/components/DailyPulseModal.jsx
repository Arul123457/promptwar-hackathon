import React, { useState } from 'react';
import { Activity, X, Mic, MicOff, Check, Heart } from 'lucide-react';
import { speechService } from '../services/speechService';
import { apiService } from '../services/apiService';

export default function DailyPulseModal({ isOpen, onClose }) {
  const [score, setScore] = useState(3);
  const [voiceNote, setVoiceNote] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleVoiceCapture = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const started = speechService.startListening({
        onResult: ({ text }) => setVoiceNote(text),
        onEnd: () => setIsListening(false),
        onError: () => setIsListening(false)
      });
      if (started) setIsListening(true);
    }
  };

  const handleSavePulse = async () => {
    setIsSaving(true);
    try {
      // Saves daily score + voice note to backend Express -> Supabase pulse_checks
      await apiService.saveDailyPulse({
        userId: 'demo_user_123',
        score,
        voiceNote
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.warn('Pulse save error:', err);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const moodLabels = ['Very Anxious', 'Uneasy', 'Neutral', 'Calm', 'Very Peaceful'];
  const moodEmojis = ['😰', '😟', '😐', '😊', '😌'];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', position: 'relative' }}>
        <button
          onClick={onClose}
          aria-label="Close Pulse Check Modal"
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Activity size={24} color="var(--primary-blue)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Daily Emotional Pulse Check
          </h3>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          How calm or anxious are you feeling right now? Select a score from 1 to 5.
        </p>

        {/* 1-5 Rating Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setScore(s)}
              style={{
                padding: '12px 4px',
                borderRadius: '12px',
                border: score === s ? '2px solid var(--primary-blue)' : '1px solid var(--border-glass)',
                background: score === s ? 'rgba(37, 99, 235, 0.2)' : 'var(--bg-secondary)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{moodEmojis[s - 1]}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{s}</div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '20px' }}>
          Selected: {moodLabels[score - 1]} ({score}/5)
        </div>

        {/* Voice Note Input */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <textarea
            value={voiceNote}
            onChange={(e) => setVoiceNote(e.target.value)}
            placeholder="Add an optional voice or text note (e.g., Practiced box breathing today...)"
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              resize: 'none'
            }}
          />
          <button
            onClick={toggleVoiceCapture}
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '12px',
              padding: '6px 10px',
              borderRadius: '16px',
              border: 'none',
              background: isListening ? '#ef4444' : 'var(--primary-blue)',
              color: '#ffffff',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {isListening ? <MicOff size={12} /> : <Mic size={12} />}
          </button>
        </div>

        {savedSuccess ? (
          <div style={{ padding: '12px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '10px', fontWeight: 700 }}>
            ✓ Pulse check saved to Supabase!
          </div>
        ) : (
          <button
            onClick={handleSavePulse}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--primary-blue)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Save Daily Pulse
          </button>
        )}
      </div>
    </div>
  );
}
