/**
 * Web Speech API Helper Module
 * Provides speech-to-text (SpeechRecognition) and text-to-speech (SpeechSynthesis)
 */

class SpeechService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognitionSupported = Boolean(SpeechRecognition);
    this.synthesisSupported = Boolean('speechSynthesis' in window);

    if (this.recognitionSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }

    this.isListening = false;
    this.isSpeaking = false;
  }

  isSupported() {
    return {
      recognition: this.recognitionSupported,
      synthesis: this.synthesisSupported
    };
  }

  /**
   * Start listening for voice input
   */
  startListening({ onResult, onError, onEnd }) {
    if (!this.recognitionSupported) {
      if (onError) onError('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Reset handlers
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({
          interim: interimTranscript,
          final: finalTranscript,
          text: finalTranscript || interimTranscript
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech Recognition error:', event.error);
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      this.isListening = false;
      if (onError) onError(err.message);
      return false;
    }
  }

  /**
   * Stop speech recognition
   */
  stopListening() {
    if (this.recognitionSupported && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Ignored
      }
      this.isListening = false;
    }
  }

  /**
   * Speak text out loud using SpeechSynthesis
   */
  speak(text, { onStart, onEnd, pitch = 1.0, rate = 0.9 } = {}) {
    if (!this.synthesisSupported || !text) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel active speaking first
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate; // Calmer, slightly slower pace
    utterance.pitch = pitch;
    utterance.lang = 'en-US';

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn('Speech Synthesis error:', err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop speaking immediately
   */
  stopSpeaking() {
    if (this.synthesisSupported) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const speechService = new SpeechService();
