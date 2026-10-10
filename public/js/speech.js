/**
 * NoticeNexus — Universal Accessibility & Speech Controller
 * Handles browser-based SpeechSynthesis (TTS) with rate control,
 * English and Telugu voice selection, and visual play/stop indicators.
 */

const SpeechController = {
  isSpeaking: false,
  currentUtterance: null,

  /**
   * Check if SpeechSynthesis is supported by user's browser
   */
  isSupported() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  },

  /**
   * Speak a text string with specified language code
   * @param {string} text - The text to read aloud
   * @param {string} lang - BCP-47 language tag ('en-US', 'te-IN')
   * @param {Object} callbacks - onStart, onEnd, onError
   */
  speak(text, lang = 'en-US', callbacks = {}) {
    if (!this.isSupported()) {
      alert("Text-to-Speech is not supported in this browser. Please use Chrome, Edge, or Firefox.");
      return;
    }

    // Cancel any current utterance
    this.stop();

    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly slower for crisp academic clarity
    utterance.pitch = 1.0;

    // Optional voice lookup matching preferred language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang) || v.lang.replace('_', '-').startsWith(lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (callbacks.onStart) callbacks.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (callbacks.onEnd) callbacks.onEnd();
    };

    utterance.onerror = (err) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (callbacks.onError) callbacks.onError(err);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  },

  /**
   * Immediately cancel any active speech
   */
  stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }
};
