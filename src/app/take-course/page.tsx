'use client'

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/content/Layout";
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
  CheckCircle
} from "lucide-react";
import { apiService } from "@/services/api";
import { mockAuth } from "@/contexts/UserContext";
import { Course, Module } from "@/types/backend-api";
import ContentBlockList from "@/components/content/ContentBlockList";

const TakeCoursePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  // State management
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Module expansion state
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  // Load course and modules data
  useEffect(() => {
    if (!courseId) {
      setError('Course ID is required');
      setIsLoading(false);
      return;
    }

    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await mockAuth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      setCurrentUser(user);

      // Load course details and modules in parallel
      const [courseData, modulesData] = await Promise.all([
        apiService.getCourseById(parseInt(courseId!)),
        apiService.getModulesByCourseId(parseInt(courseId!))
      ]);

      setCourse(courseData);
      setModules(modulesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handleBackToDashboard = () => {
    router.push('/student-dashboard');
  };

  // Module expansion handlers
  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleContentUpdate = () => {
    // Refresh data when content is updated to reflect progress changes
    loadData();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={handleBackToDashboard} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{course?.title}</h1>
              <p className="text-muted-foreground">
                Learn at your own pace and track your progress
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Student View</span>
          </div>
        </div>

        {/* Course Information Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Course Overview</CardTitle>
                <CardDescription>
                  Course description and learning objectives
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Self-paced</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{modules.length} modules</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <h3 className="font-medium">{course?.title}</h3>
              </div>
              {course?.body && (
                <div>
                  <p className="text-muted-foreground">{course.body}</p>
                </div>
              )}
              {!course?.body && (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modules Section */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Modules ({modules.length})
              </CardTitle>
              <CardDescription>
                Complete modules in order to progress through the course
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {modules.length > 0 ? (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <Card key={module.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                              Module {index + 1}
                            </span>
                            {module.progress === 100 && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
                          {module.body && (
                            <p className="text-muted-foreground mb-3">{module.body}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Content: {module.contentCount || 0} items</span>
                            {module.progress !== undefined && (
                              <div className="flex items-center gap-2">
                                <span>Progress: {Math.round(module.progress)}%</span>
                                <div className="w-20 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2 bg-primary rounded-full transition-all duration-300"
                                    style={{ width: `${module.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => toggleModuleExpansion(module.id)}
                            variant="outline"
                            size="sm"
                          >
                            {expandedModules.has(module.id) ? (
                              <>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                Hide Content
                              </>
                            ) : (
                              <>
                                <ChevronRight className="h-4 w-4 mr-2" />
                                Start Learning
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expandable Content Section */}
                      {expandedModules.has(module.id) && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="mb-4">
                            <h4 className="font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Module Content
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Complete all content items to finish this module
                            </p>
                          </div>

                          {/* Content Block List for this module - Student view */}
                          <ContentBlockList
                            moduleId={module.id}
                            moduleName={module.title}
                            isInteractive={true}
                            onContentUpdate={handleContentUpdate}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Modules Available</h3>
                <p className="text-muted-foreground mb-4">
                  This course doesn't have any modules yet. Please check back later.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TakeCoursePage;