import { describe, it, expect } from 'vitest';
import { speechService } from '../services/speechService';

describe('SpeechService Web Speech API Helper', () => {
  it('should return support object with recognition and synthesis boolean status', () => {
    const status = speechService.isSupported();
    expect(status).toBeDefined();
    expect(typeof status.recognition).toBe('boolean');
    expect(typeof status.synthesis).toBe('boolean');
  });

  it('should safely handle speak call without throwing exceptions', () => {
    expect(() => {
      speechService.speak('Testing Altruist AI text to speech readout', { rate: 0.9 });
    }).not.toThrow();
  });
});
