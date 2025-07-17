'use client';

import { useState } from 'react';
import { ContentType } from '@/utils/api/backend-client';
import dynamic from 'next/dynamic';
import { NewContentRequest, ContentResponse } from '@/types/backend-api';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, HelpCircle } from 'lucide-react';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface EnhancedContentCreatorProps {
  moduleId: number;
  onContentCreated: (newContent: ContentResponse) => void;
  onCancel: () => void;
}


export default function EnhancedContentCreator({
  moduleId,
  onContentCreated,
  onCancel
}: EnhancedContentCreatorProps) {
  // Basic content fields
  const [contentType, setContentType] = useState<ContentType>(ContentType.Text);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // Question-specific fields
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  // UI state
  const [currentStep, setCurrentStep] = useState<'type' | 'content'>('type');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.Text: return <FileText className="h-5 w-5" />;
      case ContentType.Question: return <HelpCircle className="h-5 w-5" />;
    }
  };

  const getContentTypeDescription = (type: ContentType) => {
    switch (type) {
      case ContentType.Text: return 'Rich text content with formatting, images, and links';
      case ContentType.Question: return 'Multiple choice questions with automatic grading';
    }
  };

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

  const validateContent = (): string | null => {
    if (!title.trim()) return 'Title is required';
    // Body is optional, so we don't validate it as required

    if (contentType === ContentType.Question) {
      const nonEmptyOptions = options.filter(opt => opt.trim());
      if (nonEmptyOptions.length < 2) return 'Questions must have at least 2 options';
      if (!correctAnswer.trim()) return 'Correct answer is required for questions';
      if (!options.includes(correctAnswer)) return 'Correct answer must be one of the provided options';
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateContent();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const contentData: NewContentRequest = {
        type: contentType,
        title: title.trim(),
        body: body.trim() || null,
        moduleId,
        ...(contentType === ContentType.Question && {
          options: options.filter(opt => opt.trim()),
          correctAnswer: correctAnswer.trim()
        })
      };

      const createdContent = await apiService.createContent(contentData);

      // Reset form
      setTitle('');
      setBody('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setContentType(ContentType.Text);
      setCurrentStep('type');

      onContentCreated(createdContent);
    } catch (err) {
      console.error('Error creating content:', err);
      setError(err instanceof Error ? err.message : 'Failed to create content');
    } finally {
      setCreating(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'type' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
          1
        </div>
        <div className="w-12 h-0.5 bg-gray-200"></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'content' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
          2
        </div>
      </div>
    </div>
  );

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Choose Content Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {([ContentType.Text, ContentType.Question] as ContentType[]).map((type) => (
          <Card
            key={type}
            className={`cursor-pointer transition-all hover:shadow-md ${contentType === type ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            onClick={() => setContentType(type)}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                {getContentTypeIcon(type)}
              </div>
              <h4 className="font-medium mb-2">{type}</h4>
              <p className="text-sm text-gray-600">{getContentTypeDescription(type)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={() => setCurrentStep('content')}>
          Next: Create Content
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getContentTypeIcon(contentType)}
          Add New {contentType} Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderStepIndicator()}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {currentStep === 'type' && renderTypeSelection()}

        {currentStep === 'content' && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${contentType.toLowerCase()} title...`}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="body">
                {contentType === ContentType.Question ? 'Question Text' : 'Content'}
              </Label>
              <div className="mt-1" data-color-mode="light">
                <MDEditor
                  value={body}
                  onChange={(val) => setBody(val || '')}
                  preview="edit"
                  height={200}
                />
              </div>
            </div>

            {contentType === ContentType.Question && (
              <div className="space-y-4">
                <Label>Answer Options</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      disabled={options.length <= 2}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addOption}>
                  Add Option
                </Button>

                <div>
                  <Label htmlFor="correctAnswer">Correct Answer</Label>
                  <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.filter(opt => opt.trim()).map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('type')}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel} disabled={creating}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Content'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
