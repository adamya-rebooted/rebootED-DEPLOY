'use client';

import { useAIAssistant } from '@/components/ai-assistant';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Page() {
  const { showAssistant } = useAIAssistant();
  const router = useRouter();

  useEffect(() => {
    showAssistant();
    router.push('/management-dashboard');
  }, [showAssistant, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold">AI Course Generation</h1>
        <p className="text-muted-foreground">
          AI Course Generation is now available as a floating assistant accessible from any page!
        </p>
        <p className="text-sm text-muted-foreground">
          Look for the AI bot button in the bottom-right corner of any page.
        </p>
        <div className="space-y-2">
          <p className="text-sm">Redirecting to dashboard...</p>
          <Button onClick={() => router.push('/management-dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 