'use client';

import { useState } from 'react';
import { Content } from '@/types/backend-api';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface TextContentBlockProps {
  content: Content;
  onComplete: (contentId: number) => Promise<void>;
  onEdit?: (contentId: number) => void;
  isInteractive?: boolean;
}

export default function TextContentBlock({ content, onComplete, onEdit, isInteractive = true }: TextContentBlockProps) {
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!isInteractive || content.isComplete) return;

    try {
      setCompleting(true);
      setError(null);
      await onComplete(content.id);
    } catch (err) {
      console.error('Error marking content complete:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark as complete');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div
      className="mb-4 p-5 rounded-lg border relative"
      style={{
        backgroundColor: content.isComplete ? 'var(--secondary)' : 'var(--card)',
        borderColor: 'var(--border)',
        borderLeft: `4px solid ${content.isComplete ? 'var(--secondary)' : 'var(--primary)'}`
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <h4
          className="m-0 text-lg font-semibold"
          style={{ color: content.isComplete ? 'var(--secondary-foreground)' : 'var(--card-foreground)' }}
        >
          {content.title}
        </h4>
        <div className="flex items-center gap-2">
          {content.isComplete && (
            <span className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>
              ✓ Complete
            </span>
          )}
          <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
            Text
          </span>
          {isInteractive && onEdit && (
            <Button
              onClick={() => onEdit(content.id)}
              variant="outline"
              size="sm"
              className="border-[var(--border)] text-[var(--primary)]"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="mb-4 text-[var(--muted-foreground)] leading-relaxed">
        {content.body ? (
          content.body.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3 last:mb-0">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="mb-3 italic text-[var(--muted-foreground)]">
            No content body provided.
          </p>
        )}
      </div>
      {error && (
        <div className="mb-3 p-2 rounded border text-sm" style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)', borderColor: 'var(--destructive)' }}>
          {error}
        </div>
      )}
      {isInteractive && !content.isComplete && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${completing ? 'bg-[var(--muted-foreground)] cursor-not-allowed' : 'bg-[var(--secondary)] hover:bg-[var(--accent)] cursor-pointer'} text-[var(--secondary-foreground)]`}
        >
          {completing ? 'Marking Complete...' : 'Mark as Complete'}
        </button>
      )}
    </div>
  );
} 