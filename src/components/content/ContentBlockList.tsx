'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContentResponse, isMatchingQuestionContent, isMultipleChoiceQuestionContent } from '@/types/backend-api';
import { apiService } from '@/services/api';
import TextContentBlock from './TextContentBlock';
import MultipleChoiceQuestionContentBlock from './MultipleChoiceQuestionContentBlock';
import MatchingQuestionContentBlock from './MatchingQuestionContentBlock';


interface ContentBlockListProps {
  moduleId: number;
  moduleName?: string;
  isInteractive?: boolean;
  onContentUpdate?: () => void;
  onAddContent?: (addContentFn: (newContent: ContentResponse) => void) => void;
}

export default function ContentBlockList({
  moduleId,
  moduleName,
  isInteractive = true,
  onContentUpdate,
  onAddContent
}: ContentBlockListProps) {
  const [content, setContent] = useState<ContentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const contentData = await apiService.getContentByModuleId(moduleId);
      console.log('Content data:', contentData);
      setContent(contentData);
    } catch (err) {
      console.error('Error loading content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [moduleId]);

  const addContent = useCallback((newContent: ContentResponse) => {
    setContent(prevContent => [...prevContent, newContent]);
  }, []);

  useEffect(() => {
    if (onAddContent) {
      onAddContent(addContent);
    }
  }, [onAddContent, addContent]);

  const handleComplete = async (contentId: number) => {
    try {
      const updatedContent = await apiService.markContentComplete(contentId);

      // Update the content in our local state
      setContent(prevContent =>
        prevContent.map(item =>
          item.id === contentId ? updatedContent : item
        )
      );

      // Notify parent component of the update
      if (onContentUpdate) {
        onContentUpdate();
      }
    } catch (err) {
      console.error('Error marking content complete:', err);
      throw err; // Let the component handle the error display
    }
  };

  const handleSubmitAnswer = async (contentId: number, answer: string) => {
    try {
      const updatedContent = await apiService.submitAnswer(contentId, answer);

      // Update the content in our local state
      setContent(prevContent =>
        prevContent.map(item =>
          item.id === contentId ? updatedContent : item
        )
      );

      // Notify parent component of the update
      if (onContentUpdate) {
        onContentUpdate();
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      throw err; // Let the component handle the error display
    }
  };

  const calculateProgress = () => {
    if (content.length === 0) return 0;

    const completedCount = content.filter(item => {
      if (isMultipleChoiceQuestionContent(item)) {
        return item.userAnswer !== undefined && item.userAnswer !== null;
      } else {
        return item.isComplete === true;
      }
    }).length;

    return Math.round((completedCount / content.length) * 100);
  };

  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="py-6 text-center text-[var(--muted-foreground)]">
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-lg border mb-4 bg-[var(--destructive)] text-[var(--destructive-foreground)]" style={{ borderColor: 'var(--destructive)' }}>
        <h4 className="mb-2 font-semibold">Error Loading Content</h4>
        <p className="mb-3">{error}</p>
        <button
          onClick={loadContent}
          className="px-4 py-2 rounded bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="py-10 text-center border-2 border-dashed rounded-lg text-[var(--muted-foreground)] border-[var(--border)]">
        <h4 className="mb-2 font-semibold">No Content Available</h4>
        <p>
          {moduleName ? `The module "${moduleName}" doesn't have any content yet.` : 'This module doesn\'t have any content yet.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Header */}
      {/* <div className="mb-6 p-4 rounded-lg border bg-[var(--card)]" style={{ borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="m-0 font-semibold text-[var(--card-foreground)]">
            {moduleName ? `${moduleName} Content` : 'Module Content'}
          </h3>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: progress === 100 ? 'var(--secondary)' : 'var(--primary)',
              color: progress === 100 ? 'var(--secondary-foreground)' : 'var(--primary-foreground)',
            }}
          >
            {progress}% Complete
          </span>
        </div>
        <div className="w-full h-2 rounded bg-[var(--muted)] overflow-hidden">
          <div
            className="h-2 rounded transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: progress === 100 ? 'var(--secondary)' : 'var(--primary)',
            }}
          />
        </div>
        <div className="mt-2 text-sm text-[var(--muted-foreground)]">
          {content.filter(item => {
            if (isQuestionContent(item)) {
              return item.userAnswer !== undefined && item.userAnswer !== null;
            } else {
              return item.isComplete === true;
            }
          }).length} of {content.length} items completed
        </div>
      </div> */}
      {/* Content Blocks */}
      <div>
        {content.map((item, index) => {
          if (isMultipleChoiceQuestionContent(item)) {
            return (
              <MultipleChoiceQuestionContentBlock
                key={item.id}
                content={item}
                onSubmitAnswer={handleSubmitAnswer}
                isInteractive={isInteractive}
              />
            );
          } else if (isMatchingQuestionContent(item)) {
            return <MatchingQuestionContentBlock
              key={item.id}
              content={item}
              onSubmitAnswer={handleSubmitAnswer}
              isInteractive={isInteractive}
            />
          }
          else {
            return (
              <TextContentBlock
                key={item.id}
                content={item}
                onComplete={handleComplete}
                isInteractive={isInteractive}
              />
            );
          }
        })}
      </div>
    </div>
  );
} 