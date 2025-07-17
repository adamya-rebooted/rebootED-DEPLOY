'use client';

import React, { createContext, useContext, useState } from 'react';

interface AIAssistantContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
  showAssistant: () => void;
  hideAssistant: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within AIAssistantProvider');
  }
  return context;
};

export const AIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const showAssistant = () => setIsVisible(true);
  const hideAssistant = () => setIsVisible(false);

  return (
    <AIAssistantContext.Provider value={{
      isVisible,
      toggleVisibility,
      showAssistant,
      hideAssistant
    }}>
      {children}
    </AIAssistantContext.Provider>
  );
}; 