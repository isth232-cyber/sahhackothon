import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');
  const [dyslexiaMode, setDyslexiaMode] = useState(() => localStorage.getItem('dyslexiaMode') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');
  const [ttsEnabled, setTtsEnabled] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.className = '';
    root.classList.add(`font-size-${fontSize}`);
    if (dyslexiaMode) root.classList.add('dyslexia-mode');
    if (highContrast) root.classList.add('high-contrast');
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('dyslexiaMode', dyslexiaMode);
    localStorage.setItem('highContrast', highContrast);
  }, [fontSize, dyslexiaMode, highContrast]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      fontSize, setFontSize,
      dyslexiaMode, setDyslexiaMode,
      highContrast, setHighContrast,
      ttsEnabled, setTtsEnabled,
      speak, stopSpeaking,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
