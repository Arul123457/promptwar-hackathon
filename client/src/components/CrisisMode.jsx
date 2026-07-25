import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneCall, AlertTriangle, MessageSquare, Sparkles, RefreshCw, Send } from 'lucide-react';
import { speechService } from '../services/speechService';
import { apiService } from '../services/apiService';
import BreathingWidget from './BreathingWidget';

export default function CrisisMode({ onLogIncident }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [manualText, setManualText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [autoTTS, setAutoTTS] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  const [crisisHistory, setCrisisHistory] = useState([
    {
      time: 'Just now',
      text: 'Activated instant calm support',
      response: 'You are safe right now. Let\'s take a slow, calm breath together. Breathe in through your nose for 4 seconds... hold... and gently breathe out.'
    }
  ]);

  const speechStatus = speechService.isSupported();

  useEffect(() => {
    // Clean up TTS when unmounting
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  // Primary action trigger (Tap big button or voice)
  const handlePrimaryCrisisTrigger = async (customInput = '') => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    const inputQuery = customInput || transcribedText || manualText;
    setIsProcessing(true);
    setAiResponse('');
    speechService.stopSpeaking();

    try {
      // Send request to Express Backend (NEVER directly to Groq API from browser)
      const data = await apiService.sendCrisisInput(inputQuery, inputQuery ? 'voice/text' : 'one-tap-button');

      if (data && data.response) {
        setAiResponse(data.response);
        setTranscribedText('');
        setManualText('');

        // Log incident for caregiver dashboard
        if (onLogIncident) {
          onLogIncident({
            type: 'Crisis Activation',
            input: inputQuery || 'One-Tap Panic Button',
            response: data.response,
            timestamp: new Date().toLocaleTimeString()
          });
        }

        // Add to local history stack
        setCrisisHistory((prev) => [
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: inputQuery || 'One-Tap Urgent Assistance',
            response: data.response
          },
          ...prev.slice(0, 4)
        ]);

        // Auto speak response using Web Speech API TTS
        if (autoTTS && speechStatus.synthesis) {
          speechService.speak(data.response, {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            pitch: 0.95,
            rate: 0.88 // Soothing, calm cadence
          });
        }
      }
    } catch (err) {
      console.error('Crisis request error:', err);
      const fallbackMsg = 'Take a deep breath in... 1... 2... 3... 4... hold... and release. You are safe, and help is available right here.';
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

  // Toggle Voice Input Mode
  const toggleVoiceCapture = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setTranscribedText('');
      const started = speechService.startListening({
        onResult: ({ interim, final, text }) => {
          setTranscribedText(text);
          if (final && final.trim().length > 0) {
            handlePrimaryCrisisTrigger(final);
          }
        },
        onError: (err) => {
          console.warn('Speech recognition error callback:', err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
      if (started) {
        setIsListening(true);
      }
    }
  };

  // Replay speech out loud
  const replayTTS = () => {
    if (aiResponse) {
      speechService.speak(aiResponse, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        rate: 0.88
      });
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          marginBottom: '8px'
        }}>
          Crisis & Grounding Mode
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Tap the big button below or speak naturally. We'll instantly guide you through calm grounding steps.
        </p>
      </div>

      {/* Hero Section: ONE Large Tap / Voice Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
        <button
          id="hero-crisis-button"
          onClick={() => {
            if (isListening) {
              toggleVoiceCapture();
            } else {
              handlePrimaryCrisisTrigger();
            }
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
          {/* Inner pulse circle */}
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
              {isListening ? 'Speak your thoughts...' : 'Click or hold to activate voice'}
            </span>
          </div>
        </button>

        {/* Secondary Microphone Toggle Button */}
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
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} color="var(--accent-teal)" />}
            {isListening ? 'Stop Voice Listening' : 'Start Speech-to-Text'}
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
              color: autoTTS ? 'var(--accent-teal)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {autoTTS ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {autoTTS ? 'Voice Output: ON' : 'Voice Output: OFF'}
          </button>
        </div>
      </div>

      {/* Live Speech Recognition Transcript Box */}
      {transcribedText && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', borderLeft: '4px solid var(--accent-teal)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
            🎙️ Speech-to-Text Heard:
          </div>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
            "{transcribedText}"
          </p>
        </div>
      )}

      {/* AI Grounding Response Card */}
      {aiResponse && (
        <div className="glass-panel" style={{
          padding: '28px',
          marginBottom: '32px',
          borderLeft: '5px solid var(--accent-purple)',
          background: 'linear-gradient(135deg, rgba(28, 37, 65, 0.8) 0%, rgba(139, 92, 246, 0.1) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={24} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Immediate Guidance & Reassurance
              </h3>
            </div>

            {/* Audio Wave Visualizer & Replay button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isSpeaking && (
                <div className="audio-wave-container">
                  <div className="audio-bar" />
                  <div className="audio-bar" />
                  <div className="audio-bar" />
                  <div className="audio-bar" />
                  <div className="audio-bar" />
                </div>
              )}
              <button
                onClick={replayTTS}
                aria-label="Replay grounding message out loud"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--accent-purple)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={16} /> Read Out Loud
              </button>
            </div>
          </div>

          <p style={{
            fontSize: '1.15rem',
            lineHeight: '1.7',
            color: 'var(--text-main)',
            whiteSpace: 'pre-line'
          }}>
            {aiResponse}
          </p>
        </div>
      )}

      {/* Manual Text Fallback Input */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
          Or type how you feel right now:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            id="crisis-manual-input"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manualText.trim()) {
                handlePrimaryCrisisTrigger(manualText);
              }
            }}
            placeholder="e.g. I feel a panic attack coming on, or my heart is racing..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button
            id="crisis-send-btn"
            onClick={() => handlePrimaryCrisisTrigger(manualText)}
            disabled={!manualText.trim() || isProcessing}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--accent-teal)',
              color: '#000000',
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

      {/* Quick Action Shortcuts */}
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
            fontWeight: 700,
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: '#ef4444',
            color: '#ffffff'
          }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem' }}>Call 988 Crisis Lifeline</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>24/7 Toll-Free & Confidential</div>
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
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: 'var(--text-main)',
            textAlign: 'left',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: '#06b6d4',
            color: '#000000'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem' }}>{showBreathing ? 'Hide Breathing Tool' : 'Start Guided Breathing'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Box breathing & 5-4-3-2-1</div>
          </div>
        </button>
      </div>

      {/* Guided Breathing Tool Section */}
      {showBreathing && <BreathingWidget />}

      {/* Recent Crisis Sessions Log */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)' }}>
          Recent Grounding Sessions
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--accent-teal)', marginBottom: '4px', fontWeight: 600 }}>
                <span>Input: {item.text}</span>
                <span>{item.time}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {item.response}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
