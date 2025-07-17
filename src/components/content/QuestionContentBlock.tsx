'use client';

import { useState } from 'react';
import { QuestionContent } from '@/types/backend-api';

interface QuestionContentBlockProps {
  content: QuestionContent;
  onSubmitAnswer: (contentId: number, answer: string) => Promise<void>;
  isInteractive?: boolean;
}

export default function QuestionContentBlock({ content, onSubmitAnswer, isInteractive = true }: QuestionContentBlockProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(content.userAnswer || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!isInteractive || !selectedAnswer.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await onSubmitAnswer(content.id, selectedAnswer);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const isCorrect = content.userAnswer === content.correctAnswer;
  const hasAnswered = content.userAnswer !== undefined && content.userAnswer !== null;

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      backgroundColor: hasAnswered ? (isCorrect ? 'var(--secondary)' : 'var(--destructive)') : 'var(--card)',
      borderLeft: `4px solid ${hasAnswered ? (isCorrect ? 'var(--secondary)' : 'var(--destructive)') : 'var(--accent)'}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h4 style={{
          margin: 0,
          color: hasAnswered ? (isCorrect ? 'var(--secondary-foreground)' : 'var(--destructive-foreground)') : 'var(--card-foreground)',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          {content.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasAnswered && (
            <span style={{
              color: isCorrect ? 'var(--secondary-foreground)' : 'var(--destructive-foreground)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
          )}
          <span style={{
            padding: '4px 8px',
            backgroundColor: '#ffc107',
            color: '#212529',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            Question
          </span>
        </div>
      </div>

      <div style={{
        color: '#374151',
        lineHeight: '1.6',
        marginBottom: '20px'
      }}>
        {content.body ? (
          content.body.split('\n').map((paragraph, index) => (
            <p key={index} style={{ margin: '0 0 12px 0', fontWeight: index === 0 ? '500' : '400' }}>
              {paragraph}
            </p>
          ))
        ) : (
          <p style={{ margin: '0 0 16px 0', fontWeight: '500' }}>
            No question description provided.
          </p>
        )}
      </div>

      {content.options && content.options.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>Choose your answer:</strong>
          </div>
          
          {content.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
            const isSelectedOption = selectedAnswer === option;
            const isCorrectOption = content.correctAnswer === option;
            const isUserAnswer = content.userAnswer === option;

            return (
              <label
                key={index}
                style={{
                  display: 'block',
                  padding: '12px',
                  margin: '8px 0',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  backgroundColor: hasAnswered
                    ? (isUserAnswer
                        ? (isCorrectOption ? 'var(--secondary)' : 'var(--destructive)')
                        : (isCorrectOption ? 'var(--secondary)' : 'var(--background)'))
                    : (isSelectedOption ? 'var(--accent)' : 'var(--background)'),
                  color: hasAnswered
                    ? (isUserAnswer || isCorrectOption ? 'var(--background)' : 'var(--text)')
                    : (isSelectedOption ? 'var(--background)' : 'var(--text)'),
                  cursor: isInteractive && !hasAnswered ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  borderColor: hasAnswered
                    ? (isUserAnswer
                        ? (isCorrectOption ? 'var(--secondary)' : 'var(--destructive)')
                        : (isCorrectOption ? 'var(--secondary)' : 'var(--border)'))
                    : (isSelectedOption ? 'var(--accent)' : 'var(--border)')
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="radio"
                    name={`question-${content.id}`}
                    value={option}
                    checked={isSelectedOption}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={!isInteractive || hasAnswered}
                    style={{ margin: 0 }}
                  />
                  <span style={{ 
                    fontWeight: '500', 
                    color: '#6c757d',
                    minWidth: '20px'
                  }}>
                    {optionLetter}.
                  </span>
                  <span style={{ 
                    color: '#374151',
                    flex: 1
                  }}>
                    {option}
                  </span>
                  {hasAnswered && isCorrectOption && (
                    <span style={{ color: '#28a745', fontSize: '16px' }}>✓</span>
                  )}
                  {hasAnswered && isUserAnswer && !isCorrectOption && (
                    <span style={{ color: '#dc3545', fontSize: '16px' }}>✗</span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {hasAnswered && (
        <div style={{
          padding: '12px',
          backgroundColor: isCorrect ? '#d1ecf1' : '#f8d7da',
          border: `1px solid ${isCorrect ? '#bee5eb' : '#f5c6cb'}`,
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '14px', color: '#374151' }}>
            <strong>Your answer:</strong> {content.userAnswer}
          </div>
          {!isCorrect && (
            <div style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}>
              <strong>Correct answer:</strong> {content.correctAnswer}
            </div>
          )}
        </div>
      )}

      {/* {error && (
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
      )} */}

      {/* {isInteractive && !hasAnswered && (
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedAnswer.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: submitting || !selectedAnswer.trim() ? '#6c757d' : '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting || !selectedAnswer.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      )} */}
    </div>
  );
} 