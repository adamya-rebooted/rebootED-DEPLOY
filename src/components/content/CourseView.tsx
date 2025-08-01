'use client'

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  User,
  Clock,
  CheckCircle,
  Play,
  HelpCircle
} from "lucide-react";
import { Course, Module, ContentResponse, isMultipleChoiceQuestionContent, isMatchingQuestionContent, isVideoContent } from "@/types/backend-api";
import { apiService } from '@/services/api';
import TextContentBlock from './TextContentBlock';
import MultipleChoiceQuestionContentBlock from './MultipleChoiceQuestionContentBlock';
import MatchingQuestionContentBlock from './MatchingQuestionContentBlock';
import VideoContentBlock from './VideoContentBlock';
// Preview content blocks for professional LMS experience
import PreviewTextContentBlock from './preview/PreviewTextContentBlock';
import PreviewMultipleChoiceQuestionContentBlock from './preview/PreviewMultipleChoiceQuestionContentBlock';
import PreviewMatchingQuestionContentBlock from './preview/PreviewMatchingQuestionContentBlock';
import PreviewVideoContentBlock from './preview/PreviewVideoContentBlock';

interface CourseViewProps {
  course: Course;
  modules: Module[];
  isLoading?: boolean;
  error?: string | null;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showStudentView?: boolean;
  onContentUpdate?: () => void;
  usePreviewBlocks?: boolean; // New prop to control which content blocks to use
  isPreviewMode?: boolean; // New prop to control interactivity - when true, disables all interactions
}

