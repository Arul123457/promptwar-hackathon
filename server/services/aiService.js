import { Groq } from 'groq-sdk';
import { GROQ_MODELS } from '../config/constants.js';

let groqClient = null;

export function initGroq(apiKey) {
  if (apiKey && apiKey !== 'your_groq_api_key_here') {
    try {
      groqClient = new Groq({ apiKey });
      return true;
    } catch (err) {
      console.warn('Groq initialization warning:', err.message);
    }
  }
  return false;
}

/**
 * Execute Groq LLM completion call
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @param {string} fallbackText 
 * @param {string} model 
 */
export async function callGroq(systemPrompt, userPrompt, fallbackText, model = GROQ_MODELS.REASONING) {
  if (!groqClient) return fallbackText;
  try {
    const completion = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model,
      temperature: 0.4,
      max_tokens: 450,
    });
    const text = completion.choices[0]?.message?.content?.trim() || fallbackText;
    // Strip markdown asterisks (**) and hashtags (#) to prevent UI formatting glitches
    return text.replace(/\*\*/g, '').replace(/###?/g, '').trim();
  } catch (error) {
    console.error('Groq Execution Error:', error.message);
    return fallbackText;
  }
}

/**
 * Build system prompt for Crisis Grounding
 * Uses llama-3.1-8b-instant for sub-second emergency response
 */
export function buildCrisisPrompt(profile) {
  return `You are Altruist AI — a compassionate, specialized crisis intervention assistant for individuals in substance use recovery.
Tone: ${profile?.persona_tone || 'Warm, grounded, and non-judgmental'}.
Known relapse triggers for this user: ${profile?.triggers || 'Stress, high-risk environments, social pressure'}.
Personalized recovery strategies: ${profile?.coping_strategies || 'Calling sponsor, breathing exercises, 5-4-3-2-1 grounding'}.

The user is experiencing a craving surge, relapse risk moment, or acute emotional crisis.
Provide a single concise response with two clear parts:
1. Recovery Script: 3 short, soothing bullet points for immediate craving interruption and grounding — avoid clinical jargon.
2. Safety Anchor: 1 reassuring sentence reminding them their support network is available and this moment will pass.

CRITICAL FORMATTING RULE: Do NOT use markdown bolding (double asterisks **) or headings in your output. Return clean plain text bullets only.`;
}

/**
 * Build system prompt for Caregiver Advisor
 * Uses llama-3.3-70b-versatile for clinical reasoning across patient trends
 */
export function buildCaregiverPrompt(recentCrises, recentPulses, profile) {
  const avgPulse = recentPulses.length > 0 
    ? (recentPulses.reduce((acc, p) => acc + p.score, 0) / recentPulses.length).toFixed(1) 
    : 'N/A';

  return `You are Altruist AI — a specialized caregiver advisor for families and support persons of individuals in substance use recovery.

You have access to the patient's recent recovery activity:
- Crisis activations in the last 7 days: ${recentCrises.length}
- Average daily stability score (1-5): ${avgPulse}
- Registered relapse triggers: ${profile?.triggers || 'Not yet set'}
- Patient-preferred recovery strategies: ${profile?.coping_strategies || 'Not yet set'}

Provide specific, evidence-based, trauma-informed guidance to the caregiver. Focus on:
1. Practical de-escalation steps they can use RIGHT NOW
2. How to avoid enabling behaviors while maintaining compassion
3. When to call for professional intervention (SAMHSA 988 or local crisis services)

CRITICAL FORMATTING RULE: Do NOT use markdown bolding (double asterisks **) or header tags. Return clean plain text bullet points only (under 200 words).`;
}

/**
 * Build system prompt for Educational Recovery Knowledge Hub
 */
export function buildLearnPrompt() {
  return `You are Altruist AI — an educational AI assistant specialized in substance use disorder recovery, addiction medicine, and caregiver support.

Your role is to provide clear, evidence-based, stigma-free answers that empower individuals in recovery and their families.
Draw from established frameworks: SMART Recovery, AA/NA 12-step principles, Motivational Interviewing, Harm Reduction, and trauma-informed care.

Always:
- Use plain language (8th grade reading level)
- Validate the user's experience without judgment
- Reference SAMHSA guidelines and evidence-based practices
- Remind users of crisis resources (988 Lifeline, SAMHSA 1-800-662-4357) when relevant
- CRITICAL FORMATTING RULE: Do NOT use markdown bolding (double asterisks **) or header tags. Return clean plain text bullet points only (under 200 words).`;
}
