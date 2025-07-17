'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContentResponse, isQuestionContent } from '@/types/backend-api';
import { apiService } from '@/services/api';
import TextContentBlock from './TextContentBlock';
import QuestionContentBlock from './QuestionContentBlock';

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
      if (isQuestionContent(item)) {
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
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        backgroundColor: '#f8d7da',
        color: '#721c24'
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Error Loading Content</h4>
        <p style={{ margin: '0 0 12px 0' }}>{error}</p>
        <button
          onClick={loadContent}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div style={{
        padding: '30px',
        textAlign: 'center',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        color: '#6c757d'
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>No Content Available</h4>
        <p style={{ margin: 0 }}>
          {moduleName ? `The module "${moduleName}" doesn't have any content yet.` : 'This module doesn\'t have any content yet.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Header */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, color: 'var(--card-foreground)' }}>
            {moduleName ? `${moduleName} Content` : 'Module Content'}
          </h3>
          <span style={{
            padding: '4px 12px',
            backgroundColor: progress === 100 ? 'var(--secondary)' : 'var(--primary)',
            color: progress === 100 ? 'var(--secondary-foreground)' : 'var(--primary-foreground)',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {progress}% Complete
          </span>
        </div>
        
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--muted)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: progress === 100 ? 'var(--secondary)' : 'var(--primary)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--muted-foreground)' }}>
          {content.filter(item => {
            if (isQuestionContent(item)) {
              return item.userAnswer !== undefined && item.userAnswer !== null;
            } else {
              return item.isComplete === true;
            }
          }).length} of {content.length} items completed
        </div>
      </div>

      {/* Content Blocks */}
      <div>
        {content.map((item, index) => {
          if (isQuestionContent(item)) {
            return (
              <QuestionContentBlock
                key={item.id}
                content={item}
                onSubmitAnswer={handleSubmitAnswer}
                isInteractive={isInteractive}
              />
            );
          } else {
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