const CourseView: React.FC<CourseViewProps> = ({
  course,
  modules,
  showBackButton = true,
  onBackClick,
  showStudentView = true,
  onContentUpdate,
  usePreviewBlocks = false,
  isPreviewMode = false
}) => {
  // State for sidebar and content
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [selectedContent, setSelectedContent] = useState<ContentResponse | null>(null);
  const [moduleContents, setModuleContents] = useState<{[key: number]: ContentResponse[]}>({});
  const [loadingContent, setLoadingContent] = useState<{[key: number]: boolean}>({});

  // Load content for a module when it's expanded
  const loadModuleContent = useCallback(async (moduleId: number) => {
    if (moduleContents[moduleId] || loadingContent[moduleId]) return;

    try {
      setLoadingContent(prev => ({ ...prev, [moduleId]: true }));
      const content = await apiService.getContentByModuleId(moduleId);
      setModuleContents(prev => ({ ...prev, [moduleId]: content }));
    } catch (error) {
      console.error('Error loading module content:', error);
    } finally {
      setLoadingContent(prev => ({ ...prev, [moduleId]: false }));
    }
  }, [moduleContents, loadingContent]);

  // Load content count for all modules on initial load
  useEffect(() => {
    if (modules.length > 0) {
      modules.forEach(module => {
        if (!moduleContents[module.id] && !loadingContent[module.id]) {
          loadModuleContent(module.id);
        }
      });
    }
  }, [modules, loadModuleContent]);

  // Toggle module expansion
  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
        // Content should already be loaded from initial load
      }
      return newSet;
    });
  };

  // Handle content selection
  const handleContentSelect = (content: ContentResponse) => {
    setSelectedContent(content);
  };

  // Handle content completion/update
  const handleContentComplete = async (contentId: number) => {
    try {
      const updatedContent = await apiService.markContentComplete(contentId);
      
      // Update the content in moduleContents
      setModuleContents(prev => {
        const newContents = { ...prev };
        Object.keys(newContents).forEach(moduleId => {
          newContents[parseInt(moduleId)] = newContents[parseInt(moduleId)].map(item =>
            item.id === contentId ? updatedContent : item
          );
        });
        return newContents;
      });

      // Update selected content if it's the same
      if (selectedContent?.id === contentId) {
        setSelectedContent(updatedContent);
      }

      if (onContentUpdate) {
        onContentUpdate();
      }
    } catch (error) {
      console.error('Error marking content complete:', error);
      throw error;
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async (contentId: number, answer: string) => {
    try {
      const updatedContent = await apiService.submitAnswer(contentId, answer);
      
      // Update the content in moduleContents
      setModuleContents(prev => {
        const newContents = { ...prev };
        Object.keys(newContents).forEach(moduleId => {
          newContents[parseInt(moduleId)] = newContents[parseInt(moduleId)].map(item =>
            item.id === contentId ? updatedContent : item
          );
        });
        return newContents;
      });

      // Update selected content if it's the same
      if (selectedContent?.id === contentId) {
        setSelectedContent(updatedContent);
      }

      if (onContentUpdate) {
        onContentUpdate();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  // Get icon for content type
  const getContentIcon = (content: ContentResponse) => {
    if (isVideoContent(content)) {
      return <Play className="h-4 w-4" />;
    } else if (isMultipleChoiceQuestionContent(content) || isMatchingQuestionContent(content)) {
      return <HelpCircle className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  // Get content type label
  const getContentTypeLabel = (content: ContentResponse) => {
    if (isVideoContent(content)) return 'Video';
    if (isMultipleChoiceQuestionContent(content) || isMatchingQuestionContent(content)) return 'Question';
    return 'Text';
  };

  // Check if content is completed
  const isContentCompleted = (content: ContentResponse) => {
    if (isMultipleChoiceQuestionContent(content)) {
      return content.userAnswer !== undefined && content.userAnswer !== null;
    }
    return content.isComplete === true;
  };

  // Render selected content
  const renderSelectedContent = () => {
    if (!selectedContent) {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <BookOpen className="h-16 w-16 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-[var(--primary)]">Select Content to Begin</h3>
            <p className="text-[var(--muted-foreground)]">
              Choose a content item from the sidebar to start learning
            </p>
          </div>
        </div>
      );
    }

    if (isMultipleChoiceQuestionContent(selectedContent)) {
      return usePreviewBlocks ? (
        <PreviewMultipleChoiceQuestionContentBlock
          content={selectedContent}
          onSubmitAnswer={handleSubmitAnswer}
          isInteractive={!isPreviewMode}
        />
      ) : (
        <MultipleChoiceQuestionContentBlock
          content={selectedContent}
          onSubmitAnswer={handleSubmitAnswer}
          isInteractive={!isPreviewMode}
        />
      );
    } else if (isMatchingQuestionContent(selectedContent)) {
      return usePreviewBlocks ? (
        <PreviewMatchingQuestionContentBlock
          content={selectedContent}
          onSubmitAnswer={handleSubmitAnswer}
          isInteractive={!isPreviewMode}
        />
      ) : (
        <MatchingQuestionContentBlock
          content={selectedContent}
          onSubmitAnswer={handleSubmitAnswer}
          isInteractive={!isPreviewMode}
        />
      );
    } else if (isVideoContent(selectedContent)) {
      return usePreviewBlocks ? (
        <PreviewVideoContentBlock
          content={selectedContent}
          onComplete={handleContentComplete}
          isInteractive={!isPreviewMode}
        />
      ) : (
        <VideoContentBlock
          content={selectedContent}
          onComplete={handleContentComplete}
          isInteractive={!isPreviewMode}
        />
      );
    } else {
      return usePreviewBlocks ? (
        <PreviewTextContentBlock
          content={selectedContent}
          onComplete={handleContentComplete}
          isInteractive={!isPreviewMode}
        />
      ) : (
        <TextContentBlock
          content={selectedContent}
          onComplete={handleContentComplete}
          isInteractive={!isPreviewMode}
        />
      );
    }
  };

  return (
    <div className="flex h-full bg-[var(--background)]">
      {/* Sidebar */}
      <div className="w-80 border-r border-[var(--border)] bg-[var(--card)] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)]">
          {showBackButton && onBackClick && (
            <Button
              onClick={onBackClick}
              variant="ghost"
              size="sm"
              className="mb-3 text-[var(--primary)]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          )}
          <h2 className="font-bold text-lg text-[var(--primary)] mb-1">{course?.title}</h2>
          {showStudentView && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <User className="h-4 w-4" />
              <span>Student</span>
            </div>
          )}
        </div>

        {/* Modules List */}
        <div className="p-4">
          {modules.length > 0 ? (
            <div className="space-y-0">
              {modules.map((module, index) => (
                <div key={module.id}>
                  {/* Module Header */}
                  <div
                    className="p-3 cursor-pointer hover:bg-[var(--muted)] transition-colors flex items-center justify-between"
                    onClick={() => toggleModuleExpansion(module.id)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm text-[var(--primary)] underline decoration-1 underline-offset-2">
                        Module {index + 1}: {module.title}
                      </h3>
                      {module.progress === 100 && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {moduleContents[module.id]?.length > 0 && !expandedModules.has(module.id) && (
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {moduleContents[module.id].length}
                      </span>
                    )}
                  </div>

                  {/* Module Content */}
                  {expandedModules.has(module.id) && (
                    <div className="ml-6 space-y-1">
                      {loadingContent[module.id] ? (
                        <div className="p-3 text-center text-sm text-[var(--muted-foreground)]">
                          Loading content...
                        </div>
                      ) : moduleContents[module.id]?.length > 0 ? (
                        <>
                          {/* Group content by type */}
                          {moduleContents[module.id].some(content => getContentTypeLabel(content) === 'Text') && (
                            <div className="py-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-[var(--card-foreground)]">
                                    Module {index + 1}: Learning Materials
                                  </span>
                                  {moduleContents[module.id].filter(content => getContentTypeLabel(content) === 'Text').every(content => isContentCompleted(content)) && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {moduleContents[module.id].some(content => getContentTypeLabel(content) === 'Question') && (
                            <div className="py-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-[var(--card-foreground)]">
                                    Quizzes
                                  </span>
                                  {moduleContents[module.id].filter(content => getContentTypeLabel(content) === 'Question').every(content => isContentCompleted(content)) && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {moduleContents[module.id].some(content => getContentTypeLabel(content) === 'Video') && (
                            <div className="py-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-[var(--card-foreground)]">
                                    Videos
                                  </span>
                                  {moduleContents[module.id].filter(content => getContentTypeLabel(content) === 'Video').every(content => isContentCompleted(content)) && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Individual content items for detailed view */}
                          <div className="ml-4 space-y-1">
                            {moduleContents[module.id].map((content) => (
                              <div
                                key={content.id}
                                className={`p-2 cursor-pointer transition-colors flex items-center justify-between ${
                                  selectedContent?.id === content.id
                                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] rounded'
                                    : 'hover:bg-[var(--muted)] rounded'
                                }`}
                                onClick={() => handleContentSelect(content)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium underline decoration-1 underline-offset-2 ${
                                    selectedContent?.id === content.id
                                      ? 'text-[var(--primary-foreground)]'
                                      : 'text-[var(--primary)]'
                                  }`}>
                                    {content.title}
                                  </span>
                                  {isContentCompleted(content) && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${
                                  selectedContent?.id === content.id
                                    ? 'text-[var(--primary-foreground)]'
                                    : 'text-[var(--muted-foreground)]'
                                }`}>
                                  {getContentIcon(content)}
                                  <span>{getContentTypeLabel(content)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="p-3 text-center text-sm text-[var(--muted-foreground)]">
                          No content available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2" />
              <p className="text-sm text-[var(--muted-foreground)]">No modules available</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderSelectedContent()}
        </div>
      </div>
    </div>
  );
};

export default CourseView; 