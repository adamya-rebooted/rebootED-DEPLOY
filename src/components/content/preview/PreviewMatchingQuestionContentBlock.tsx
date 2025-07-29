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
    <div className="bg-white min-h-full">
      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#070809' }}>
            {content.title}
          </h1>
          {/* <div className="px-4 py-2 rounded-full border-2 border-gray-300">
            <span className="text-lg font-medium" style={{ color: '#070809' }}>
              {totalPoints} points
            </span>
          </div> */}
        </div>

        {/* Question Body */}
        {content.body && (
          <div className="mb-8">
            <p className="text-lg leading-relaxed" style={{ color: '#070809' }}>
              {content.body}
            </p>
          </div>
        )}

        {/* Matching Interface */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Column - Prompts */}
          <div>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#070809' }}>
              Prompts
            </h3>
            <div className="space-y-4">
              {leftItems.map((left, index) => {
                const isCorrect = submitted && userSelections[left] === correctMap[left];
                const isWrong = submitted && userSelections[left] && userSelections[left] !== correctMap[left];

                return (
                  <div
                    key={left}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      submitted
                        ? isCorrect
                          ? 'border-green-200 bg-green-50'
                          : isWrong
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <span className="text-base" style={{ color: '#070809' }}>{left}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Answers */}
          <div>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#070809' }}>
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
                          className="w-full p-4 pr-10 rounded-lg border-2 border-purple-400 bg-white appearance-none text-base"
                          style={{ color: selections[left] ? '#070809' : '#9ca3af' }}
                        >
                          <option value="" disabled>Choose a match</option>
                          {shuffledRightItems.map(right => (
                            <option key={right} value={right} style={{ color: '#070809' }}>
                              {right}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
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
                              className={`flex items-center p-3 rounded-lg border transition-all ${
                                isSelected && isCorrectAnswer
                                  ? 'bg-green-100 border-green-300'
                                  : isSelected && !isCorrectAnswer
                                  ? 'bg-red-100 border-red-300'
                                  : isCorrectAnswer && !isSelected
                                  ? 'bg-gray-800 text-white border-gray-800'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                isSelected && isCorrectAnswer
                                  ? 'border-green-600 bg-green-600'
                                  : isSelected && !isCorrectAnswer
                                  ? 'border-red-600 bg-red-600'
                                  : isCorrectAnswer && !isSelected
                                  ? 'border-green-400 bg-green-400'
                                  : 'border-gray-300'
                              }`}>
                                {(isSelected || (isCorrectAnswer && !isSelected)) && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className={`text-base ${
                                isCorrectAnswer && !isSelected ? 'text-white' : 'text-gray-900'
                              }`}>
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
          <div className="pt-6 border-t border-gray-200">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Answer
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Summary for submitted answers */}
        {submitted && (
          <div className="pt-6 border-t border-gray-200">
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
