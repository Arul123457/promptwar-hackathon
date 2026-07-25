import React, { useState, useEffect } from 'react';
import { HeartHandshake, ShieldAlert, User, Phone, FileText, Send, Sparkles, Clock, Check, Edit3, Save } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function CaregiverMode({ incidentLog }) {
  const [patientStatus, setPatientStatus] = useState('Calm & Stable');
  const [caregiverQuery, setCaregiverQuery] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Safety Plan editable state
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [safetyPlan, setSafetyPlan] = useState({
    emergencyContactName: 'Dr. Sarah Jenkins',
    emergencyPhone: '1-800-555-0199',
    calmAnchorPhrase: 'You are safe with me. We will take slow breaths together.',
    medicalNotes: 'Sensitive to loud metallic sounds. Responds well to soft classical music and lavender aromatherapy.'
  });
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Fetch safety plan from Express backend on mount
    apiService.getSafetyPlan().then((res) => {
      if (res && res.data) {
        setSafetyPlan(res.data);
      }
    }).catch((err) => console.warn('Could not load backend safety plan:', err));
  }, []);

  const handleQueryAdvisor = async (customQuery = '') => {
    const q = customQuery || caregiverQuery;
    if (!q.trim()) return;

    setIsLoading(true);
    setAiAdvice('');

    try {
      // Calls backend Express endpoint (NEVER calls Groq directly from browser)
      const res = await apiService.askCaregiverAdvisor(q, patientStatus);
      if (res && res.guidance) {
        setAiAdvice(res.guidance);
      }
    } catch (err) {
      console.error('Caregiver query error:', err);
      setAiAdvice('Maintain a quiet environment, speak in low calm tones, and reassure the individual that they are safe.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSafetyPlan = async () => {
    try {
      const res = await apiService.updateSafetyPlan(safetyPlan);
      if (res && res.success) {
        setSaveMessage('Safety plan updated successfully!');
        setIsEditingPlan(false);
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update safety plan:', err);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.2)',
            color: 'var(--accent-purple)'
          }}>
            <HeartHandshake size={28} />
          </div>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--text-main)'
            }}>
              Caregiver Dashboard & Advisor
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              Monitor patient status, access AI de-escalation guidance, and maintain safety plans.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Patient Status & Safety Plan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Patient Status Overview Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Current Patient Status
            </h3>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: patientStatus === 'Calm & Stable' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: patientStatus === 'Calm & Stable' ? '#10b981' : '#f87171',
              border: `1px solid ${patientStatus === 'Calm & Stable' ? '#10b981' : '#f87171'}`
            }}>
              ● {patientStatus}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={() => setPatientStatus('Calm & Stable')}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)',
                background: patientStatus === 'Calm & Stable' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                color: 'var(--text-main)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Set State: Calm & Resting
            </button>
            <button
              onClick={() => setPatientStatus('High Stress / Agitated')}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)',
                background: patientStatus === 'High Stress / Agitated' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-secondary)',
                color: 'var(--text-main)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Set State: Anxious / Elevated
            </button>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
            <strong>Last Crisis Event:</strong> {incidentLog && incidentLog.length > 0 ? incidentLog[0].timestamp : 'No recent crisis events recorded today.'}
          </div>
        </div>

        {/* Safety Plan Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Emergency Safety Plan
            </h3>
            {isEditingPlan ? (
              <button
                onClick={handleSaveSafetyPlan}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--accent-teal)',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Save size={14} /> Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditingPlan(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={14} /> Edit
              </button>
            )}
          </div>

          {saveMessage && (
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', marginBottom: '12px', fontWeight: 600 }}>
              ✓ {saveMessage}
            </div>
          )}

          {isEditingPlan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Emergency Contact Name:</label>
                <input
                  type="text"
                  value={safetyPlan.emergencyContactName}
                  onChange={(e) => setSafetyPlan({ ...safetyPlan, emergencyContactName: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Emergency Phone Number:</label>
                <input
                  type="text"
                  value={safetyPlan.emergencyPhone}
                  onChange={(e) => setSafetyPlan({ ...safetyPlan, emergencyPhone: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calm Anchor Phrase:</label>
                <input
                  type="text"
                  value={safetyPlan.calmAnchorPhrase}
                  onChange={(e) => setSafetyPlan({ ...safetyPlan, calmAnchorPhrase: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Primary Contact:</span>
                <strong>{safetyPlan.emergencyContactName}</strong> ({safetyPlan.emergencyPhone})
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Calm Anchor Phrase:</span>
                <span style={{ fontStyle: 'italic', color: 'var(--accent-teal)' }}>"{safetyPlan.calmAnchorPhrase}"</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Sensory & Behavioral Notes:</span>
                <span>{safetyPlan.medicalNotes}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Caregiver Clinical Assistant */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={24} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Ask Groq AI Caregiver Advisor
          </h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Ask clinical questions regarding de-escalating agitation, managing panic triggers, or avoiding caregiver burnout.
        </p>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {[
            'How to de-escalate sudden dementia agitation?',
            'What to do during a severe panic attack?',
            'Techniques to prevent caregiver burnout',
            'Creating a soothing sensory environment'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCaregiverQuery(chip);
                handleQueryAdvisor(chip);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              + {chip}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            id="caregiver-query-input"
            value={caregiverQuery}
            onChange={(e) => setCaregiverQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQueryAdvisor();
            }}
            placeholder="Type your caregiver question..."
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
            id="caregiver-ask-btn"
            onClick={() => handleQueryAdvisor()}
            disabled={isLoading || !caregiverQuery.trim()}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--accent-purple)',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={18} /> Ask Advisor
          </button>
        </div>

        {/* Advisor Response Output */}
        {aiAdvice && (
          <div style={{
            padding: '20px',
            borderRadius: '14px',
            background: 'var(--bg-secondary)',
            borderLeft: '4px solid var(--accent-purple)',
            lineHeight: '1.7',
            whiteSpace: 'pre-line',
            color: 'var(--text-main)'
          }}>
            {aiAdvice}
          </div>
        )}
      </div>

      {/* Incident Activation Log Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          Recent Incident & Crisis Activity Log
        </h3>
        {incidentLog && incidentLog.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidentLog.map((log, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--crisis-danger)', fontSize: '0.9rem' }}>
                    🚨 {log.type}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Trigger input: "{log.input}"
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            No crisis activations logged yet. When the user taps the Crisis button, logs will automatically sync here.
          </p>
        )}
      </div>
    </div>
  );
}
