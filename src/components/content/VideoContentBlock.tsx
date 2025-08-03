'use client';

import { useState } from 'react';
import { Video } from '@/types/backend-api';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface VideoContentBlockProps {
    content: Video;
    onComplete: (contentId: number) => Promise<void>;
    onEdit?: (contentId: number) => void;
    isInteractive?: boolean;
}

export default function VideoContentBlock({
    content,
    onComplete,
    onEdit,
    isInteractive = true,
}: VideoContentBlockProps) {
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
        <div
            className="mb-4 p-5 rounded-lg border relative"
            style={{
                backgroundColor: content.isComplete ? 'var(--secondary)' : 'var(--card)',
                borderColor: 'var(--border)',
                borderLeft: `4px solid ${content.isComplete ? 'var(--secondary)' : 'var(--primary)'}`,
            }}
        >
            <div className="flex justify-between items-start mb-3">
                <h4
                    className="m-0 text-lg font-semibold"
                    style={{ color: content.isComplete ? 'var(--secondary-foreground)' : 'var(--card-foreground)' }}
                >
                    {content.title}
                </h4>
                <div className="flex items-center gap-2">
                    {content.isComplete && (
                        <span className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>
                            ✓ Complete
                        </span>
                    )}
                    <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                    >
                        Video
                    </span>
                    {isInteractive && onEdit && (
                        <Button
                            onClick={() => onEdit(content.id)}
                            variant="outline"
                            size="sm"
                            className="border-[var(--border)] text-[var(--primary)]"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Video iframe */}
            <div className="mb-4">
                {content.videoUrl ? (
                    <div className="aspect-w-16 aspect-h-9">
                        <iframe
                            src={content.videoUrl}
                            title={content.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full rounded"
                        />
                    </div>
                ) : (
                    <p className="text-[var(--muted-foreground)] italic">No video URL provided.</p>
                )}
            </div>

            {/* Description body */}
            {content.body && (
                <div className="mb-4 text-[var(--muted-foreground)] leading-relaxed">
                    {content.body.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-2 last:mb-0">
                            {line}
                        </p>
                    ))}
                </div>
            )}

            {error && (
                <div className="mb-3 p-2 rounded border text-sm" style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)', borderColor: 'var(--destructive)' }}>
                    {error}
                </div>
            )}

            {/* {isInteractive && !content.isComplete && (
                <button
                    onClick={handleComplete}
                    disabled={completing}
                    className={`px-4 py-2 rounded font-medium text-sm transition-colors ${completing ? 'bg-[var(--muted-foreground)] cursor-not-allowed' : 'bg-[var(--secondary)] hover:bg-[var(--accent)] cursor-pointer'
                        } text-[var(--secondary-foreground)]`}
                >
                    {completing ? 'Marking Complete...' : 'Mark as Complete'}
                </button>
            )} */}
        </div>
    );
}
