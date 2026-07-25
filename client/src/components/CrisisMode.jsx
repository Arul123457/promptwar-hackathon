import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneCall, AlertTriangle, Send, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { speechService } from '../services/speechService';
import { apiService } from '../services/apiService';
import BreathingWidget from './BreathingWidget';

export default function CrisisMode({ onLogIncident, user }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [manualText, setManualText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [autoTTS, setAutoTTS] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  // Starts empty — populated from Supabase history on mount
  const [crisisHistory, setCrisisHistory] = useState([]);

  const speechStatus = speechService.isSupported();

  useEffect(() => {
    // Load real crisis history from Supabase via backend for this authenticated user
    if (user?.id) {
      apiService.fetchPatientTrends(user.id).then((res) => {
        if (res?.recentCrises?.length > 0) {
          setCrisisHistory(res.recentCrises.map(e => ({
            time: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: e.transcript,
            response: e.ai_response
          })));
        }
      }).catch(() => {});
    }

    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, [user?.id]);

  const handlePrimaryCrisisTrigger = async (customInput = '') => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    if (!user?.id) {
      console.warn('No authenticated user — crisis call skipped.');
      return;
    }

    const inputQuery = customInput || transcribedText || manualText;
    setIsProcessing(true);
    setAiResponse('');
    speechService.stopSpeaking();

    try {
      // Calls backend Express endpoint (NEVER directly to Groq API from browser)
      const data = await apiService.sendCrisisInput(inputQuery, inputQuery ? 'voice/text' : 'panic-button', user.id);

      if (data && data.response) {
        setAiResponse(data.response);
        setTranscribedText('');
        setManualText('');

        if (onLogIncident) {
          onLogIncident({
            type: 'Crisis Activation',
            input: inputQuery || 'Altruist AI Panic Button',
            response: data.response,
            timestamp: new Date().toLocaleTimeString()
          });
        }

        setCrisisHistory((prev) => [
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: inputQuery || 'Altruist AI Panic Activation',
            response: data.response
          },
          ...prev.slice(0, 4)
        ]);

        if (autoTTS && speechStatus.synthesis) {
          speechService.speak(data.response, {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            rate: 0.88
          });
        }
      }
    } catch (err) {
      console.error('Crisis execution error:', err);
      const fallbackMsg = '• Take a slow breath in... 1... 2... 3... 4... hold... and release.\n• Touch a solid surface near you and feel its texture.\n• You are safe, and your safety contact is notified.';
      setAiResponse(fallbackMsg);
      if (autoTTS) {
        speechService.speak(fallbackMsg, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false)
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVoiceCapture = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setTranscribedText('');
      const started = speechService.startListening({
        onResult: ({ final, text }) => {
          setTranscribedText(text);
          if (final && final.trim().length > 0) {
            handlePrimaryCrisisTrigger(final);
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
      if (started) setIsListening(true);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          ● Active Emergency Grounding Mode
        </div>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.1rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          marginBottom: '8px'
        }}>
          Altruist AI Crisis Mode
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto' }}>
          Tap the panic button below or speak naturally. Altruist AI will immediately guide you through grounding steps.
        </p>
      </div>

      {/* ONE Large Tap / Voice Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
        <button
          id="hero-crisis-button"
          onClick={() => {
            if (isListening) toggleVoiceCapture();
            else handlePrimaryCrisisTrigger();
          }}
          disabled={isProcessing}
          aria-label="Tap for immediate emergency assistance and grounding"
          style={{
            position: 'relative',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            border: 'none',
            outline: 'none',
            cursor: isProcessing ? 'wait' : 'pointer',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            boxShadow: isListening
              ? '0 0 50px rgba(239, 68, 68, 0.9)'
              : '0 12px 40px rgba(220, 38, 38, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isListening ? 'scale(1.06)' : 'scale(1)'
          }}
        >
          <div
            className={isListening || isProcessing ? 'pulse-button-active' : ''}
            style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              border: '3px solid rgba(239, 68, 68, 0.6)',
              pointerEvents: 'none'
            }}
          />

          {isProcessing ? (
            <RefreshCw size={54} color="#ffffff" style={{ animation: 'spin 1.5s linear infinite' }} />
          ) : isListening ? (
            <Mic size={56} color="#ffffff" />
          ) : (
            <AlertTriangle size={56} color="#ffffff" />
          )}

          <div style={{ textAlign: 'center', color: '#ffffff', padding: '0 16px' }}>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              {isProcessing ? 'GETTING HELP...' : isListening ? 'LISTENING...' : 'TAP FOR HELP'}
            </span>
            <span style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: 500 }}>
              {isListening ? 'Speak your thoughts...' : 'Click or tap for instant calm'}
            </span>
          </div>
        </button>

        {/* Audio Toggles */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            id="toggle-mic-btn"
            onClick={toggleVoiceCapture}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '30px',
              border: '1px solid var(--border-glass-bright)',
              background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-secondary)',
              color: isListening ? '#f87171' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} color="var(--primary-blue)" />}
            {isListening ? 'Stop Listening' : 'Voice Input (STT)'}
          </button>

          <button
            id="toggle-tts-btn"
            onClick={() => setAutoTTS(!autoTTS)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '30px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-secondary)',
              color: autoTTS ? 'var(--primary-blue)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {autoTTS ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {autoTTS ? 'Voice Readout: ON' : 'Voice Readout: OFF'}
          </button>
        </div>
      </div>

      {/* STT Speech Transcript */}
      {transcribedText && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', borderLeft: '4px solid var(--primary-blue)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
            🎙️ Speech-to-Text Heard:
          </div>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
            "{transcribedText}"
          </p>
        </div>
      )}

      {/* AI Grounding Script Output Card */}
      {aiResponse && (
        <div className="glass-panel" style={{
          padding: '28px',
          marginBottom: '32px',
          borderLeft: '5px solid var(--primary-blue)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(37, 99, 235, 0.12) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={24} color="var(--primary-blue)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Altruist AI Grounding Guidance
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isSpeaking && (
                <div className="audio-wave-container">
                  <div className="audio-bar" />
                  <div className="audio-bar" />
                  <div className="audio-bar" />
                  <div className="audio-bar" />
                </div>
              )}
              <button
                onClick={() => speechService.speak(aiResponse)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--primary-blue)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={16} /> Replay Voice
              </button>
            </div>
          </div>

          <p style={{
            fontSize: '1.12rem',
            lineHeight: '1.7',
            color: 'var(--text-main)',
            whiteSpace: 'pre-line'
          }}>
            {aiResponse}
          </p>
        </div>
      )}

      {/* Manual Input Fallback */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px' }}>
        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
          Or type how you feel right now:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manualText.trim()) handlePrimaryCrisisTrigger(manualText);
            }}
            placeholder="e.g. My chest feels tight, or I am having racing thoughts..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              fontSize: '0.95rem'
            }}
          />
          <button
            onClick={() => handlePrimaryCrisisTrigger(manualText)}
            disabled={!manualText.trim() || isProcessing}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--primary-blue)',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={18} /> Send
          </button>
        </div>
      </div>

      {/* Action Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <a
          href="tel:988"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '18px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--text-main)',
            textDecoration: 'none',
            fontWeight: 700
          }}
        >
          <div style={{ padding: '10px', borderRadius: '12px', background: '#ef4444', color: '#ffffff' }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem' }}>Call 988 Lifeline</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>24/7 Toll-Free Crisis Help</div>
          </div>
        </a>

        <button
          onClick={() => setShowBreathing(!showBreathing)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '18px',
            borderRadius: '16px',
            background: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            color: 'var(--text-main)',
            textAlign: 'left',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          <div style={{ padding: '10px', borderRadius: '12px', background: '#2563eb', color: '#ffffff' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem' }}>{showBreathing ? 'Hide Breathing Guide' : 'Start Box Breathing'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>4-4-4 Box breathing & sensory 5-4-3-2-1</div>
          </div>
        </button>
      </div>

      {showBreathing && <BreathingWidget />}

      {/* Crisis Event Log */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)' }}>
          Recent Grounding Sessions (Logged to Supabase)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {crisisHistory.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--primary-blue)', marginBottom: '4px', fontWeight: 600 }}>
                <span>Trigger: {item.text}</span>
                <span>{item.time}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                {item.response}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
