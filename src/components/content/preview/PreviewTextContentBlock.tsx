'use client';

import { useState } from 'react';
import { Content } from '@/types/backend-api';

interface PreviewTextContentBlockProps {
  content: Content;
  onComplete: (contentId: number) => Promise<void>;
  isInteractive?: boolean;
}

export default function PreviewTextContentBlock({
  content,
  onComplete,
  isInteractive = true
}: PreviewTextContentBlockProps) {
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
    <div className="min-h-full" style={{ backgroundColor: 'var(--content-bg)' }}>
      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Content Title */}
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--content-heading)' }}>
          {content.title}
        </h1>

        {/* Content Body */}
        <div className="prose prose-lg max-w-none">
          {content.body ? (
            content.body.split('\n').map((paragraph, index) => {
              // Handle different content formatting
              if (paragraph.trim() === '') {
                return <div key={index} className="mb-4" />;
              }

              // Check if it's a heading (starts with numbers like "1.", "2.", etc.)
              if (/^\d+\.\s/.test(paragraph.trim())) {
                return (
                  <h3 key={index} className="text-xl font-bold mt-8 mb-4" style={{ color: 'var(--content-heading)' }}>
                    {paragraph.trim()}
                  </h3>
                );
              }

              // Check if it's a subheading or key point
              if (paragraph.includes(':') && paragraph.length < 100) {
                return (
                  <h4 key={index} className="text-lg font-semibold mt-6 mb-3" style={{ color: 'var(--content-heading)' }}>
                    {paragraph.trim()}
                  </h4>
                );
              }

              // Regular paragraph
              return (
                <p key={index} className="mb-4 text-base leading-relaxed" style={{ color: 'var(--content-foreground)' }}>
                  {paragraph.trim()}
                </p>
              );
            })
          ) : (
            <p className="italic" style={{ color: 'var(--content-muted)' }}>
              No content available.
            </p>
          )}
        </div>

        {error && (
          <div
            className="mt-6 p-4 rounded-lg border"
            style={{
              backgroundColor: 'var(--content-error-bg)',
              borderColor: 'var(--content-error-border)'
            }}
          >
            <p className="text-sm" style={{ color: 'var(--content-error-text)' }}>{error}</p>
          </div>
        )}

        {/* Mark Complete Button - Only show if not completed */}
        {isInteractive && !content.isComplete && (
          <div className="mt-12 pt-6" style={{ borderTop: `1px solid var(--content-border)` }}>
            <button
              onClick={handleComplete}
              disabled={completing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 hover:opacity-90"
              style={{
                backgroundColor: completing ? 'var(--muted)' : 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              {completing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  Marking Complete...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Complete
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
