import React, { useState, useEffect } from 'react';
import { HeartHandshake, ShieldAlert, User, Phone, Send, Sparkles, Clock, Check, Copy, Link, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function CaregiverMode({ incidentLog, user }) {
  const [patientStatus, setPatientStatus] = useState('Calm & Stable');
  const [caregiverQuery, setCaregiverQuery] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [liveTrends, setLiveTrends] = useState(null);

  useEffect(() => {
    // Fetch live patient trend data from Supabase postgres for this authenticated user
    if (user?.id) {
      apiService.fetchPatientTrends(user.id).then((res) => {
        if (res && res.success) {
          setLiveTrends(res);
        }
      }).catch(err => console.warn('Could not fetch patient trends:', err));
    }
  }, [user?.id]);

  const handleGenerateInvite = async () => {
    if (!user?.id) {
      console.warn('No authenticated user for invite generation.');
      return;
    }
    try {
      const res = await apiService.generateCaregiverInvite(user.id);
      if (res && res.invite) {
        setInviteCode(res.invite.invite_code);
      }
    } catch (err) {
      console.warn('Invite generation issue:', err);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`https://altruist.ai/invite/${inviteCode}`);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleQueryAdvisor = async (customQuery = '') => {
    const q = customQuery || caregiverQuery;
    if (!q.trim()) return;

    if (!user?.id) {
      console.warn('No authenticated user for caregiver advisor.');
      return;
    }

    setIsLoading(true);
    setAiAdvice('');

    try {
      // Calls Express Backend -> Groq LLM with patient's Supabase crisis history context
      const res = await apiService.askCaregiverAdvisor(q, user.id);
      if (res && res.guidance) {
        setAiAdvice(res.guidance);
      }
    } catch (err) {
      console.error('Caregiver query error:', err);
      setAiAdvice('• Maintain a quiet, low-stimulus environment.\n• Speak in a slow, calm pitch with short validating sentences.\n• Take a moment to relax your own shoulders and breathe.');
    } finally {
      setIsLoading(false);
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
            background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--primary-blue)'
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
              Altruist AI Caregiver Dashboard
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              Monitor live patient trends, generate caregiver invite links, and receive Groq AI de-escalation tips.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Caregiver Invite & Patient Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Caregiver Invite Link Generator */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Link size={20} color="var(--primary-blue)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Caregiver Link & Invite Code
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Link a family member or nurse to share real-time crisis alerts and daily pulse check trends.
          </p>

          {inviteCode ? (
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Invite Code:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', letterSpacing: '0.1em' }}>{inviteCode}</strong>
              </div>
              <button
                onClick={handleCopyInvite}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: copiedInvite ? 'var(--accent-emerald)' : 'var(--primary-blue)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {copiedInvite ? <Check size={16} /> : <Copy size={16} />}
                {copiedInvite ? 'Copied Link' : 'Copy Invite'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateInvite}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--primary-blue)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Generate Caregiver Invite Code
            </button>
          )}
        </div>

        {/* Live Patient Status & Supabase Trends */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Live Patient State (Supabase)
            </h3>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: patientStatus === 'Calm & Stable' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: patientStatus === 'Calm & Stable' ? '#10b981' : '#f87171'
            }}>
              ● {patientStatus}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Registered Profile Triggers:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {liveTrends?.profile?.triggers || 'Sudden loud noise, crowded spaces'}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Total Logged Crisis Activations:</span>
              <strong style={{ color: 'var(--accent-red)', marginLeft: '6px' }}>
                {liveTrends?.crisisCount || (incidentLog ? incidentLog.length : 1)} events
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Groq AI Caregiver Advisor */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={24} color="var(--primary-blue)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Ask Groq AI Caregiver Advisor
          </h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Get immediate clinical de-escalation tips tailored to your patient's recent Supabase event history.
        </p>

        {/* Preset Prompt Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {[
            'De-escalate sudden sensory overload',
            'Managing evening anxiety & restlessness',
            'Preventing caregiver burnout',
            'Calming panic during public outings'
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
            value={caregiverQuery}
            onChange={(e) => setCaregiverQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQueryAdvisor();
            }}
            placeholder="Ask a caregiver question..."
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
            onClick={() => handleQueryAdvisor()}
            disabled={isLoading || !caregiverQuery.trim()}
            style={{
              padding: '12px 24px',
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
            <Send size={18} /> Ask Advisor
          </button>
        </div>

        {aiAdvice && (
          <div style={{
            padding: '20px',
            borderRadius: '14px',
            background: 'var(--bg-secondary)',
            borderLeft: '4px solid var(--primary-blue)',
            lineHeight: '1.7',
            whiteSpace: 'pre-line',
            color: 'var(--text-main)'
          }}>
            {aiAdvice}
          </div>
        )}
      </div>

      {/* Incident Log Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          Real Incident & Crisis Log (Supabase Stream)
        </h3>
        {liveTrends?.recentCrises && liveTrends.recentCrises.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {liveTrends.recentCrises.map((log, i) => (
              <div
                key={i}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--accent-red)', marginBottom: '4px', fontWeight: 700 }}>
                  <span>🚨 Trigger: "{log.transcript}"</span>
                  <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {log.ai_response}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            No crisis activations logged yet. Activate Crisis Mode to see real-time updates here.
          </p>
        )}
      </div>
    </div>
  );
}
