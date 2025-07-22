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
    <div
      className="mb-4 p-5 rounded-lg border relative"
      style={{
        backgroundColor: hasAnswered ? (isCorrect ? 'var(--secondary)' : 'var(--destructive)') : 'var(--card)',
        borderColor: 'var(--border)',
        borderLeft: `4px solid ${hasAnswered ? (isCorrect ? 'var(--secondary)' : 'var(--destructive)') : 'var(--accent)'}`
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <h4
          className="m-0 text-lg font-semibold"
          style={{ color: hasAnswered ? (isCorrect ? 'var(--secondary-foreground)' : 'var(--destructive-foreground)') : 'var(--card-foreground)' }}
        >
          {content.title}
        </h4>
        <div className="flex items-center gap-2">
          {hasAnswered && (
            <span className="text-sm font-medium" style={{ color: isCorrect ? 'var(--secondary-foreground)' : 'var(--destructive-foreground)' }}>
              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
          )}
          <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
            Question
          </span>
        </div>
      </div>
      <div className="mb-5 text-[var(--muted-foreground)] leading-relaxed">
        {content.body ? (
          content.body.split('\n').map((paragraph, index) => (
            <p key={index} className={`mb-3 last:mb-0 ${index === 0 ? 'font-medium' : 'font-normal'}`}>{paragraph}</p>
          ))
        ) : (
          <p className="mb-4 font-medium">No question description provided.</p>
        )}
      </div>
      {content.options && content.options.length > 0 && (
        <div className="mb-4">
          <div className="mb-3">
            <strong className="text-sm text-[var(--card-foreground)]">Choose your answer:</strong>
          </div>
          {content.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isSelectedOption = selectedAnswer === option;
            const isCorrectOption = content.correctAnswer === option;
            const isUserAnswer = content.userAnswer === option;
            return (
              <label
                key={index}
                className="block mb-2 cursor-pointer"
                style={{
                  backgroundColor: hasAnswered
                    ? (isUserAnswer
                      ? (isCorrectOption ? 'var(--secondary)' : 'var(--destructive)')
                      : (isCorrectOption ? 'var(--secondary)' : 'var(--background)'))
                    : (isSelectedOption ? 'var(--accent)' : 'var(--background)'),
                  color: hasAnswered
                    ? (isUserAnswer || isCorrectOption ? 'var(--background)' : 'var(--text)')
                    : (isSelectedOption ? 'var(--background)' : 'var(--text)'),
                  borderColor: hasAnswered
                    ? (isUserAnswer
                      ? (isCorrectOption ? 'var(--secondary)' : 'var(--destructive)')
                      : (isCorrectOption ? 'var(--secondary)' : 'var(--border)'))
                    : (isSelectedOption ? 'var(--accent)' : 'var(--border)'),
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderRadius: 8,
                  padding: 12,
                  transition: 'all 0.2s ease',
                  margin: '8px 0',
                  display: 'block',
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`question-${content.id}`}
                    value={option}
                    checked={isSelectedOption}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={!isInteractive || hasAnswered}
                    className="mr-2 accent-[var(--primary)]"
                  />
                  <span className="font-medium text-[var(--muted-foreground)] min-w-[20px]">{optionLetter}.</span>
                  <span className="flex-1 text-[var(--card-foreground)]">{option}</span>
                  {hasAnswered && isCorrectOption && (
                    <span className="text-lg" style={{ color: 'var(--secondary)' }}>✓</span>
                  )}
                  {hasAnswered && isUserAnswer && !isCorrectOption && (
                    <span className="text-lg" style={{ color: 'var(--destructive)' }}>✗</span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}
      {hasAnswered && (
        <div
          className="mb-4 p-3 rounded border text-sm"
          style={{
            backgroundColor: isCorrect ? 'var(--muted)' : 'var(--destructive)',
            color: isCorrect ? 'var(--card-foreground)' : 'var(--destructive-foreground)',
            borderColor: isCorrect ? 'var(--secondary)' : 'var(--destructive)',
          }}
        >
          <div>
            <strong>Your answer:</strong> {content.userAnswer}
          </div>
          {!isCorrect && (
            <div className="mt-1">
              <strong>Correct answer:</strong> {content.correctAnswer}
            </div>
          )}
        </div>
      )}
      {/* {isInteractive && !hasAnswered && (
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedAnswer.trim()}
          className={`px-5 py-2 rounded font-medium text-sm transition-colors mt-2 ${submitting || !selectedAnswer.trim() ? 'bg-[var(--muted-foreground)] cursor-not-allowed' : 'bg-[var(--primary)] hover:bg-[var(--accent)] cursor-pointer'} text-[var(--primary-foreground)]`}
        >
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      )} */}
    </div>
  );
} 