'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAIAssistant } from './AIAssistantProvider';
import { Bot } from 'lucide-react';

export const FloatingAIButton: React.FC = () => {
  const { toggleVisibility, isVisible } = useAIAssistant();

  return (
    <Button
      onClick={toggleVisibility}
      size="icon"
      className={`
        fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40
        transition-all duration-200 hover:scale-110
        ${isVisible ? 'bg-primary/80' : 'bg-primary'}
      `}
      aria-label="Toggle AI Assistant"
    >
      <Bot className="h-6 w-6" />
    </Button>
  );
}; 