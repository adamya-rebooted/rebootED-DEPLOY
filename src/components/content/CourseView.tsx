'use client'

import React, { useState, useEffect } from "react";
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

interface CourseViewProps {
  course: Course;
  modules: Module[];
  isLoading?: boolean;
  error?: string | null;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showStudentView?: boolean;
  onContentUpdate?: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({
  course,
  modules,
  showBackButton = true,
  onBackClick,
  showStudentView = true,
  onContentUpdate
}) => {
  // State for sidebar and content
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [selectedContent, setSelectedContent] = useState<ContentResponse | null>(null);
  const [moduleContents, setModuleContents] = useState<{[key: number]: ContentResponse[]}>({});
  const [loadingContent, setLoadingContent] = useState<{[key: number]: boolean}>({});

  // Load content for a module when it's expanded
  const loadModuleContent = async (moduleId: number) => {
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
  };

  // Toggle module expansion
  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
        loadModuleContent(moduleId);
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
      return (
        <MultipleChoiceQuestionContentBlock
          content={selectedContent}
          onSubmitAnswer={handleSubmitAnswer}
          isInteractive={true}
        />
      );
    } else if (isMatchingQuestionContent(selectedContent)) {
      return (
        <MatchingQuestionContentBlock
          content={selectedContent}
          onSubmitAnswer={handleSubmitAnswer}
          isInteractive={true}
        />
      );
    } else if (isVideoContent(selectedContent)) {
      return (
        <VideoContentBlock
          content={selectedContent}
          onComplete={handleContentComplete}
          isInteractive={true}
        />
      );
    } else {
      return (
        <TextContentBlock
          content={selectedContent}
          onComplete={handleContentComplete}
          isInteractive={true}
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
            <div className="space-y-2">
              {modules.map((module, index) => (
                <div key={module.id} className="border border-[var(--border)] rounded-lg">
                  {/* Module Header */}
                  <div
                    className="p-3 cursor-pointer hover:bg-[var(--muted)] transition-colors"
                    onClick={() => toggleModuleExpansion(module.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="h-4 w-4 text-[var(--primary)]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[var(--primary)]" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[var(--primary)]">
                              Module {index + 1}
                            </span>
                            {module.progress === 100 && (
                              <CheckCircle className="h-3 w-3 text-[var(--secondary)]" />
                            )}
                          </div>
                          <h3 className="font-medium text-sm text-[var(--card-foreground)]">
                            {module.title}
                          </h3>
                        </div>
                      </div>
                      {module.progress !== undefined && (
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {Math.round(module.progress)}%
                        </div>
                      )}
                    </div>
                    {module.progress !== undefined && (
                      <div className="mt-2 w-full h-1 bg-[var(--muted)] rounded-full">
                        <div
                          className="h-1 bg-[var(--primary)] rounded-full transition-all duration-300"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Module Content */}
                  {expandedModules.has(module.id) && (
                    <div className="border-t border-[var(--border)]">
                      {loadingContent[module.id] ? (
                        <div className="p-3 text-center text-sm text-[var(--muted-foreground)]">
                          Loading content...
                        </div>
                      ) : moduleContents[module.id]?.length > 0 ? (
                        <div className="p-2">
                          {moduleContents[module.id].map((content) => (
                            <div
                              key={content.id}
                              className={`p-2 rounded cursor-pointer transition-colors mb-1 ${
                                selectedContent?.id === content.id
                                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                  : 'hover:bg-[var(--muted)]'
                              }`}
                              onClick={() => handleContentSelect(content)}
                            >
                              <div className="flex items-center gap-2">
                                {getContentIcon(content)}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {content.title}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--accent-foreground)]">
                                      {getContentTypeLabel(content)}
                                    </span>
                                    {isContentCompleted(content) && (
                                      <CheckCircle className="h-3 w-3 text-[var(--secondary)]" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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