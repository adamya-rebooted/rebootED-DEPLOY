'use client';

import { useState } from 'react';
import { Content } from '@/types/backend-api';

interface TextContentBlockProps {
  content: Content;
  onComplete: (contentId: number) => Promise<void>;
  isInteractive?: boolean;
}

export default function TextContentBlock({ content, onComplete, isInteractive = true }: TextContentBlockProps) {
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
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      backgroundColor: content.isComplete ? 'var(--secondary)' : 'var(--card)',
      borderLeft: `4px solid ${content.isComplete ? 'var(--secondary)' : 'var(--primary)'}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h4 style={{
          margin: 0,
          color: content.isComplete ? 'var(--secondary-foreground)' : 'var(--card-foreground)',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          {content.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {content.isComplete && (
            <span style={{
              color: 'var(--secondary-foreground)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ✓ Complete
            </span>
          )}
          <span style={{
            padding: '4px 8px',
            backgroundColor: '#007cba',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            Text
          </span>
        </div>
      </div>

      <div style={{
        color: '#374151',
        lineHeight: '1.6',
        marginBottom: '16px'
      }}>
        {content.body ? (
          content.body.split('\n').map((paragraph, index) => (
            <p key={index} style={{ margin: '0 0 12px 0' }}>
              {paragraph}
            </p>
          ))
        ) : (
          <p style={{ margin: '0 0 12px 0', fontStyle: 'italic', color: '#9CA3AF' }}>
            No content body provided.
          </p>
        )}
      </div>

      {error && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {isInteractive && !content.isComplete && (
        <button
          onClick={handleComplete}
          disabled={completing}
          style={{
            padding: '8px 16px',
            backgroundColor: completing ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: completing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {completing ? 'Marking Complete...' : 'Mark as Complete'}
        </button>
      )}
    </div>
  );
} 