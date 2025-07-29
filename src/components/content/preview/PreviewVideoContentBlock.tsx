'use client';

import { useState } from 'react';
import { Video } from '@/types/backend-api';
import { CheckCircle, Play, Clock, Video as VideoIcon } from 'lucide-react';

interface PreviewVideoContentBlockProps {
  content: Video;
  onComplete: (contentId: number) => Promise<void>;
  isInteractive?: boolean;
}

export default function PreviewVideoContentBlock({
  content,
  onComplete,
  isInteractive = true,
}: PreviewVideoContentBlockProps) {
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!isInteractive || content.isComplete) return;
    try {
      setCompleting(true);
      setError(null);
      await onComplete(content.id);
    } catch (err) {
      console.error('Error marking video complete:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark as complete');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all duration-200 hover:shadow-md">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(to right, #fafcff, #f0f4ff)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg`} style={{ backgroundColor: content.isComplete ? '#1e7656' : '#73afc9', color: '#fafcff' }}>
              {content.isComplete ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <VideoIcon className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: '#070809' }}>
                {content.title}
              </h3>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#1f3a60' }}>
                <Play className="h-4 w-4" />
                <span>Video Content</span>
              </div>
            </div>
          </div>

          {content.isComplete && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#1e7656', color: '#fafcff' }}>
              <CheckCircle className="h-4 w-4" />
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Video Section */}
      <div className="px-6 py-6">
        <div className="mb-6">
          {content.videoUrl ? (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="aspect-video">
                <iframe
                  src={content.videoUrl}
                  title={content.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No video available</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {content.body && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: '#070809' }}>
              Description
            </h4>
            <div className="prose prose-gray max-w-none">
              {content.body.split('\n').map((line, idx) => (
                <p key={idx} className="mb-3 last:mb-0 leading-relaxed" style={{ color: '#070809' }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Action Section */}
        {isInteractive && !content.isComplete && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleComplete}
              disabled={completing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 hover:opacity-90"
              style={{
                backgroundColor: completing ? '#6b7280' : '#73afc9',
                color: '#fafcff'
              }}
            >
              {completing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Marking Complete...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
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
