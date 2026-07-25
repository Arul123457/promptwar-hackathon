import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, VolumeX as StopIcon, PhoneCall,
  AlertTriangle, Send, Sparkles, RefreshCw, Square, CheckCircle2,
  Clock, Flame, BookOpen, Phone
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { apiService } from '../services/apiService';
import BreathingWidget from './BreathingWidget';

/**
 * Parses the AI response into two structured sections:
 * 1. Recovery Script (bullet points)
 * 2. Safety Anchor (final sentence)
 */
function parseAIResponse(text) {
  if (!text) return { bullets: [], anchor: '' };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const bullets = [];
  let anchor = '';

  for (const line of lines) {
    // Bullet lines start with •, -, *, or numbers
    if (/^[•\-*]/.test(line) || /^\d+\./.test(line)) {
      bullets.push(line.replace(/^[•\-*\d.]\s*/, '').trim());
    } else if (line.toLowerCase().includes('support') || line.toLowerCase().includes('sponsor') ||
               line.toLowerCase().includes('contact') || line.toLowerCase().includes('network') ||
               line.toLowerCase().includes('lifeline') || line.toLowerCase().includes('pass') ||
               line.toLowerCase().includes('available') || bullets.length >= 3) {
      anchor = line;
    } else if (bullets.length < 3) {
      bullets.push(line);
    }
  }

  // Fallback: if no bullets parsed, split by period into chunks
  if (bullets.length === 0) {
    const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 10);
    bullets.push(...sentences.slice(0, 3));
    anchor = sentences[3] || '';
  }

  return { bullets, anchor };
}

