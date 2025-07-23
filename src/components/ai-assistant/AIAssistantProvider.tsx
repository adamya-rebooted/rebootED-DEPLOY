'use client';

import React, { createContext, useContext, useState } from 'react';

interface AIAssistantContextType {
  isVisible: boolean;
  selectedModuleId: number | null;
  toggleVisibility: () => void;
  showAssistant: () => void;
  hideAssistant: () => void;
  selectModule: (moduleId: number) => void;
  clearSelection: () => void;
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
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const showAssistant = () => setIsVisible(true);
  const selectModule = (moduleId: number) => setSelectedModuleId(moduleId);
  const clearSelection = () => setSelectedModuleId(null);

  const hideAssistant = () => {
    setIsVisible(false);
    setSelectedModuleId(null);
  };

  return (
    <AIAssistantContext.Provider value={{
      isVisible,
      selectedModuleId,
      toggleVisibility,
      showAssistant,
      hideAssistant,
      selectModule,
      clearSelection
    }}>
      {children}
    </AIAssistantContext.Provider>
  );
}; 