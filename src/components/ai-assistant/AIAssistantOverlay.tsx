'use client';

import React, { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAIAssistant } from './AIAssistantProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { courseGenerationService } from '@/services/courseGeneration';
import { apiService } from '@/services/api';

interface CreatedCourse {
  id: number;
  title: string;
  body: string;
}

interface CreatedModule {
  id: number;
  title: string;
  body: string;
  courseId: number;
}

export const AIAssistantOverlay: React.FC = () => {
  const { isVisible, hideAssistant } = useAIAssistant();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if we're on the management dashboard
  const isOnManagementDashboard = pathname === '/management-dashboard';
  
  // Check if we're on the modify course page and extract course ID from query params
  const isOnModifyCoursePage = pathname.startsWith('/modify-course');
  const courseId = isOnModifyCoursePage ? searchParams.get('id') : null;
  const courseIdNumber = courseId ? parseInt(courseId) : null;

  // Prompt-based course creation state
  const [coursePrompt, setCoursePrompt] = useState('');
  const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCourse, setCreatedCourse] = useState<CreatedCourse | null>(null);

  // Prompt-based module creation state
  const [modulePrompt, setModulePrompt] = useState('');
  const [isGeneratingModule, setIsGeneratingModule] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [createdModule, setCreatedModule] = useState<CreatedModule | null>(null);

  const handleCreateCourse = async () => {
    if (!coursePrompt.trim()) {
      setError('Please enter a course prompt');
      return;
    }

    setIsGeneratingFromPrompt(true);
    setError(null);
    setCreatedCourse(null);

    try {
      console.log('🚀 Generating course from prompt...');

      // Step 1: Call prompt-to-course to generate title and description
      const promptResponse = await courseGenerationService.promptToCourse({
        input_prompt: coursePrompt.trim()
      });

      console.log('✅ Generated title and description:', promptResponse);

      // Step 2: Create the course using the generated title and description
      const courseData = await apiService.createCourse({
        title: promptResponse.course_title,
        body: promptResponse.course_description
      });

      console.log('✅ Course created successfully:', courseData);
      setCreatedCourse(courseData);

      // Clear the form
      setCoursePrompt('');

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
      setIsGeneratingFromPrompt(false);
    }
  };

  const handleCreateModule = async () => {
    if (!modulePrompt.trim()) {
      setModuleError('Please enter a module prompt');
      return;
    }

    if (!courseIdNumber) {
      setModuleError('Course ID not found');
      return;
    }

    setIsGeneratingModule(true);
    setModuleError(null);
    setCreatedModule(null);

    try {
      console.log('🚀 Generating module from prompt...');

      // Step 1: Call prompt-to-module to generate title and description
      const promptResponse = await courseGenerationService.promptToModule({
        input_prompt: modulePrompt.trim()
      });

      console.log('✅ Generated module title and description:', promptResponse);

      // Step 2: Create the module using the generated title and description
      const moduleData = await apiService.createModule({
        title: promptResponse.module_title,
        body: promptResponse.module_description,
        courseId: courseIdNumber
      });

      console.log('✅ Module created successfully:', moduleData);
      setCreatedModule(moduleData);

      // Clear the form
      setModulePrompt('');

      // Dispatch custom event to notify other components to refresh
      const moduleCreatedEvent = new CustomEvent('moduleCreated', {
        detail: {
          module: moduleData,
          courseId: courseIdNumber,
          source: 'ai-assistant'
        }
      });
      window.dispatchEvent(moduleCreatedEvent);
      console.log('📡 Dispatched moduleCreated event');

    } catch (error) {
      console.error('❌ Module creation failed:', error);
      setModuleError(error instanceof Error ? error.message : 'Failed to create module');
    } finally {
      setIsGeneratingModule(false);
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
          
          {/* Conditionally render course creation section only on management dashboard */}
          {isOnManagementDashboard && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Create Course from Prompt</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Idea</label>
                <Textarea
                  value={coursePrompt}
                  onChange={(e) => setCoursePrompt(e.target.value)}
                  placeholder="Describe the course you want to create... (e.g., 'I want to teach people how to make websites from scratch')"
                  rows={3}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  ❌ {error}
                </div>
              )}

              <Button 
                onClick={handleCreateCourse}
                disabled={isGeneratingFromPrompt}
                className="w-full"
              >
                {isGeneratingFromPrompt ? 'Creating Course...' : 'Create Course from Prompt'}
              </Button>

              {/* Success Message */}
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
          )}

          {/* Conditionally render module creation section only on modify course page */}
          {isOnModifyCoursePage && courseIdNumber && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Create Module from Prompt</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Module Idea</label>
                <Textarea
                  value={modulePrompt}
                  onChange={(e) => setModulePrompt(e.target.value)}
                  placeholder="Describe the module you want to create... (e.g., 'I want to teach HTML basics and structure')"
                  rows={3}
                />
              </div>

              {moduleError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  ❌ {moduleError}
                </div>
              )}

              <Button 
                onClick={handleCreateModule}
                disabled={isGeneratingModule}
                className="w-full"
              >
                {isGeneratingModule ? 'Creating Module...' : 'Create Module from Prompt'}
              </Button>

              {/* Success Message */}
              {createdModule && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">
                    ✅ Module Created Successfully!
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    &ldquo;{createdModule.title}&rdquo; has been added to course ID: {courseId}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Fallback content for other pages */}
          {!isOnManagementDashboard && !isOnModifyCoursePage && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Navigate to the Management Dashboard to create courses, or to a Modify Course page to create modules.
              </p>
              <div className="text-xs text-muted-foreground">
                Current page: {pathname}
              </div>
            </div>
          )}

          {/* Show error if on modify course page but no course ID */}
          {isOnModifyCoursePage && !courseId && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">AI Assistant</h3>
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                ❌ Unable to determine course ID from URL
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}; 