'use client';

import { useState } from 'react';
import { MatchingQuestion } from '@/types/backend-api';
import { ChevronDown } from 'lucide-react';

interface PreviewMatchingQuestionContentBlockProps {
  content: MatchingQuestion;
  onSubmitAnswer: (contentId: number, answer: string) => Promise<void>;
  isInteractive?: boolean;
}

export default function PreviewMatchingQuestionContentBlock({
  content,
  onSubmitAnswer,
  isInteractive = true,
}: PreviewMatchingQuestionContentBlockProps) {
  const [selections, setSelections] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse the matching pairs from content using correct property names
  const correctMap: { [key: string]: string } = {};
  const leftItems: string[] = [];
  const rightItems: string[] = [];

  if (content.matches) {
    content.matches.forEach(match => {
      correctMap[match.first] = match.second;
      leftItems.push(match.first);
      if (!rightItems.includes(match.second)) {
        rightItems.push(match.second);
      }
    });
  }

  // Shuffle right items for display
  const shuffledRightItems = [...rightItems].sort(() => Math.random() - 0.5);

  const handleSelection = (left: string, right: string) => {
    if (!isInteractive || submitted) return;
    setSelections(prev => ({ ...prev, [left]: right }));
  };

  const handleSubmit = async () => {
    if (!isInteractive || Object.keys(selections).length !== leftItems.length) return;

    try {
      setSubmitting(true);
      setError(null);
      await onSubmitAnswer(content.id, JSON.stringify(selections));
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const submitted = content.userAnswer !== undefined && content.userAnswer !== null;
  let userSelections: { [key: string]: string } = {};
  if (submitted && content.userAnswer) {
    try {
      userSelections = JSON.parse(content.userAnswer);
    } catch (e) {
      console.error('Error parsing user answer:', e);
    }
  }

  const isAllCorrect = submitted && leftItems.every(left => userSelections[left] === correctMap[left]);

  // Calculate points (assuming 10 points total, distributed evenly)
  const totalPoints = 10;
  const pointsPerItem = Math.floor(totalPoints / leftItems.length);
  const earnedPoints = submitted ? leftItems.filter(left => userSelections[left] === correctMap[left]).length * pointsPerItem : 0;

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

        {/* Matching Interface */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Column - Prompts */}
          <div>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--content-heading)' }}>
              Prompts
            </h3>
            <div className="space-y-4">
              {leftItems.map((left, index) => {
                const isCorrect = submitted && userSelections[left] === correctMap[left];
                const isWrong = submitted && userSelections[left] && userSelections[left] !== correctMap[left];

                return (
                  <div
                    key={left}
                    className="p-4 rounded-lg border-2 transition-all duration-200"
                    style={{
                      borderColor: submitted
                        ? isCorrect
                          ? 'var(--secondary)'
                          : isWrong
                          ? 'var(--destructive)'
                          : 'var(--content-border)'
                        : 'var(--content-border)',
                      backgroundColor: submitted
                        ? isCorrect
                          ? 'var(--secondary)'
                          : isWrong
                          ? 'var(--content-error-bg)'
                          : 'var(--muted)'
                        : 'var(--muted)'
                    }}
                  >
                    <span className="text-base" style={{ color: 'var(--content-foreground)' }}>{left}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Answers */}
          <div>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--content-heading)' }}>
              Answers
            </h3>
            <div className="space-y-4">
              {leftItems.map((left, index) => {
                const selected = submitted ? userSelections[left] : selections[left];
                const isCorrect = submitted && userSelections[left] === correctMap[left];
                const isWrong = submitted && userSelections[left] && userSelections[left] !== correctMap[left];

                return (
                  <div key={left} className="relative">
                    {!submitted ? (
                      <div className="relative">
                        <select
                          value={selections[left] || ''}
                          onChange={(e) => handleSelection(left, e.target.value)}
                          disabled={!isInteractive}
                          className="w-full p-4 pr-10 rounded-lg border-2 appearance-none text-base"
                          style={{
                            borderColor: 'var(--accent)',
                            backgroundColor: 'var(--content-bg)',
                            color: selections[left] ? 'var(--content-foreground)' : 'var(--content-muted)'
                          }}
                        >
                          <option value="" disabled>Choose a match</option>
                          {shuffledRightItems.map(right => (
                            <option key={right} value={right} style={{ color: 'var(--content-foreground)' }}>
                              {right}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: 'var(--content-muted)' }} />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Show selected answer with radio buttons */}
                        {shuffledRightItems.map(right => {
                          const isSelected = userSelections[left] === right;
                          const isCorrectAnswer = correctMap[left] === right;

                          return (
                            <div
                              key={right}
                              className="flex items-center p-3 rounded-lg border transition-all"
                              style={{
                                backgroundColor: isSelected && isCorrectAnswer
                                  ? 'var(--secondary)'
                                  : isSelected && !isCorrectAnswer
                                  ? 'var(--content-error-bg)'
                                  : isCorrectAnswer && !isSelected
                                  ? 'var(--primary)'
                                  : 'var(--muted)',
                                borderColor: isSelected && isCorrectAnswer
                                  ? 'var(--secondary)'
                                  : isSelected && !isCorrectAnswer
                                  ? 'var(--content-error-border)'
                                  : isCorrectAnswer && !isSelected
                                  ? 'var(--primary)'
                                  : 'var(--content-border)',
                                color: isCorrectAnswer && !isSelected ? 'var(--primary-foreground)' : 'var(--content-foreground)'
                              }}
                            >
                              <div
                                className="w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center"
                                style={{
                                  borderColor: isSelected && isCorrectAnswer
                                    ? 'var(--secondary)'
                                    : isSelected && !isCorrectAnswer
                                    ? 'var(--destructive)'
                                    : isCorrectAnswer && !isSelected
                                    ? 'var(--secondary)'
                                    : 'var(--content-border)',
                                  backgroundColor: isSelected && isCorrectAnswer
                                    ? 'var(--secondary)'
                                    : isSelected && !isCorrectAnswer
                                    ? 'var(--destructive)'
                                    : isCorrectAnswer && !isSelected
                                    ? 'var(--secondary)'
                                    : 'transparent'
                                }}
                              >
                                {(isSelected || (isCorrectAnswer && !isSelected)) && (
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary-foreground)' }}></div>
                                )}
                              </div>
                              <span className="text-base">
                                {right}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        {isInteractive && !submitted && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selections).length !== leftItems.length || submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 hover:opacity-90"
              style={{
                backgroundColor: (Object.keys(selections).length !== leftItems.length || submitting) ? '#6b7280' : '#1f3a60',
                color: '#fafcff'
              }}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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

        {/* Results Summary for submitted answers */}
        {submitted && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold" style={{ color: '#070809' }}>
                  Results: {earnedPoints}/{totalPoints} points
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {leftItems.filter(left => userSelections[left] === correctMap[left]).length} out of {leftItems.length} correct
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isAllCorrect
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {isAllCorrect ? 'Perfect Score!' : 'Review Needed'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
