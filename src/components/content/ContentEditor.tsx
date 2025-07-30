'use client';

import { useState, useEffect } from 'react';
import { ContentType } from '@/utils/api/backend-client';
import dynamic from 'next/dynamic';
import { ContentResponse, UpdateContentRequest } from '@/types/backend-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Plus, Trash2 } from 'lucide-react';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface ContentEditorProps {
  content: ContentResponse;
  onSave: (contentId: number, updateData: UpdateContentRequest) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function ContentEditor({
  content,
  onSave,
  onCancel,
  isSaving = false
}: ContentEditorProps) {
  // Form state
  const [title, setTitle] = useState(content.title);
  const [body, setBody] = useState(content.body || '');
  const [videoUrl, setVideoUrl] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [matches, setMatches] = useState<{ first: string; second: string }[]>([]);

  // Initialize type-specific fields
  useEffect(() => {
    if (content.type === 'Video' && 'videoUrl' in content) {
      setVideoUrl(content.videoUrl || '');
    } else if (content.type === 'MultipleChoiceQuestion' && 'options' in content) {
      setOptions([...content.options]);
      setCorrectAnswer(content.correctAnswer);
    } else if (content.type === 'MatchingQuestion' && 'matches' in content) {
      setMatches([...content.matches]);
    }
  }, [content]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    const updateData: UpdateContentRequest = {
      title: title.trim(),
      body: body.trim() || null,
      type: content.type as ContentType,
      moduleId: content.moduleId
    };

    // Add type-specific fields
    if (content.type === 'Video') {
      updateData.videoUrl = videoUrl.trim();
    } else if (content.type === 'MultipleChoiceQuestion') {
      updateData.options = options.filter(opt => opt.trim());
      updateData.correctAnswer = correctAnswer;
    } else if (content.type === 'MatchingQuestion') {
      updateData.matches = matches.filter(match => match.first.trim() && match.second.trim());
    }

    await onSave(content.id, updateData);
  };

  // Multiple choice question helpers
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer === options[index]) {
        setCorrectAnswer('');
      }
    }
  };

  // Matching question helpers
  const handleMatchChange = (index: number, field: 'first' | 'second', value: string) => {
    const newMatches = [...matches];
    newMatches[index] = { ...newMatches[index], [field]: value };
    setMatches(newMatches);
  };

  const addMatch = () => {
    setMatches([...matches, { first: '', second: '' }]);
  };

  const removeMatch = (index: number) => {
    if (matches.length > 1) {
      setMatches(matches.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-[var(--muted)]" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-1 rounded text-sm font-medium bg-[var(--accent)] text-[var(--accent-foreground)]">
          Editing {content.type}
        </span>
      </div>

      {/* Title field */}
      <div>
        <Label htmlFor={`edit-content-title-${content.id}`}>Title *</Label>
        <Input
          id={`edit-content-title-${content.id}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter content title..."
          className="mt-1"
        />
      </div>

      {/* Body field - different for different content types */}
      {content.type === 'Text' && (
        <div>
          <Label htmlFor={`edit-content-body-${content.id}`}>Content</Label>
          <div className="mt-1" data-color-mode="light">
            <MDEditor
              value={body}
              onChange={(value) => setBody(value || '')}
              preview="edit"
              hideToolbar={false}
              height={200}
            />
          </div>
        </div>
      )}

      {content.type === 'MultipleChoiceQuestion' && (
        <>
          <div>
            <Label htmlFor={`edit-content-question-${content.id}`}>Question</Label>
            <Textarea
              id={`edit-content-question-${content.id}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your question..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Options */}
          <div>
            <Label>Answer Options</Label>
            <div className="space-y-2 mt-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium min-w-[20px]">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                    className="text-[var(--destructive)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <Label>Correct Answer</Label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
              style={{ borderColor: 'var(--border)' }}
            >
              <option value="">Select correct answer...</option>
              {options.filter(opt => opt.trim()).map((option, index) => (
                <option key={index} value={option}>
                  {String.fromCharCode(65 + index)}. {option}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {content.type === 'MatchingQuestion' && (
        <>
          <div>
            <Label htmlFor={`edit-content-question-${content.id}`}>Question Description</Label>
            <Textarea
              id={`edit-content-question-${content.id}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter question description..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Matches */}
          <div>
            <Label>Match Pairs</Label>
            <div className="space-y-2 mt-2">
              {matches.map((match, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={match.first}
                    onChange={(e) => handleMatchChange(index, 'first', e.target.value)}
                    placeholder="Left side"
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">↔</span>
                  <Input
                    value={match.second}
                    onChange={(e) => handleMatchChange(index, 'second', e.target.value)}
                    placeholder="Right side"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMatch(index)}
                    disabled={matches.length <= 1}
                    className="text-[var(--destructive)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMatch}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Match Pair
              </Button>
            </div>
          </div>
        </>
      )}

      {content.type === 'Video' && (
        <>
          <div>
            <Label htmlFor={`edit-content-description-${content.id}`}>Video Description</Label>
            <Textarea
              id={`edit-content-description-${content.id}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter video description..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`edit-content-video-url-${content.id}`}>Video URL</Label>
            <Input
              id={`edit-content-video-url-${content.id}`}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter video URL..."
              className="mt-1"
            />
          </div>
        </>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={isSaving}
          className="border-[var(--border)] text-[var(--primary)]"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}