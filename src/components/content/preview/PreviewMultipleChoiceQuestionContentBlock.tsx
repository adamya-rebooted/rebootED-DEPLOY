'use client';

import { useState } from 'react';
import { MultipleChoiceQuestion } from '@/types/backend-api';
import { CheckCircle, XCircle, HelpCircle, Send } from 'lucide-react';

interface PreviewMultipleChoiceQuestionContentBlockProps {
  content: MultipleChoiceQuestion;
  onSubmitAnswer: (contentId: number, answer: string) => Promise<void>;
  isInteractive?: boolean;
}

export default function PreviewMultipleChoiceQuestionContentBlock({
  content,
  onSubmitAnswer,
  isInteractive = true,
}: PreviewMultipleChoiceQuestionContentBlockProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedAnswer || !isInteractive) return;

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
    <div className="min-h-full" style={{ backgroundColor: 'var(--content-bg)' }}>
      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Content Title */}
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--content-heading)' }}>
          {content.title}
        </h1>

        {/* Question Body */}
        {content.body && (
          <div className="prose prose-lg max-w-none mb-8">
            {content.body.split('\n').map((paragraph, index) => {
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
            })}
          </div>
        )}

        {/* Options */}
        {content.options && content.options.length > 0 && (
          <div className="space-y-3 mb-8">
            {content.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelectedOption = selectedAnswer === option;
              const isCorrectOption = content.correctAnswer === option;
              const isUserAnswer = content.userAnswer === option;

              return (
                <label
                  key={index}
                  className="block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: hasAnswered
                      ? isCorrectOption
                        ? 'var(--secondary)'
                        : isUserAnswer && !isCorrectOption
                        ? 'var(--destructive)'
                        : 'var(--content-border)'
                      : isSelectedOption
                      ? 'var(--primary)'
                      : 'var(--content-border)',
                    backgroundColor: hasAnswered
                      ? isCorrectOption
                        ? 'var(--secondary)'
                        : isUserAnswer && !isCorrectOption
                        ? 'var(--content-error-bg)'
                        : 'var(--content-bg)'
                      : isSelectedOption
                      ? 'var(--accent)'
                      : 'var(--content-bg)'
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
                      className="w-4 h-4 accent-[var(--primary)]"
                    />
                    <span
                      className="font-semibold text-sm min-w-[24px] h-6 w-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: hasAnswered && isCorrectOption
                          ? 'var(--secondary)'
                          : hasAnswered && isUserAnswer && !isCorrectOption
                          ? 'var(--destructive)'
                          : isSelectedOption
                          ? 'var(--primary)'
                          : 'var(--muted)',
                        color: hasAnswered && isCorrectOption
                          ? 'var(--secondary-foreground)'
                          : hasAnswered && isUserAnswer && !isCorrectOption
                          ? 'var(--destructive-foreground)'
                          : isSelectedOption
                          ? 'var(--primary-foreground)'
                          : 'var(--muted-foreground)'
                      }}
                    >
                      {optionLetter}
                    </span>
                    <span className="flex-1" style={{ color: 'var(--content-foreground)' }}>{option}</span>
                    {hasAnswered && isCorrectOption && (
                      <CheckCircle className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                    )}
                    {hasAnswered && isUserAnswer && !isCorrectOption && (
                      <XCircle className="h-5 w-5" style={{ color: 'var(--destructive)' }} />
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* Feedback Section */}
        {hasAnswered && (
          <div
            className="p-4 rounded-lg border mb-8"
            style={{
              backgroundColor: isCorrect ? 'var(--secondary)' : 'var(--content-error-bg)',
              borderColor: isCorrect ? 'var(--secondary)' : 'var(--content-error-border)'
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: 'var(--content-heading)' }}>Your answer:</span>
                <span style={{
                  color: isCorrect ? 'var(--secondary-foreground)' : 'var(--content-error-text)'
                }}>
                  {content.userAnswer}
                </span>
              </div>
              {!isCorrect && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: 'var(--content-heading)' }}>Correct answer:</span>
                  <span style={{ color: 'var(--secondary)' }}>{content.correctAnswer}</span>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Submit Button */}
        {isInteractive && !hasAnswered && (
          <div className="mt-12 pt-6" style={{ borderTop: `1px solid var(--content-border)` }}>
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer || submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 hover:opacity-90"
              style={{
                backgroundColor: (!selectedAnswer || submitting) ? 'var(--muted)' : 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Answer
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