export default function CrisisMode({ onLogIncident, user }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [manualText, setManualText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [autoTTS, setAutoTTS] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  const [crisisHistory, setCrisisHistory] = useState([]);
  const [streamStatus, setStreamStatus] = useState('idle'); // idle | processing | streaming | done | error
  const responseRef = useRef(null);

  const speechStatus = speechService.isSupported();

  useEffect(() => {
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

  const stopVoicePlayback = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

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
    setStreamStatus('processing');
    stopVoicePlayback();

    // Scroll to response area after a tick
    setTimeout(() => responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);

    try {
      const data = await apiService.sendCrisisInput(inputQuery, inputQuery ? 'voice/text' : 'panic-button', user.id);

      if (data && data.response) {
        setAiResponse(data.response);
        setStreamStatus('done');
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
            text: inputQuery || 'One-Tap Crisis Activation',
            response: data.response
          },
          ...prev.slice(0, 4)
        ]);

        if (autoTTS && speechStatus.synthesis) {
          // Small delay so user can see the response text first
          setTimeout(() => {
            speechService.speak(data.response, {
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false),
              rate: 0.85
            });
          }, 600);
        }
      }
    } catch (err) {
      console.error('Crisis execution error:', err);
      const fallbackMsg = `• This craving is temporary. Most peak within 20-30 minutes and pass — you are stronger than this moment.
• Breathe in slowly for 4 counts... hold for 4... release for 4. Repeat 3 times.
• Name 5 things you can see around you right now to bring your mind back to the present.

Recovery Support: Your sponsor, support group, or 988 Lifeline are available to you right now.`;
      setAiResponse(fallbackMsg);
      setStreamStatus('done');
      if (autoTTS) {
        setTimeout(() => {
          speechService.speak(fallbackMsg, {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false)
          });
        }, 400);
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

  const parsedResponse = parseAIResponse(aiResponse);

  return (
    <div style={{ padding: '20px 0' }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 16px', borderRadius: '20px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px'
        }}>
          <Flame size={14} /> Crisis & Craving Intervention — Voice-Activated
        </div>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontSize: '2.2rem',
          fontWeight: 800, color: 'var(--text-heading)', marginBottom: '10px'
        }}>
          Altruist AI Crisis Support
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
          Tap the button or speak naturally. Our AI generates a personalized recovery grounding script and reads it aloud — zero typing required.
        </p>
      </div>

      {/* ── Primary Panic Button ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <button
          id="hero-crisis-button"
          onClick={() => {
            if (isListening) toggleVoiceCapture();
            else handlePrimaryCrisisTrigger();
          }}
          disabled={isProcessing}
          aria-label="Tap for immediate recovery support and grounding"
          style={{
            position: 'relative',
            width: '220px', height: '220px',
            borderRadius: '50%', border: 'none', outline: 'none',
            cursor: isProcessing ? 'wait' : 'pointer',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            boxShadow: isListening
              ? '0 0 60px rgba(239, 68, 68, 0.85)'
              : '0 12px 48px rgba(220, 38, 38, 0.4)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isListening ? 'scale(1.07)' : 'scale(1)'
          }}
        >
          <div
            className={isListening || isProcessing ? 'pulse-button-active' : ''}
            style={{
              position: 'absolute', inset: '-12px', borderRadius: '50%',
              border: '3px solid rgba(239, 68, 68, 0.5)', pointerEvents: 'none'
            }}
          />

          {isProcessing
            ? <RefreshCw size={52} color="#ffffff" style={{ animation: 'spin 1.2s linear infinite' }} />
            : isListening
              ? <MicOff size={52} color="#ffffff" />
              : <AlertTriangle size={52} color="#ffffff" />
          }

          <div style={{ textAlign: 'center', color: '#ffffff', padding: '0 14px' }}>
            <span style={{
              display: 'block', fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem', fontWeight: 800,
              letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>
              {isProcessing ? 'GENERATING...' : isListening ? 'LISTENING...' : 'TAP FOR HELP'}
            </span>
            <span style={{ fontSize: '0.76rem', opacity: 0.88, fontWeight: 500 }}>
              {isListening ? 'Speak your thoughts freely' : isProcessing ? 'AI is generating your script' : 'Instant grounding support'}
            </span>
          </div>
        </button>

        {/* ── Voice & TTS Controls Row ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          {/* Mic Toggle */}
          <button
            id="toggle-mic-btn"
            onClick={toggleVoiceCapture}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '30px',
              border: `1px solid ${isListening ? 'rgba(239,68,68,0.5)' : 'var(--border-glass-bright)'}`,
              background: isListening ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-secondary)',
              color: isListening ? '#dc2626' : 'var(--text-main)',
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer'
            }}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} color="var(--primary-blue)" />}
            {isListening ? 'Stop Recording' : 'Start Voice Input'}
          </button>

          {/* TTS Auto-readout Toggle */}
          <button
            id="toggle-tts-btn"
            onClick={() => { setAutoTTS(!autoTTS); if (isSpeaking) stopVoicePlayback(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '30px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-secondary)',
              color: autoTTS ? 'var(--primary-blue)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer'
            }}
          >
            {autoTTS ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {autoTTS ? 'Auto Voice: ON' : 'Auto Voice: OFF'}
          </button>

          {/* ── STOP VOICE BUTTON — only shown while speaking ── */}
          {isSpeaking && (
            <button
              id="stop-voice-btn"
              onClick={stopVoicePlayback}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 18px', borderRadius: '30px',
                border: '2px solid #dc2626',
                background: 'rgba(220, 38, 38, 0.1)',
                color: '#dc2626',
                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                animation: 'pulse-ring 1.8s infinite'
              }}
            >
              <Square size={14} fill="#dc2626" /> Stop Voice
            </button>
          )}
        </div>
      </div>

      {/* ── Live STT Transcript ── */}
      {transcribedText && (
        <div className="glass-panel" style={{
          padding: '14px 18px', marginBottom: '20px',
          borderLeft: '4px solid var(--secondary-blue)',
          display: 'flex', alignItems: 'flex-start', gap: '10px'
        }}>
          <Mic size={18} color="var(--secondary-blue)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-blue)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Voice Captured
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
              "{transcribedText}"
            </p>
          </div>
        </div>
      )}

      {/* ── AI Processing State ── */}
      {isProcessing && (
        <div className="glass-panel" style={{
          padding: '28px', marginBottom: '24px', textAlign: 'center',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          background: 'rgba(59, 130, 246, 0.04)'
        }}>
          <RefreshCw size={28} color="var(--primary-blue)" style={{ animation: 'spin 1.2s linear infinite', marginBottom: 12 }} />
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: 6 }}>
            Generating your personalized recovery script...
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            AI is analyzing your profile, triggers, and coping strategies to build your grounding plan.
          </p>
        </div>
      )}

      {/* ── AI Grounding Script Output — Structured Display ── */}
      {aiResponse && !isProcessing && (
        <div
          ref={responseRef}
          className="glass-panel"
          style={{
            marginBottom: '32px',
            border: '1px solid rgba(30, 58, 138, 0.2)',
            overflow: 'hidden'
          }}
        >
          {/* Card Header */}
          <div style={{
            padding: '18px 24px',
            background: 'var(--primary-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={22} color="#ffffff" />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  Your Personalized Recovery Script
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
                  AI-generated · Based on your profile
                </span>
              </div>
            </div>

            {/* Voice Controls */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isSpeaking ? (
                <>
                  <div className="audio-wave-container">
                    <div className="audio-bar" style={{ background: 'rgba(255,255,255,0.8)' }} />
                    <div className="audio-bar" style={{ background: 'rgba(255,255,255,0.8)' }} />
                    <div className="audio-bar" style={{ background: 'rgba(255,255,255,0.8)' }} />
                    <div className="audio-bar" style={{ background: 'rgba(255,255,255,0.8)' }} />
                  </div>
                  <button
                    id="stop-ai-voice-btn"
                    onClick={stopVoicePlayback}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '6px 12px', borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.4)',
                      background: 'rgba(255,255,255,0.15)',
                      color: '#ffffff', fontWeight: 600, fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Square size={12} fill="#ffffff" /> Stop
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsSpeaking(true);
                    speechService.speak(aiResponse, {
                      onStart: () => setIsSpeaking(true),
                      onEnd: () => setIsSpeaking(false),
                      rate: 0.85
                    });
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 12px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffffff', fontWeight: 600, fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <Volume2 size={14} /> Replay Aloud
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Recovery Script Bullets */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(30, 58, 138, 0.1)',
                fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-blue)'
              }}>1</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Recovery Script — Follow These Steps
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {parsedResponse.bullets.length > 0
                ? parsedResponse.bullets.map((bullet, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{
                        flexShrink: 0,
                        width: '30px', height: '30px',
                        borderRadius: '50%',
                        background: 'var(--primary-blue)',
                        color: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.82rem', fontWeight: 800
                      }}>
                        {i + 1}
                      </div>
                      <p style={{
                        fontSize: '1.05rem', lineHeight: 1.65,
                        color: 'var(--text-heading)', fontWeight: 500,
                        paddingTop: '3px'
                      }}>
                        {bullet}
                      </p>
                    </div>
                  ))
                : (
                  <p style={{
                    fontSize: '1.05rem', lineHeight: 1.7,
                    color: 'var(--text-heading)', whiteSpace: 'pre-line'
                  }}>
                    {aiResponse}
                  </p>
                )
              }
            </div>
          </div>

          {/* Section 2: Safety Anchor */}
          {parsedResponse.anchor && (
            <div style={{
              padding: '18px 28px',
              background: 'rgba(16, 185, 129, 0.06)',
              display: 'flex', gap: '14px', alignItems: 'flex-start'
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                fontSize: '0.85rem', fontWeight: 800, color: '#059669',
                flexShrink: 0
              }}>2</span>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Safety Anchor — Your Support Network
                </div>
                <p style={{ fontSize: '0.98rem', color: '#065f46', lineHeight: 1.6, fontWeight: 500 }}>
                  {parsedResponse.anchor}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Manual Text Input Fallback ── */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
          Or describe what you're feeling right now:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manualText.trim()) handlePrimaryCrisisTrigger(manualText);
            }}
            placeholder="e.g. I'm having strong cravings right now, or I feel like I might relapse..."
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)', fontSize: '0.95rem'
            }}
          />
          <button
            onClick={() => handlePrimaryCrisisTrigger(manualText)}
            disabled={!manualText.trim() || isProcessing}
            style={{
              padding: '12px 20px', borderRadius: '12px', border: 'none',
              background: 'var(--primary-blue)', color: '#ffffff',
              fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              opacity: !manualText.trim() || isProcessing ? 0.5 : 1
            }}
          >
            <Send size={18} /> Get Help
          </button>
        </div>
      </div>

      {/* ── Action Shortcuts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <a
          href="tel:988"
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '18px', borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--text-heading)', textDecoration: 'none', fontWeight: 700
          }}
        >
          <div style={{ padding: '10px', borderRadius: '12px', background: '#ef4444', color: '#ffffff', flexShrink: 0 }}>
            <Phone size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem' }}>988 Crisis Lifeline</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>24/7 Free Crisis Support</div>
          </div>
        </a>

        <a
          href="tel:18006624357"
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '18px', borderRadius: '16px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            color: 'var(--text-heading)', textDecoration: 'none', fontWeight: 700
          }}
        >
          <div style={{ padding: '10px', borderRadius: '12px', background: '#2563eb', color: '#ffffff', flexShrink: 0 }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem' }}>SAMHSA Helpline</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>1-800-662-4357 · Treatment Referrals</div>
          </div>
        </a>

        <button
          onClick={() => setShowBreathing(!showBreathing)}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '18px', borderRadius: '16px',
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            color: 'var(--text-heading)', cursor: 'pointer', fontWeight: 700, textAlign: 'left'
          }}
        >
          <div style={{ padding: '10px', borderRadius: '12px', background: '#7c3aed', color: '#ffffff', flexShrink: 0 }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem' }}>{showBreathing ? 'Hide Breathing Guide' : 'Box Breathing Guide'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>4-4-4 breathing + 5-4-3-2-1 grounding</div>
          </div>
        </button>
      </div>

      {showBreathing && <BreathingWidget />}

      {/* ── Session History ── */}
      {crisisHistory.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={18} color="var(--text-muted)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Recent Recovery Sessions
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {crisisHistory.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '14px 16px', borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                    {item.text || 'Crisis Activation'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {item.time}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {item.response?.split('\n')[0] || ''}
                  {item.response?.split('\n').length > 1 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
