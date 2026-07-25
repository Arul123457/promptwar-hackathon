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
      id: 'panic',
      title: 'Understanding Panic Attacks vs Anxiety',
      category: 'Psychology',
      icon: '🧠',
      summary: 'Learn the physiological triggers of panic attacks and how to reset your nervous system.',
      content: `A panic attack is a sudden surge of intense fear that reaches a peak within minutes.
      
      Key Steps to Cope:
      1. Acknowledge: Remind yourself "This is panic, it is uncomfortable, but it is NOT dangerous and WILL pass."
      2. Grounding: Engage your 5 senses to bring your prefrontal cortex back online.
      3. Controlled Breathing: Exhale longer than you inhale (4 sec in, 6 sec out).`
    },
    {
      id: 'sensory',
      title: 'Managing Sensory Overload',
      category: 'Sensory Care',
      icon: '🎧',
      summary: 'Simple strategies to reduce overwhelming noise, bright lights, and crowded spaces.',
      content: `Sensory overload occurs when your brain receives more input from your senses than it can process.
      
      Action Plan:
      - Noise Control: Use noise-canceling headphones or earplugs.
      - Lighting: Switch off fluorescent overheads; opt for soft lamps or dim blue light filters.
      - Micro-breaks: Retreat to a designated quiet "safe zone" for 10 minutes.`
    },
    {
      id: 'dementia',
      title: 'Dementia Agitation & Communication',
      category: 'Caregiving',
      icon: '🤝',
      summary: 'De-escalation tactics for memory loss, confusion, and evening restlessness (sundowning).',
      content: `Agitation in dementia often stems from unmet needs, physical discomfort, or environmental overstimulation.
      
      Communication Tips:
      - Speak in low, calm tones using short 4-word sentences.
      - Validate emotions rather than arguing over facts or memory gaps.
      - Maintain familiar daily routines and reassuring touch.`
    },
    {
      id: 'grounding',
      title: 'The Science of 5-4-3-2-1 Grounding',
      category: 'Techniques',
      icon: '🌿',
      summary: 'How sensory indexing breaks the fight-or-flight anxiety feedback loop.',
      content: `When panic strikes, the brain's amygdala triggers fight-or-flight. Sensory grounding forces the mind to shift focus from internal anxiety thoughts to external real-world physical facts.
      
      - 5 Things you See
      - 4 Things you Touch
      - 3 Things you Hear
      - 2 Things you Smell
      - 1 Thing you Taste`
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
              Altruist AI Knowledge Hub
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              Explore evidence-based coping guides and ask Groq AI any mental health or caregiving question.
            </p>
          </div>
        </div>
      </div>

      {/* AI Q&A Search Box */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={22} color="var(--primary-blue)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Ask Groq Mental Health AI
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
              placeholder="Ask any coping question (e.g., How to manage panic attacks at night?)..."
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

        {aiAnswer && (
          <div style={{
            padding: '20px',
            borderRadius: '14px',
            background: 'var(--bg-secondary)',
            borderLeft: '4px solid var(--primary-blue)',
            lineHeight: '1.7',
            whiteSpace: 'pre-line',
            color: 'var(--text-main)'
          }}>
            {aiAnswer}
          </div>
        )}
      </div>

      <BreathingWidget />

      {/* Article Library */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>
        Recommended Coping Guides
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
