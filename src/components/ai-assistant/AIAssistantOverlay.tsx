'use client';

import React, { useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAIAssistant } from './AIAssistantProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { courseGenerationService } from '@/services/courseGeneration';
import { apiService } from '@/services/api';
import { ContentType } from '@/utils/api/backend-client';

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
  const { isVisible, hideAssistant, selectedModuleId } = useAIAssistant();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Prompt-based text content creation state
  const [textContentPrompt, setTextContentPrompt] = useState('');
  const [isGeneratingTextContent, setIsGeneratingTextContent] = useState(false);
  const [textContentError, setTextContentError] = useState<string | null>(null);
  const [createdTextContent, setCreatedTextContent] = useState<Record<string, unknown> | null>(null);

  // Prompt-based multiple choice question creation state
  const [mcqPrompt, setMcqPrompt] = useState('');
  const [isGeneratingMCQ, setIsGeneratingMCQ] = useState(false);
  const [mcqError, setMcqError] = useState<string | null>(null);
  const [createdMCQ, setCreatedMCQ] = useState<Record<string, unknown> | null>(null);

  // Prompt-based course modules generation state
  const [courseModulesPrompt, setCourseModulesPrompt] = useState('');
  const [isGeneratingCourseModules, setIsGeneratingCourseModules] = useState(false);
  const [courseModulesError, setCourseModulesError] = useState<string | null>(null);
  const [courseModulesProgress, setCourseModulesProgress] = useState<string>('');
  const [generatedModulesCount, setGeneratedModulesCount] = useState(0);
  const [generatedContentCount, setGeneratedContentCount] = useState(0);

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

      // Redirect to modify-course page
      router.push(`/modify-course?id=${courseData.id}`);

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

  const handleCreateTextContent = async () => {
    if (!textContentPrompt.trim()) {
      setTextContentError('Please enter a text content prompt');
      return;
    }

    if (!selectedModuleId) {
      setTextContentError('No module selected');
      return;
    }

    setIsGeneratingTextContent(true);
    setTextContentError(null);
    setCreatedTextContent(null);

    try {
      console.log('🚀 Generating text content from prompt...');

      // Step 1: Call FastAPI to generate text content
      const generatedContent = await courseGenerationService.promptToTextContent({
        input_prompt: textContentPrompt.trim()
      });

      console.log('✅ Generated text content:', generatedContent);

      // Step 2: Create the text content using Spring Boot API
      const textContentData = await apiService.createContent({
        type: ContentType.Text,
        title: generatedContent.text_title,
        body: generatedContent.text_body,
        moduleId: selectedModuleId
      });

      console.log('✅ Text content created successfully:', textContentData);
      setCreatedTextContent(textContentData);

      // Clear the form
      setTextContentPrompt('');

      // Dispatch custom event to notify other components to refresh
      const contentCreatedEvent = new CustomEvent('contentCreated', {
        detail: {
          content: textContentData,
          moduleId: selectedModuleId,
          source: 'ai-assistant'
        }
      });
      window.dispatchEvent(contentCreatedEvent);
      console.log('📡 Dispatched contentCreated event');

    } catch (error) {
      console.error('❌ Text content creation failed:', error);
      setTextContentError(error instanceof Error ? error.message : 'Failed to create text content');
    } finally {
      setIsGeneratingTextContent(false);
    }
  };

  const handleGenerateCourseModules = async () => {
    if (!courseModulesPrompt.trim()) {
      setCourseModulesError('Please enter a course structure prompt');
      return;
    }

    setIsGeneratingCourseModules(true);
    setCourseModulesError(null);
    setCourseModulesProgress('');
    setGeneratedModulesCount(0);
    setGeneratedContentCount(0);

    let newCourseId: number | null = null;

    try {
      console.log('🚀 Creating course and generating modules from prompt...');
      setCourseModulesProgress('Creating course...');

      // Step 1: Call prompt-to-course to generate course title and description
      const courseData = await courseGenerationService.promptToCourse({
        input_prompt: courseModulesPrompt.trim()
      });

      console.log('✅ Generated course title and description:', courseData);

      // Step 2: Create the course using the generated title and description
      const createdCourse = await apiService.createCourse({
        title: courseData.course_title,
        body: courseData.course_description
      });

      console.log('✅ Course created successfully:', createdCourse);
      newCourseId = createdCourse.id;

      // Dispatch course created event immediately to update the dashboard
      const courseCreatedEvent = new CustomEvent('courseCreated', {
        detail: {
          course: createdCourse,
          source: 'ai-assistant-full-structure'
        }
      });
      window.dispatchEvent(courseCreatedEvent);
      console.log('📡 Dispatched courseCreated event immediately after course creation');

      // Redirect to modify-course page immediately after course creation
      router.push(`/modify-course?id=${createdCourse.id}`);

      setCourseModulesProgress('Analyzing course structure...');

      // Step 3: Call prompt-to-course-modules to get module structure
      const moduleStructure = await courseGenerationService.promptToCourseModules({
        input_prompt: courseModulesPrompt.trim()
      });

      console.log('✅ Generated module structure:', moduleStructure);
      setCourseModulesProgress(`Found ${moduleStructure.modules.length} modules. Creating modules...`);

      let createdModulesCount = 0;
      let createdContentCount = 0;
      const createdModuleIds: number[] = [];

      // Helper function to generate MCQ for a skill
      const generateMCQForSkill = async (skill: string, moduleId: number) => {
        const mcqContent = await courseGenerationService.promptToMultipleChoiceQuestion({
          input_prompt: skill
        });
        
        return await apiService.createContent({
          type: ContentType.MultipleChoiceQuestion,
          title: mcqContent.question_title,
          body: mcqContent.question_body,
          options: mcqContent.question_options,
          correctAnswer: mcqContent.correct_answer,
          moduleId: moduleId
        });
      };

      // Step 4: Create each module and its content, dispatching events as they are created
      for (const moduleData of moduleStructure.modules) {
        try {
          setCourseModulesProgress(`Creating module: "${moduleData.module_name}" (${createdModulesCount + 1}/${moduleStructure.modules.length})`);

          // Generate module title and description using existing logic
          const promptResponse = await courseGenerationService.promptToModule({
            input_prompt: moduleData.module_name
          });

          // Create the module
          const createdModule = await apiService.createModule({
            title: promptResponse.module_title,
            body: promptResponse.module_description,
            courseId: newCourseId
          });

          console.log(`✅ Module created: "${createdModule.title}" with ID: ${createdModule.id}`);
          createdModulesCount++;
          createdModuleIds.push(createdModule.id);
          setGeneratedModulesCount(createdModulesCount);

          // Dispatch module created event immediately
          window.dispatchEvent(new CustomEvent('moduleCreated', {
            detail: {
              module: createdModule,
              courseId: newCourseId,
              source: 'ai-assistant-bulk'
            }
          }));

          // Step 5: Create text content and MCQs for each skill in this module
          for (let i = 0; i < moduleData.skills.length; i++) {
            const skill = moduleData.skills[i];
            try {
              setCourseModulesProgress(`Creating text content: "${skill}" (${i + 1}/${moduleData.skills.length}) in module "${moduleData.module_name}"`);

              // Generate text content for this skill
              const generatedContent = await courseGenerationService.promptToTextContent({
                input_prompt: skill
              });

              // Create the text content
              const textContentData = await apiService.createContent({
                type: ContentType.Text,
                title: generatedContent.text_title,
                body: generatedContent.text_body,
                moduleId: createdModule.id
              });

              console.log(`✅ Text content created: "${textContentData.title}"`);
              createdContentCount++;
              setGeneratedContentCount(createdContentCount);

              // Dispatch content created event immediately
              window.dispatchEvent(new CustomEvent('contentCreated', {
                detail: {
                  content: textContentData,
                  moduleId: createdModule.id,
                  source: 'ai-assistant-bulk'
                }
              }));

              // Generate MCQ for last 2 skills in each module
              if (i >= moduleData.skills.length - 2) {
                try {
                  const mcqIndex = i - (moduleData.skills.length - 2) + 1;
                  setCourseModulesProgress(`Creating MCQ: "${skill}" (${mcqIndex}/2) in module "${moduleData.module_name}"`);

                  const mcqData = await generateMCQForSkill(skill, createdModule.id);

                  console.log(`✅ MCQ created: "${mcqData.title}"`);
                  createdContentCount++;
                  setGeneratedContentCount(createdContentCount);

                  // Dispatch content created event for MCQ
                  window.dispatchEvent(new CustomEvent('contentCreated', {
                    detail: {
                      content: mcqData,
                      moduleId: createdModule.id,
                      source: 'ai-assistant-bulk'
                    }
                  }));

                } catch (error) {
                  console.error(`❌ Failed to create MCQ for skill "${skill}":`, error);
                  // Continue with next skill instead of failing completely
                }
              }

            } catch (error) {
              console.error(`❌ Failed to create content for skill "${skill}":`, error);
              // Continue with next skill instead of failing completely
            }
          }

        } catch (error) {
          console.error(`❌ Failed to create module "${moduleData.module_name}":`, error);
          // Continue with next module instead of failing completely
        }
      }

      setCourseModulesProgress(`✅ Completed! Generated course "${createdCourse.title}" with ${createdModulesCount} modules and ${createdContentCount} content pieces`);

      // Clear the form
      setCourseModulesPrompt('');

      console.log('📡 Dispatched all creation events in real-time.');

    } catch (error) {
      console.error('❌ Course and modules generation failed:', error);
      setCourseModulesError(error instanceof Error ? error.message : 'Failed to generate course and modules');
      setCourseModulesProgress('');
    } finally {
      setIsGeneratingCourseModules(false);
    }
  };

  const handleCreateMultipleChoiceQuestion = async () => {
    if (!mcqPrompt.trim()) {
      setMcqError('Please enter a multiple choice question prompt');
      return;
    }

    if (!selectedModuleId) {
      setMcqError('No module selected');
      return;
    }

    setIsGeneratingMCQ(true);
    setMcqError(null);
    setCreatedMCQ(null);

    try {
      console.log('🚀 Generating multiple choice question from prompt...');

      // Step 1: Call FastAPI to generate multiple choice question
      const generatedContent = await courseGenerationService.promptToMultipleChoiceQuestion({
        input_prompt: mcqPrompt.trim()
      });

      console.log('✅ Generated multiple choice question:', generatedContent);

      // Step 2: Create the multiple choice question using Spring Boot API
      const mcqData = await apiService.createContent({
        type: ContentType.MultipleChoiceQuestion,
        title: generatedContent.question_title,
        body: generatedContent.question_body,
        options: generatedContent.question_options,
        correctAnswer: generatedContent.correct_answer,
        moduleId: selectedModuleId
      });

      console.log('✅ Multiple choice question created successfully:', mcqData);
      setCreatedMCQ(mcqData);

      // Clear the form
      setMcqPrompt('');

      // Dispatch custom event to notify other components to refresh
      const contentCreatedEvent = new CustomEvent('contentCreated', {
        detail: {
          content: mcqData,
          moduleId: selectedModuleId,
          source: 'ai-assistant'
        }
      });
      window.dispatchEvent(contentCreatedEvent);
      console.log('📡 Dispatched contentCreated event');

    } catch (error) {
      console.error('❌ Multiple choice question creation failed:', error);
      setMcqError(error instanceof Error ? error.message : 'Failed to create multiple choice question');
    } finally {
      setIsGeneratingMCQ(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Floating Panel */}
      <div data-ai-assistant className="absolute top-20 right-6 w-96 max-h-[calc(100vh-6rem)] bg-background border rounded-lg shadow-xl pointer-events-auto overflow-hidden">
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

          {/* Conditionally render course modules generation section on management dashboard */}
          {isOnManagementDashboard && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="font-medium text-lg">Generate Full Course Structure from Prompt</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Structure Idea</label>
                <Textarea
                  value={courseModulesPrompt}
                  onChange={(e) => setCourseModulesPrompt(e.target.value)}
                  placeholder="Describe the complete course structure you want to create... (e.g., 'I want to create a course on machine learning for beginners with no programming experience')"
                  rows={3}
                />
              </div>

              {courseModulesError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  ❌ {courseModulesError}
                </div>
              )}

              {courseModulesProgress && (
                <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                  🔄 {courseModulesProgress}
                </div>
              )}

              <Button 
                onClick={handleGenerateCourseModules}
                disabled={isGeneratingCourseModules}
                className="w-full"
              >
                {isGeneratingCourseModules ? 'Generating Course Structure...' : 'Generate Full Course Structure'}
              </Button>

              {/* Success Message */}
              {generatedModulesCount > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">
                    ✅ Course and Structure Generated Successfully!
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Created course with {generatedModulesCount} modules and {generatedContentCount} content pieces. Redirecting to course editor...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Conditionally render module creation section on modify course page */}
          {isOnModifyCoursePage && courseIdNumber && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="font-medium text-lg">Create Single Module from Prompt</h3>
              
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

          {/* Conditionally render content creation section when a module is selected */}
          {isOnModifyCoursePage && courseIdNumber && selectedModuleId && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="font-medium text-lg">Create Text Content from Prompt</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Content Idea</label>
                <Textarea
                  value={textContentPrompt}
                  onChange={(e) => setTextContentPrompt(e.target.value)}
                  placeholder="Describe the text content you want to create... (e.g., 'Create a text lesson explaining CSS selectors with examples')"
                  rows={3}
                />
              </div>

              {textContentError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  ❌ {textContentError}
                </div>
              )}

              <Button 
                onClick={handleCreateTextContent}
                disabled={isGeneratingTextContent}
                className="w-full"
              >
                {isGeneratingTextContent ? 'Creating Text Content...' : 'Create Text Content from Prompt'}
              </Button>

              {/* Success Message */}
              {createdTextContent && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">
                    ✅ Text Content Created Successfully!
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    &ldquo;{createdTextContent.title}&rdquo; has been added to module ID: {selectedModuleId}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Conditionally render multiple choice question creation section when a module is selected */}
          {isOnModifyCoursePage && courseIdNumber && selectedModuleId && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="font-medium text-lg">Create Multiple Choice Question from Prompt</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Multiple Choice Question Idea</label>
                <Textarea
                  value={mcqPrompt}
                  onChange={(e) => setMcqPrompt(e.target.value)}
                  placeholder="Describe the multiple choice question you want to create... (e.g., 'Create a question about Python data types with 4 options')"
                  rows={3}
                />
              </div>

              {mcqError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  ❌ {mcqError}
                </div>
              )}

              <Button 
                onClick={handleCreateMultipleChoiceQuestion}
                disabled={isGeneratingMCQ}
                className="w-full"
              >
                {isGeneratingMCQ ? 'Creating Multiple Choice Question...' : 'Create Multiple Choice Question from Prompt'}
              </Button>

              {/* Success Message */}
              {createdMCQ && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">
                    ✅ Multiple Choice Question Created Successfully!
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    &ldquo;{createdMCQ.title}&rdquo; has been added to module ID: {selectedModuleId}
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