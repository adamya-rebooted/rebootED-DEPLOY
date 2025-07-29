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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all duration-200 hover:shadow-md">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-gray-100" style={{
        background: hasAnswered
          ? isCorrect
            ? 'linear-gradient(to right, #f0fdf4, #dcfce7)'
            : 'linear-gradient(to right, #fef2f2, #fee2e2)'
          : 'linear-gradient(to right, #fafcff, #f0f4ff)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{
              backgroundColor: hasAnswered
                ? isCorrect
                  ? '#1e7656'
                  : '#dc2626'
                : '#1f3a60',
              color: '#fafcff'
            }}>
              {hasAnswered ? (
                isCorrect ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )
              ) : (
                <HelpCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: '#070809' }}>
                {content.title}
              </h3>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#1f3a60' }}>
                <HelpCircle className="h-4 w-4" />
                <span>Multiple Choice Question</span>
              </div>
            </div>
          </div>

          {hasAnswered && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{
              backgroundColor: isCorrect ? '#1e7656' : '#dc2626',
              color: '#fafcff'
            }}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Correct
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Incorrect
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-6">
        {/* Question Body */}
        {content.body && (
          <div className="mb-6">
            <div className="prose prose-gray max-w-none">
              {content.body.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0 leading-relaxed" style={{ color: '#070809' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        {content.options && content.options.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: '#070809' }}>
              Choose your answer:
            </h4>
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
                        ? '#1e7656'
                        : isUserAnswer && !isCorrectOption
                        ? '#dc2626'
                        : '#d1d5db'
                      : isSelectedOption
                      ? '#1f3a60'
                      : '#d1d5db',
                    backgroundColor: hasAnswered
                      ? isCorrectOption
                        ? '#f0fdf4'
                        : isUserAnswer && !isCorrectOption
                        ? '#fef2f2'
                        : '#fafcff'
                      : isSelectedOption
                      ? '#f0f4ff'
                      : '#fafcff'
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
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className={`font-semibold text-sm min-w-[24px] h-6 w-6 rounded-full flex items-center justify-center ${
                      hasAnswered && isCorrectOption
                        ? 'bg-green-600 text-white'
                        : hasAnswered && isUserAnswer && !isCorrectOption
                        ? 'bg-red-600 text-white'
                        : isSelectedOption
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {optionLetter}
                    </span>
                    <span className="flex-1 text-gray-900">{option}</span>
                    {hasAnswered && isCorrectOption && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {hasAnswered && isUserAnswer && !isCorrectOption && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* Feedback Section */}
        {hasAnswered && (
          <div className={`p-4 rounded-lg border ${
            isCorrect 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Your answer:</span>
                <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                  {content.userAnswer}
                </span>
              </div>
              {!isCorrect && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Correct answer:</span>
                  <span className="text-green-700">{content.correctAnswer}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        {isInteractive && !hasAnswered && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer || submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 hover:opacity-90"
              style={{
                backgroundColor: (!selectedAnswer || submitting) ? '#6b7280' : '#1f3a60',
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
                  <Send className="h-4 w-4" />
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
