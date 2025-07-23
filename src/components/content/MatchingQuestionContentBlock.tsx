import { useState } from 'react';
import { MatchingQuestion } from '@/types/backend-api';

interface MatchingQuestionContentBlockProps {
    content: MatchingQuestion;
    onSubmitAnswer: (contentId: number, answer: string) => Promise<void>;
    isInteractive?: boolean;
}

export default function MatchingQuestionContentBlock({
    content,
    onSubmitAnswer,
    isInteractive = true,
}: MatchingQuestionContentBlockProps) {
    // Selections map left item -> selected right item
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // content.matches is array of tuples [left, right]
    const leftItems = content.matches.map(match => match.first);
    const rightItems = content.matches.map(match => match.second);

    const handleChange = (left: string, right: string) => {
        setSelections((prev) => ({ ...prev, [left]: right }));
    };

    const handleSubmit = async () => {
        if (!isInteractive) return;
        // Ensure all left items have been matched
        const allMatched = leftItems.every((l) => selections[l]?.trim());
        if (!allMatched) return;

        try {
            setSubmitting(true);
            setError(null);
            await onSubmitAnswer(content.id, JSON.stringify(selections));
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting matches:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit matches');
        } finally {
            setSubmitting(false);
        }
    };

    const correctMap: Record<string, string> = Object.fromEntries(
        content.matches.map(({ first, second }) => [first, second])
    );
    return (
        <div
            className="mb-4 p-5 rounded-lg border relative"
            style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderLeft: `4px solid var(--accent)`,
            }}
        >
            <div className="flex justify-between items-start mb-3">
                <h4 className="m-0 text-lg font-semibold text-[var(--card-foreground)]">
                    {content.title}
                </h4>
                <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                >
                    Matching Question
                </span>
            </div>

            {content.body && (
                <div className="mb-5 text-[var(--muted-foreground)] leading-relaxed">
                    {content.body.split('\n').map((p, i) => (
                        <p
                            key={i}
                            className={`mb-3 last:mb-0 ${i === 0 ? 'font-medium' : 'font-normal'}`}>
                            {p}
                        </p>

                    ))}
                </div>
            )}

            <div className="space-y-4">
                {leftItems.map((left) => {
                    const selected = selections[left] || '';
                    const isCorrect = submitted && selected === correctMap[left];
                    const isWrong = submitted && selected && selected !== correctMap[left];

                    return (
                        <label
                            key={left}
                            className="flex items-center justify-between p-3 border rounded cursor-pointer"
                            style={{
                                backgroundColor: submitted
                                    ? isCorrect
                                        ? 'var(--secondary)'
                                        : isWrong
                                            ? 'var(--destructive)'
                                            : 'var(--background)'
                                    : 'var(--background)',
                                borderColor: submitted
                                    ? isCorrect
                                        ? 'var(--secondary)'
                                        : isWrong
                                            ? 'var(--destructive)'
                                            : 'var(--border)'
                                    : 'var(--border)',
                                color: submitted
                                    ? isCorrect || isWrong
                                        ? 'var(--background)'
                                        : 'var(--text)'
                                    : 'var(--text)',
                            }}
                        >
                            <span className="font-medium text-[var(--card-foreground)] mr-4">
                                {left}
                            </span>
                            <select
                                value={selected}
                                disabled={!isInteractive || submitted}
                                onChange={(e) => handleChange(left, e.target.value)}
                                className="flex-1 rounded p-1 border"
                                style={{ borderColor: 'var(--border)' }}
                            >
                                <option value="" disabled hidden>
                                    Select match...
                                </option>
                                {rightItems.map((right) => (
                                    <option key={right} value={right}>
                                        {right}
                                    </option>
                                ))}
                            </select>
                            {submitted && selected && (
                                <span className="ml-3 text-lg">
                                    {isCorrect ? '✓' : '✗'}
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>

            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

            {isInteractive && !submitted && (
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !leftItems.every((l) => selections[l])}
                    className={`px-5 py-2 rounded font-medium text-sm transition-colors mt-4 ${submitting || !leftItems.every((l) => selections[l])
                        ? 'bg-[var(--muted-foreground)] cursor-not-allowed'
                        : 'bg-[var(--primary)] hover:bg-[var(--accent)] cursor-pointer'
                        } text-[var(--primary-foreground)]`}
                >
                    {submitting ? 'Submitting...' : 'Submit Matches'}
                </button>
            )}

            {submitted && (
                <div className="mt-4 text-sm text-[var(--muted-foreground)]">
                    <strong>Your matches:</strong>
                    <ul className="list-disc list-inside mt-1">
                        {Object.entries(selections).map(([l, r]) => (
                            <li key={l}>
                                {l} → {r}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
