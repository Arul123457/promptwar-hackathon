import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, Send, HelpCircle, Heart, Shield, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import BreathingWidget from './BreathingWidget';

export default function LearnTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topicArticles = [
    {
      id: 'cravings',
      title: 'Understanding & Managing Cravings',
      category: 'Recovery',
      icon: '🔥',
      summary: 'Learn why cravings peak, how long they last, and evidence-based techniques to ride them out safely.',
      content: `A craving is an intense urge to use a substance, driven by dopamine pathways and environmental triggers.
      
      Key Steps to Ride Out a Craving (SURF technique):
      1. Stop: Recognize the craving without judgment. Label it: "I am experiencing a craving."
      2. Understand: Identify what triggered it — person, place, emotion, or time of day.
      3. Ride: Most cravings peak at 20-30 minutes. Breathe through it — it will pass without action.
      4. Feel: Use the 5-4-3-2-1 grounding method to anchor to the present moment.`
    },
    {
      id: 'relapse',
      title: 'Relapse Prevention: Warning Signs',
      category: 'Prevention',
      icon: '🛡️',
      summary: 'Recognize emotional, mental, and behavioral warning signs before relapse occurs.',
      content: `Relapse is a process, not a single event. It often begins weeks before any substance use.
      
      Three Stages of Relapse to Watch For:
      1. Emotional Relapse: Bottling feelings, isolation, poor self-care, skipping meetings.
      2. Mental Relapse: Craving thoughts, romanticizing past use, thinking about "just once."
      3. Physical Relapse: Returning to substance use.

      Action Plan: When you notice Stage 1 or 2 signs, call your sponsor, attend a meeting, or activate Altruist AI Crisis Support immediately.`
    },
    {
      id: 'withdrawal',
      title: 'Managing Withdrawal Symptoms',
      category: 'Medical Support',
      icon: '💊',
      summary: 'Safe strategies for navigating withdrawal discomfort with caregiver coordination.',
      content: `Withdrawal symptoms vary by substance but often include anxiety, sweating, insomnia, and irritability.
      
      Safety Guidelines:
      - Never attempt withdrawal from alcohol or benzodiazepines alone — medical supervision is essential.
      - For other substances: hydrate, rest, and lean on your support network.
      - Use breathing and grounding techniques to manage anxiety surges.
      - Inform your caregiver of your status using the Altruist AI Caregiver link.`
    },
    {
      id: 'grounding',
      title: 'The Science of 5-4-3-2-1 Grounding',
      category: 'Techniques',
      icon: '🌿',
      summary: 'How sensory indexing breaks the craving and anxiety feedback loop.',
      content: `During a craving or panic surge, the brain's reward pathways hijack attention toward the substance. Sensory grounding forces the mind to shift focus from internal craving thoughts to external real-world facts.
      
      - 5 Things you See
      - 4 Things you Touch
      - 3 Things you Hear
      - 2 Things you Smell
      - 1 Thing you Taste

      This works because your brain cannot simultaneously process intense craving ideation AND external sensory data at full capacity.`
    }
  ];

  const handleSearchSubmit = async (customQuery = '') => {
    const q = customQuery || searchQuery;
    if (!q.trim()) return;

    setIsLoading(true);
    setAiAnswer('');

    try {
      // Calls backend Express endpoint (NEVER calls Groq directly from browser)
      const res = await apiService.queryLearnHub(q);
      if (res && res.content) {
        setAiAnswer(res.content);
      }
    } catch (err) {
      console.error('Learn search error:', err);
      setAiAnswer('• 5-4-3-2-1 Grounding helps redirect focus away from racing thoughts and back to the present moment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Banner */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--primary-blue)'
          }}>
            <BookOpen size={28} />
          </div>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--text-main)'
            }}>
              AI-Powered Recovery Knowledge Hub
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              Explore evidence-based recovery guides and ask our AI Assistant any substance use recovery or caregiving question.
            </p>
          </div>
        </div>
      </div>

      {/* AI Q&A Search Box */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={22} color="var(--primary-blue)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Ask AI Recovery Assistant
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
              placeholder="Ask any recovery question (e.g., How do I manage cravings at night? What are relapse warning signs?)..."
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                fontSize: '0.95rem'
              }}
            />
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          </div>

          <button
            onClick={() => handleSearchSubmit()}
            disabled={isLoading || !searchQuery.trim()}
            style={{
              padding: '14px 24px',
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
            <Send size={18} /> Search
          </button>
        </div>

        {/* AI Loading State */}
        {isLoading && (
          <div style={{
            padding: '20px', borderRadius: '14px', textAlign: 'center',
            background: 'rgba(59, 130, 246, 0.04)',
            border: '1px solid rgba(59, 130, 246, 0.15)'
          }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>⏳</div>
            <p style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>Generating your recovery guidance...</p>
          </div>
        )}

        {/* AI Answer — Structured Output */}
        {aiAnswer && !isLoading && (
          <div style={{ borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.2)', overflow: 'hidden' }}>
            <div style={{
              padding: '12px 18px', background: 'var(--primary-blue)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <Sparkles size={16} color="#ffffff" />
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>AI Recovery Assistant Response</div>
            </div>
            <div style={{ padding: '18px 20px', background: '#ffffff' }}>
              {aiAnswer.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{
                    flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
                    background: 'rgba(30, 58, 138, 0.1)', color: 'var(--primary-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 800, marginTop: '2px'
                  }}>{i + 1}</div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-heading)', lineHeight: 1.65, fontWeight: 500 }}>
                    {line.replace(/^[•\-*\d.\s]+/, '').trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BreathingWidget />

      {/* Article Library */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>
        Recovery Guides & Educational Resources
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {topicArticles.map((article) => (
          <div
            key={article.id}
            className="glass-panel glass-panel-interactive"
            onClick={() => setSelectedTopic(selectedTopic?.id === article.id ? null : article)}
            style={{ padding: '24px' }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{article.icon}</div>
            <span style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'var(--bg-secondary)',
              color: 'var(--primary-blue)',
              marginBottom: '8px'
            }}>
              {article.category}
            </span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              {article.title}
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {article.summary}
            </p>

            {selectedTopic?.id === article.id && (
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-glass)',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {article.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
