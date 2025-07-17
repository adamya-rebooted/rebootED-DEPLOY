'use client';

import React, { useState } from 'react';
import { useAIAssistant } from './AIAssistantProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { courseGenerationService, GenerateCourseRequest, GeneratedCourse } from '@/services/courseGeneration';
import { apiService } from '@/services/api';

interface CreatedCourse {
  id: number;
  title: string;
  body: string;
}

export const AIAssistantOverlay: React.FC = () => {
  const { isVisible, hideAssistant } = useAIAssistant();

  // AI Course generation state (existing)
  const [courseTitle, setCourseTitle] = useState('Introduction to Python Programming');
  const [courseDescription, setCourseDescription] = useState('A comprehensive beginner-friendly course that teaches Python programming fundamentals through hands-on exercises and practical projects.');
  const [courseTopics, setCourseTopics] = useState('Variables and data types, Control structures (if/else, loops), Functions and modules, File handling, Error handling, Object-oriented programming basics, Working with libraries');
  const [startingPoint, setStartingPoint] = useState('Basic computer literacy and familiarity with using a computer. No prior programming experience required.');
  const [finishLine, setFinishLine] = useState('Students will be able to write Python programs, solve basic programming problems, work with files and data, and understand fundamental programming concepts.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);

  // Direct course creation state (new)
  const [directCourseTitle, setDirectCourseTitle] = useState('');
  const [directCourseDescription, setDirectCourseDescription] = useState('');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [createdCourse, setCreatedCourse] = useState<CreatedCourse | null>(null);

  const handleGenerateCourse = async () => {
    if (!courseTitle.trim() || !courseDescription.trim() || !courseTopics.trim() || !startingPoint.trim() || !finishLine.trim()) {
      setError('Please fill in all fields for AI generation');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCourse(null);

    try {
      console.log('🚀 Generate button clicked!');

      // Test server health first
      console.log('🔍 Checking FastAPI server health...');
      const healthResponse = await fetch('http://localhost:8001/health');

      if (!healthResponse.ok) {
        throw new Error(`FastAPI server not responding: ${healthResponse.status}`);
      }

      const healthData = await healthResponse.json();
      console.log('✅ FastAPI server health check passed:', healthData);

      const request: GenerateCourseRequest = {
        course_title: courseTitle.trim(),
        course_topics: courseTopics.trim(),
        course_description: courseDescription.trim(),
        starting_point_description: startingPoint.trim(),
        finish_line_description: finishLine.trim(),
      };

      console.log('📤 Sending course generation request:', request);
      const generatedCourse = await courseGenerationService.generateCourse(request);
      console.log('📥 Received generated course:', generatedCourse);

      setGeneratedCourse(generatedCourse);
      console.log('✅ Course generation completed successfully!');

    } catch (error) {
      console.error('❌ Course generation failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!directCourseTitle.trim() || !directCourseDescription.trim()) {
      setError('Please fill in both course title and description');
      return;
    }

    setIsCreatingCourse(true);
    setError(null);
    setCreatedCourse(null);

    try {
      console.log('🚀 Creating course directly...');

      const courseData = await apiService.createCourse({
        title: directCourseTitle.trim(),
        body: directCourseDescription.trim()
      });

      console.log('✅ Course created successfully:', courseData);
      setCreatedCourse(courseData);

      // Clear the form
      setDirectCourseTitle('');
      setDirectCourseDescription('');

      // Dispatch custom event to notify other components (like TeacherDashboard) to refresh
      const courseCreatedEvent = new CustomEvent('courseCreated', {
        detail: {
          course: courseData,
          source: 'ai-assistant'
        }
      });
      window.dispatchEvent(courseCreatedEvent);
      console.log('📡 Dispatched courseCreated event');

    } catch (error) {
      console.error('❌ Course creation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to create course');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={hideAssistant}
      />
      
      {/* Floating Panel */}
      <div className="absolute top-20 right-6 w-96 max-h-[calc(100vh-6rem)] bg-background border rounded-lg shadow-xl pointer-events-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <h2 className="font-semibold">AI Assistant</h2>
          <Button variant="ghost" size="icon" onClick={hideAssistant}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
          
          {/* Direct Course Creation Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Create Course</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Title</label>
              <Input
                value={directCourseTitle}
                onChange={(e) => setDirectCourseTitle(e.target.value)}
                placeholder="Enter course title..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Course Description</label>
              <Textarea
                value={directCourseDescription}
                onChange={(e) => setDirectCourseDescription(e.target.value)}
                placeholder="Enter course description..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleCreateCourse}
              disabled={isCreatingCourse}
              className="w-full"
            >
              {isCreatingCourse ? 'Creating Course...' : 'Create Course'}
            </Button>

            {/* Success Message for Direct Creation */}
            {createdCourse && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800">
                  ✅ Course Created Successfully!
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  &ldquo;{createdCourse.title}&rdquo; has been created with ID: {createdCourse.id}
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-lg mb-4">AI Course Generator</h3>
          </div>

          {/* AI Generation Section (existing) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Title</label>
              <Input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g., Introduction to Python"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Brief description of the course..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Topics</label>
              <Textarea
                value={courseTopics}
                onChange={(e) => setCourseTopics(e.target.value)}
                placeholder="Main topics to cover..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prerequisites</label>
              <Textarea
                value={startingPoint}
                onChange={(e) => setStartingPoint(e.target.value)}
                placeholder="What students should know..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Learning Outcomes</label>
              <Textarea
                value={finishLine}
                onChange={(e) => setFinishLine(e.target.value)}
                placeholder="What students will achieve..."
                rows={2}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                ❌ {error}
              </div>
            )}

            <Button 
              onClick={handleGenerateCourse}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating Course...' : 'Generate Course with AI'}
            </Button>

            {/* Generated Course Display */}
            {generatedCourse && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">
                  ✅ Generated: {generatedCourse.course_title}
                </h3>
                <p className="text-sm text-green-700 mb-2">
                  {generatedCourse.course_description}
                </p>
                <div className="text-sm text-green-600">
                  <strong>Modules Generated: {generatedCourse.modules.length}</strong>
                </div>
                {generatedCourse.modules.map((module, index) => (
                  <div key={index} className="mt-2 p-2 bg-white border border-green-100 rounded">
                    <h4 className="text-sm font-medium text-green-800">
                      📚 {module.title}
                    </h4>
                    <p className="text-xs text-green-600 mt-1">
                      Content Blocks: {module.contentBlocks.length}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 