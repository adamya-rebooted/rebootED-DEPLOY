'use client'

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/content/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  FileText,
  BookOpen,
  Edit,
  Save,
  X,
  Trash2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { createClient } from '@/utils/supabase/client';
import { Course, Module, ContentResponse, NewModuleRequest } from "@/types/backend-api";
import ContentBlockList from "@/components/content/ContentBlockList";
import EnhancedContentCreator from "@/components/content/EnhancedContentCreator";

const ModifyCoursePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  // State management
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Course editing state
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Module creation state
  const [showModuleCreator, setShowModuleCreator] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [moduleCreationError, setModuleCreationError] = useState<string | null>(null);

  // Module expansion state
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [moduleContentCreators, setModuleContentCreators] = useState<Set<number>>(new Set());
  const [addContentCallbacks, setAddContentCallbacks] = useState<Map<number, (newContent: ContentResponse) => void>>(new Map());

  // Load course and modules data
  useEffect(() => {
    if (!courseId) {
      setError('Course ID is required');
      setIsLoading(false);
      return;
    }

    loadData();
  }, [courseId]);

  // Listen for moduleCreated events from AI assistant
  useEffect(() => {
    const handleModuleCreated = (event: CustomEvent) => {
      const { module } = event.detail;
      // Add the new module to the list
      setModules(prev => [...prev, module]);
    };

    window.addEventListener('moduleCreated', handleModuleCreated as EventListener);
    
    return () => {
      window.removeEventListener('moduleCreated', handleModuleCreated as EventListener);
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user to check permissions
              const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // Load course details and modules in parallel
      const [courseData, modulesData] = await Promise.all([
        apiService.getCourseById(parseInt(courseId!)),
        apiService.getModulesByCourseId(parseInt(courseId!))
      ]);

      setCourse(courseData);
      setModules(modulesData);

      // Initialize edit form with current course data
      setEditCourseTitle(courseData.title);
      setEditCourseDescription(courseData.body || '');
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handleBackToDashboard = () => {
    router.push('/management-dashboard');
  };

  const handlePreviewCourse = () => {
    router.push(`/preview-course?id=${courseId}`);
  };

  // Course editing handlers
  const handleEditCourse = () => {
    setIsEditingCourse(true);
  };

  const handleCancelEditCourse = () => {
    setIsEditingCourse(false);
    setEditCourseTitle(course?.title || '');
    setEditCourseDescription(course?.body || '');
  };

  const handleSaveCourse = async () => {
    if (!course || !editCourseTitle.trim()) {
      toast.error('Course title is required');
      return;
    }

    try {
      setIsSavingCourse(true);

      const updatedCourse = await apiService.updateCourse(course.id, {
        title: editCourseTitle.trim(),
        body: editCourseDescription.trim()
      });

      setCourse(updatedCourse);
      setIsEditingCourse(false);
      toast.success('Course updated successfully!');
    } catch (err) {
      console.error('Error updating course:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setIsSavingCourse(false);
    }
  };

  // Module management handlers
  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) {
      setModuleCreationError('Module title is required');
      return;
    }

    try {
      setIsCreatingModule(true);
      setModuleCreationError(null);

      const moduleData: NewModuleRequest = {
        title: newModuleTitle.trim(),
        body: newModuleDescription.trim(),
        courseId: parseInt(courseId!)
      };

      const newModule = await apiService.createModule(moduleData);

      // Add the new module to the list
      setModules(prev => [...prev, newModule]);

      // Reset form
      setNewModuleTitle('');
      setNewModuleDescription('');
      setShowModuleCreator(false);

      toast.success("Module Created Successfully!", {
        description: `"${newModule.title}" has been added to the course.`,
        duration: 3000,
      });
    } catch (err) {
      console.error('Error creating module:', err);
      setModuleCreationError(err instanceof Error ? err.message : 'Failed to create module');
    } finally {
      setIsCreatingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: number, moduleTitle: string) => {
    if (!confirm(`Are you sure you want to delete the module "${moduleTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteModule(parseInt(courseId!), moduleId);

      // Remove the module from the list
      setModules(prev => prev.filter(m => m.id !== moduleId));

      // Remove from expanded modules if it was expanded
      setExpandedModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });

      toast.success(`Module "${moduleTitle}" deleted successfully`);
    } catch (err) {
      console.error('Error deleting module:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete module');
    }
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

  const handleShowModuleContentCreator = (moduleId: number) => {
    setModuleContentCreators(prev => {
      const newSet = new Set(prev);
      newSet.add(moduleId);
      return newSet;
    });
  };

  const handleHideModuleContentCreator = (moduleId: number) => {
    setModuleContentCreators(prev => {
      const newSet = new Set(prev);
      newSet.delete(moduleId);
      return newSet;
    });
  };

  const handleModuleContentCreated = (moduleId: number) => (newContent: ContentResponse) => {
    handleHideModuleContentCreator(moduleId);
    toast.success("Content created successfully!");

    // Add the new content directly to the list if the function is available
    const addContentFn = addContentCallbacks.get(moduleId);
    if (addContentFn) {
      addContentFn(newContent);
    } else {
      // Fallback to refresh if direct add is not available
      loadData();
    }
  };

  const handleModuleContentUpdate = () => {
    // Refresh data when content is updated to reflect progress changes
    loadData();
  };

  // Memoize add content callbacks for each module to prevent infinite re-renders
  const addContentCallbacksMap = useMemo(() => {
    const map = new Map<number, (addContentFn: (newContent: ContentResponse) => void) => void>();
    modules.forEach(module => {
      map.set(module.id, (addContentFn: (newContent: ContentResponse) => void) => {
        setAddContentCallbacks(prev => {
          const newMap = new Map(prev);
          newMap.set(module.id, addContentFn);
          return newMap;
        });
      });
    });
    return map;
  }, [modules]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading course data...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={handleBackToDashboard} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 bg-[var(--background)] min-h-screen">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                size="sm"
                className="border-[var(--border)] text-[var(--primary)]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[var(--primary)]">{course?.title}</h1>
                <p className="text-[var(--muted-foreground)]">
                  Modify course content, add modules, and manage course structure
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePreviewCourse} variant="outline" className="border-[var(--border)] text-[var(--primary)]">
                <BookOpen className="h-4 w-4 mr-2" />
                Preview Course
              </Button>
            </div>
          </div>
          {/* Course Information Section */}
          <Card className="bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-[var(--primary)]">Course Information</CardTitle>
                  <CardDescription className="text-[var(--muted-foreground)]">
                    Manage course title and description
                  </CardDescription>
                </div>
                {!isEditingCourse && (
                  <Button onClick={handleEditCourse} variant="outline" size="sm" className="border-[var(--border)] text-[var(--primary)]">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Course
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingCourse ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="course-title">Course Title *</Label>
                    <Input
                      id="course-title"
                      value={editCourseTitle}
                      onChange={(e) => setEditCourseTitle(e.target.value)}
                      placeholder="Enter course title..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-description">Course Description</Label>
                    <Textarea
                      id="course-description"
                      value={editCourseDescription}
                      onChange={(e) => setEditCourseDescription(e.target.value)}
                      placeholder="Enter course description..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveCourse}
                      disabled={isSavingCourse || !editCourseTitle.trim()}
                      className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSavingCourse ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={handleCancelEditCourse}
                      variant="outline"
                      disabled={isSavingCourse}
                      className="border-[var(--border)] text-[var(--primary)]"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <h3 className="font-medium text-[var(--primary)]">{course?.title}</h3>
                  </div>
                  {course?.body && (
                    <div>
                      <p className="text-[var(--muted-foreground)]">{course.body}</p>
                    </div>
                  )}
                  {!course?.body && (
                    <p className="text-[var(--muted-foreground)] italic">No description provided</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Modules Section */}
          <Card className="bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-[var(--primary)]">
                    <BookOpen className="h-5 w-5" />
                    Course Modules ({modules.length})
                  </CardTitle>
                  <CardDescription className="text-[var(--muted-foreground)]">
                    Create and organize modules for your course content
                  </CardDescription>
                </div>
                <Button onClick={() => setShowModuleCreator(true)} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Module Creator */}
              {showModuleCreator && (
                <Card className="mb-6 border-dashed bg-[var(--muted)] border-[var(--border)]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[var(--primary)]">Create New Module</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="module-title">Module Title *</Label>
                      <Input
                        id="module-title"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        placeholder="Enter module title..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="module-description">Module Description</Label>
                      <Textarea
                        id="module-description"
                        value={newModuleDescription}
                        onChange={(e) => setNewModuleDescription(e.target.value)}
                        placeholder="Enter module description..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    {moduleCreationError && (
                      <p className="text-sm text-[var(--destructive)]">{moduleCreationError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateModule}
                        disabled={isCreatingModule || !newModuleTitle.trim()}
                        className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isCreatingModule ? 'Creating...' : 'Create Module'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowModuleCreator(false);
                          setNewModuleTitle('');
                          setNewModuleDescription('');
                          setModuleCreationError(null);
                        }}
                        variant="outline"
                        disabled={isCreatingModule}
                        className="border-[var(--border)] text-[var(--primary)]"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Modules List */}
              {modules.length > 0 ? (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <Card key={module.id} className="border-l-4 border-l-[var(--primary)] bg-[var(--background)]">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 rounded text-sm font-medium" style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
                                Module {index + 1}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-[var(--primary)]">{module.title}</h3>
                            {module.body && (
                              <p className="text-[var(--muted-foreground)] mb-3">{module.body}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                              <span>Content: {module.contentCount || 0} items</span>
                              {module.progress !== undefined && (
                                <span>Progress: {Math.round(module.progress)}%</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => toggleModuleExpansion(module.id)}
                              variant="outline"
                              size="sm"
                              className="border-[var(--border)] text-[var(--primary)]"
                            >
                              {expandedModules.has(module.id) ? (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                  Hide Content
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-4 w-4 mr-2" />
                                  Manage Content
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleDeleteModule(module.id, module.title)}
                              variant="outline"
                              size="sm"
                              className="text-[var(--destructive)] border-[var(--destructive)] hover:text-[var(--destructive)] hover:border-[var(--destructive)]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Expandable Content Management Section */}
                        {expandedModules.has(module.id) && (
                          <div className="mt-6 pt-6 border-t border-[var(--border)]">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium flex items-center gap-2 text-[var(--primary)]">
                                <FileText className="h-4 w-4" />
                                Module Content
                              </h4>
                              {!moduleContentCreators.has(module.id) && (
                                <Button
                                  onClick={() => handleShowModuleContentCreator(module.id)}
                                  size="sm"
                                  className="bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  New Item
                                </Button>
                              )}
                            </div>
                            {/* Content Creator for this module */}
                            {moduleContentCreators.has(module.id) && (
                              <div className="mb-6">
                                <EnhancedContentCreator
                                  moduleId={module.id}
                                  onContentCreated={handleModuleContentCreated(module.id)}
                                  onCancel={() => handleHideModuleContentCreator(module.id)}
                                />
                              </div>
                            )}
                            {/* Content Block List for this module */}
                            <ContentBlockList
                              moduleId={module.id}
                              moduleName={module.title}
                              isInteractive={true}
                              onContentUpdate={handleModuleContentUpdate}
                              onAddContent={addContentCallbacksMap.get(module.id)}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-[var(--primary)]">No Modules Yet</h3>
                  <p className="text-[var(--muted-foreground)] mb-4">
                    Start building your course by adding your first module
                  </p>
                  <Button onClick={() => setShowModuleCreator(true)} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Module
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ModifyCoursePage;
