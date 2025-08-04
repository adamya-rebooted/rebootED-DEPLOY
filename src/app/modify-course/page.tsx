'use client'

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/content/DashboardLayout";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChevronRight,
  Info,
  Users,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { createClient } from '@/utils/supabase/client';
import { Course, Module, ContentResponse, NewModuleRequest } from "@/types/backend-api";
import ContentBlockList from "@/components/content/ContentBlockList";
import EnhancedContentCreator from "@/components/content/EnhancedContentCreator";
import AddUserToCourseDialog from "@/components/content/AddUserToCourseDialog";
import PublishCourseDialog from "@/components/content/PublishCourseDialog";
import { useAIAssistant } from "@/components/ai-assistant";

const ModifyCoursePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');
  const { isVisible: isAIVisible, selectedModuleId, selectModule, clearSelection } = useAIAssistant();

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



  // Add user dialog state
  const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);

  // Publish course dialog state
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Module content management state
  const [contentCreatorDialog, setContentCreatorDialog] = useState<{ open: boolean; moduleId: number | null }>({ open: false, moduleId: null });
  const [addContentCallbacks, setAddContentCallbacks] = useState<Map<number, (newContent: ContentResponse) => void>>(new Map());

  // Module selection state for new layout
  const [selectedModuleForContent, setSelectedModuleForContent] = useState<number | null>(null);

  // Module editing state
  const [editingModules, setEditingModules] = useState<Set<number>>(new Set());
  const [editModuleForms, setEditModuleForms] = useState<Map<number, {title: string, body: string}>>(new Map());
  const [savingModules, setSavingModules] = useState<Set<number>>(new Set());

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
      if (module && module.id) {
        // Add the new module to the list
        setModules(prev => {
          const newModules = [...prev, module];
          return newModules;
        });
        
        // Auto-select the newly created module (most recent)
        setSelectedModuleForContent(module.id);
      }
    };

    window.addEventListener('moduleCreated', handleModuleCreated as EventListener);

    return () => {
      window.removeEventListener('moduleCreated', handleModuleCreated as EventListener);
    };
  }, [selectedModuleForContent]);

  // Listen for contentCreated events from AI assistant
  useEffect(() => {
    const handleContentCreated = (event: CustomEvent) => {
      const { content, moduleId } = event.detail;

      console.log('📡 Received contentCreated event:', { content, moduleId });
      console.log('📋 Available callbacks:', Array.from(addContentCallbacks.keys()));

      // Try to use the direct add content callback for the module
      const addContentFn = addContentCallbacks.get(moduleId);
      if (addContentFn) {
        console.log('✅ Using direct callback to add content');
        addContentFn(content);
        toast.success("Content created successfully!", {
          description: `"${content.title}" has been added to the module.`,
          duration: 3000,
        });
      } else {
        console.log('⚠️ No direct callback available, trying alternative approaches');

        // First alternative: Try to wait a bit and retry the callback (in case it's still registering)
        setTimeout(() => {
          const retryAddContentFn = addContentCallbacks.get(moduleId);
          if (retryAddContentFn) {
            console.log('✅ Retry successful - using delayed callback');
            retryAddContentFn(content);
            toast.success("Content created successfully!", {
              description: `"${content.title}" has been added to the module.`,
              duration: 3000,
            });
          } else {
            // Second alternative: Force refresh the ContentBlockList for the specific module
            console.log('📡 Using refresh event fallback');
            const refreshContentEvent = new CustomEvent('refreshModuleContent', {
              detail: { moduleId, newContent: content }
            });
            window.dispatchEvent(refreshContentEvent);

            toast.success("Content created successfully!", {
              description: `"${content.title}" has been added to the module.`,
              duration: 3000,
            });
          }
        }, 100); // Small delay to allow callback registration
      }
    };

    window.addEventListener('contentCreated', handleContentCreated as EventListener);

    return () => {
      window.removeEventListener('contentCreated', handleContentCreated as EventListener);
    };
  }, [addContentCallbacks]);

  // Handle clicking outside modules to deselect when AI assistant is open
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isAIVisible || !selectedModuleId) return;
      
      const target = event.target as Element;
      const moduleCard = target.closest('[data-module-card]');
      const aiAssistant = target.closest('[data-ai-assistant]');
      
      if (!moduleCard && !aiAssistant) {
        clearSelection();
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isAIVisible, selectedModuleId, clearSelection]);

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

      // Auto-select the first module if none is currently selected and modules exist
      if (!selectedModuleForContent && modulesData.length > 0) {
        setSelectedModuleForContent(modulesData[0].id);
      }

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

  // Add user dialog handlers
  const handleAddTeacher = () => {
    setShowAddTeacherDialog(true);
  };

  const handleAddStudent = () => {
    setShowAddStudentDialog(true);
  };

  const handleUserAdded = () => {
    // Optionally refresh course data or show updated member count
    // For now, just show success message which is handled in the dialog
  };

  // Publish course handlers
  const handlePublishCourse = () => {
    setShowPublishDialog(true);
  };

  const handleConfirmPublish = async () => {
    try {
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      // Call the actual publish API
      await apiService.publishCourse(parseInt(courseId));
      
      toast.success('Course published successfully!', {
        description: 'Your course is now live and available to students.',
        duration: 5000,
      });

      // Redirect to the main dashboard
      router.push('/management-dashboard');
    } catch (err) {
      console.error('Error publishing course:', err);
      throw err; // Re-throw to let the dialog handle the error
    }
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

  const handleSaveCourse = async (e?: React.FormEvent) => {
    // Prevent form submission and page reload
    if (e) {
      e.preventDefault();
    }

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
  const handleCreateModule = async (e?: React.FormEvent) => {
    // Prevent form submission and page reload
    if (e) {
      e.preventDefault();
    }

    console.log("Creating Module");
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

      // Auto-select the newly created module
      setSelectedModuleForContent(newModule.id);

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

  const handleOpenModuleDialog = () => {
    setShowModuleCreator(true);
    setNewModuleTitle('');
    setNewModuleDescription('');
    setModuleCreationError(null);
  };

  const handleCloseModuleDialog = () => {
    setShowModuleCreator(false);
    setNewModuleTitle('');
    setNewModuleDescription('');
    setModuleCreationError(null);
  };



  const handleDeleteModule = async (moduleId: number, moduleTitle: string) => {
    if (!confirm(`Are you sure you want to delete the module "${moduleTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteModule(parseInt(courseId!), moduleId);

      // Remove the module from the list
      setModules(prev => {
        const remainingModules = prev.filter(m => m.id !== moduleId);

        // If the deleted module was selected, auto-select the first remaining module
        if (selectedModuleForContent === moduleId && remainingModules.length > 0) {
          setSelectedModuleForContent(remainingModules[0].id);
        } else if (selectedModuleForContent === moduleId) {
          setSelectedModuleForContent(null);
        }

        return remainingModules;
      });

      toast.success(`Module "${moduleTitle}" deleted successfully`);
    } catch (err) {
      console.error('Error deleting module:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete module');
    }
  };

  // Module editing handlers
  const handleEditModule = (moduleId: number, moduleTitle: string, moduleBody: string) => {
    setEditingModules(prev => new Set([...prev, moduleId]));
    setEditModuleForms(prev => {
      const newMap = new Map(prev);
      newMap.set(moduleId, { title: moduleTitle, body: moduleBody || '' });
      return newMap;
    });
  };

  const handleCancelEditModule = (moduleId: number) => {
    setEditingModules(prev => {
      const newSet = new Set(prev);
      newSet.delete(moduleId);
      return newSet;
    });
    setEditModuleForms(prev => {
      const newMap = new Map(prev);
      newMap.delete(moduleId);
      return newMap;
    });
  };

  const handleSaveModule = async (moduleId: number, e?: React.FormEvent) => {
    // Prevent form submission and page reload
    if (e) {
      e.preventDefault();
    }

    const moduleForm = editModuleForms.get(moduleId);
    if (!moduleForm || !moduleForm.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      setSavingModules(prev => new Set([...prev, moduleId]));

      const updatedModule = await apiService.updateModule(parseInt(courseId!), moduleId, {
        title: moduleForm.title.trim(),
        body: moduleForm.body.trim(),
        courseId: parseInt(courseId!)
      });

      // Update the module in the list
      setModules(prev => prev.map(m => m.id === moduleId ? updatedModule : m));

      // Exit edit mode
      handleCancelEditModule(moduleId);

      toast.success('Module updated successfully!');
    } catch (err) {
      console.error('Error updating module:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update module');
    } finally {
      setSavingModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
    }
  };

  const updateModuleForm = (moduleId: number, field: 'title' | 'body', value: string) => {
    setEditModuleForms(prev => {
      const newMap = new Map(prev);
      const currentForm = newMap.get(moduleId) || { title: '', body: '' };
      newMap.set(moduleId, { ...currentForm, [field]: value });
      return newMap;
    });
  };

  // Module content management handlers

  const handleShowModuleContentCreator = (moduleId: number) => {
    setContentCreatorDialog({ open: true, moduleId });
  };

  const handleHideModuleContentCreator = () => {
    setContentCreatorDialog({ open: false, moduleId: null });
  };

  const handleModuleContentCreated = (moduleId: number) => (newContent: ContentResponse) => {
    handleHideModuleContentCreator();
    toast.success("Content created successfully!");

    // Add the new content directly to the list if the function is available
    const addContentFn = addContentCallbacks.get(moduleId);
    if (addContentFn) {
      addContentFn(newContent);
    } else {
      // Use the same fallback approach as AI assistant content creation
      console.log('⚠️ No direct callback available for manual content creation, using refresh event');
      const refreshContentEvent = new CustomEvent('refreshModuleContent', {
        detail: { moduleId, newContent }
      });
      window.dispatchEvent(refreshContentEvent);
    }
  };

  const handleModuleContentUpdate = () => {
    // Content is already updated locally in ContentBlockList
    // No need to reload entire page - this was causing unnecessary page refreshes
  };

  // Memoize add content callbacks for each module to prevent infinite re-renders
  const addContentCallbacksMap = useMemo(() => {
    const map = new Map<number, (addContentFn: (newContent: ContentResponse) => void) => void>();
    modules.forEach(module => {
      map.set(module.id, (addContentFn: (newContent: ContentResponse) => void) => {
        console.log('📝 Registering content callback for module:', module.id);
        setAddContentCallbacks(prev => {
          const newMap = new Map(prev);
          newMap.set(module.id, addContentFn);
          console.log('✅ Content callback registered for module:', module.id);
          return newMap;
        });
      });
    });
    console.log('🗺️ Created callback map for modules:', Array.from(map.keys()));
    return map;
  }, [modules]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading course data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={handleBackToDashboard} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      onAddTeacher={handleAddTeacher}
      onAddStudent={handleAddStudent}
      onPreviewCourse={handlePreviewCourse}
      onEditCourse={handleEditCourse}
    >
      <div className="p-8">
        <div className="space-y-6">
          {/* Back Button and Course Info */}
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
                 {course?.body}
                </p>
              </div>
            </div>
            
            {/* Publish Course Button */}
            <Button
              onClick={handlePublishCourse}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Publish Course
            </Button>
          </div>

          {/* Course Editing Form */}
          {isEditingCourse && (
            <Card className="bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)]">
              <CardHeader>
                <CardTitle className="text-lg text-[var(--primary)]">Edit Course Information</CardTitle>
                <CardDescription className="text-[var(--muted-foreground)]">
                  Update course title and description
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCourse}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="course-title">Course Title *</Label>
                      <Input
                        id="course-title"
                        value={editCourseTitle}
                        onChange={(e) => setEditCourseTitle(e.target.value)}
                        placeholder="Enter course title..."
                        className="mt-1"
                        disabled={isSavingCourse}
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
                        disabled={isSavingCourse}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isSavingCourse || !editCourseTitle.trim()}
                        className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSavingCourse ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        type="button"
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
                </form>
              </CardContent>
            </Card>
          )}

          {/* Course Content Management - Two Column Layout */}
          <div className="flex gap-6 h-[calc(100vh-300px)] min-h-[600px]">
            {/* Left Sidebar - Course Structure */}
            <div className="w-1/3 max-h-[calc(100vh-200px)] max-w-sm">
              <div className="bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-lg h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[var(--primary)]">Course Structure</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleOpenModuleDialog}
                        variant="outline"
                        size="sm"
                        className="border-[var(--border)] bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary)]/90 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Module
                      </Button>
                     
                    </div>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">New Course</p>
                </div>

                {/* Add Module Button */}
                {/* <div className="p-4">
                  <button
                    onClick={handleOpenModuleDialog}
                    className="w-full border-2 border-dashed border-[var(--border)] rounded-lg p-4 text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Module
                  </button>
                </div> */}

                {/* AI Assistant Module Selection Indicator */}
                {isAIVisible && modules.length > 0 && (
                  <div className="text-sm text-blue-600 mx-4 mb-2 p-2 bg-blue-50 rounded">
                    💡 Click on a module to create content with AI{selectedModuleId ? ' • Click outside to deselect' : ''}
                  </div>
                )}

                {/* Modules List */}
                <div className="flex-1 overflow-y-auto p-4 pt-0">
                  {modules.length > 0 ? (
                    <div className="space-y-2">
                      {modules.map((module, index) => (
                        <div
                          key={module.id}
                          data-module-card
                          className={`p-3 border border-[var(--border)] rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedModuleForContent === module.id
                              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                              : 'bg-[var(--background)] hover:bg-[var(--muted)] hover:border-[var(--primary)]'
                          } ${
                            isAIVisible && selectedModuleId === module.id
                              ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/25'
                              : ''
                          }`}
                          onClick={() => {
                            setSelectedModuleForContent(module.id);
                            if (isAIVisible) {
                              selectModule(module.id);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  selectedModuleForContent === module.id
                                    ? 'bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]'
                                    : 'bg-[var(--muted)] text-[var(--primary)]'
                                }`}>
                                  Module {index + 1}
                                </span>
                              </div>
                              <h3 className="font-medium text-sm truncate">{module.title}</h3>
                              <p className="text-xs text-opacity-70 mt-1">
                                {module.contentCount || 0} items
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditModule(module.id, module.title, module.body);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteModule(module.id, module.title);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-[var(--destructive)] hover:text-[var(--destructive)]"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--muted-foreground)]">
                        No modules yet. Add your first module to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1">
              <div className="max-h-[calc(100vh-200px)] bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-lg h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-[var(--border)]">
                  <h2 className="text-lg font-semibold text-[var(--primary)]">
                    {selectedModuleForContent
                      ? `${modules.find(m => m.id === selectedModuleForContent)?.title || 'Module'} Content`
                      : 'Select content to edit'
                    }
                  </h2>
                  {!selectedModuleForContent && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">No content selected</p>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                  {selectedModuleForContent ? (
                    <div className="p-4">
                      {/* Module Edit Form */}
                      {editingModules.has(selectedModuleForContent) && (
                        <Card className="mb-4 bg-[var(--background)]">
                          <CardContent className="pt-6">
                            <form onSubmit={(e) => handleSaveModule(selectedModuleForContent, e)}>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="px-2 py-1 rounded text-sm font-medium" style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
                                    Editing Module
                                  </span>
                                </div>
                                <div>
                                  <Label htmlFor={`edit-module-title-${selectedModuleForContent}`}>Module Title *</Label>
                                  <Input
                                    id={`edit-module-title-${selectedModuleForContent}`}
                                    value={editModuleForms.get(selectedModuleForContent)?.title || ''}
                                    onChange={(e) => updateModuleForm(selectedModuleForContent, 'title', e.target.value)}
                                    placeholder="Enter module title..."
                                    className="mt-1"
                                    disabled={savingModules.has(selectedModuleForContent)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`edit-module-description-${selectedModuleForContent}`}>Module Description</Label>
                                  <Textarea
                                    id={`edit-module-description-${selectedModuleForContent}`}
                                    value={editModuleForms.get(selectedModuleForContent)?.body || ''}
                                    onChange={(e) => updateModuleForm(selectedModuleForContent, 'body', e.target.value)}
                                    placeholder="Enter module description..."
                                    rows={3}
                                    className="mt-1"
                                    disabled={savingModules.has(selectedModuleForContent)}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    type="submit"
                                    disabled={savingModules.has(selectedModuleForContent) || !editModuleForms.get(selectedModuleForContent)?.title?.trim()}
                                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    {savingModules.has(selectedModuleForContent) ? 'Saving...' : 'Save Changes'}
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => handleCancelEditModule(selectedModuleForContent)}
                                    variant="outline"
                                    disabled={savingModules.has(selectedModuleForContent)}
                                    className="border-[var(--border)] text-[var(--primary)]"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      )}

                      {/* Module Content Management */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2 text-[var(--primary)]">
                            <FileText className="h-4 w-4" />
                            Module Content
                          </h4>
                          <Button
                            onClick={() => handleShowModuleContentCreator(selectedModuleForContent)}
                            size="sm"
                            className="bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Content
                          </Button>
                        </div>

                        {/* Content Block List for selected module */}
                        <ContentBlockList
                          moduleId={selectedModuleForContent}
                          moduleName={modules.find(m => m.id === selectedModuleForContent)?.title || ''}
                          isInteractive={true}
                          onContentUpdate={handleModuleContentUpdate}
                          onAddContent={addContentCallbacksMap.get(selectedModuleForContent)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-24 h-24 mb-6 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                        <FileText className="h-12 w-12 text-[var(--muted-foreground)]" />
                      </div>
                      <h3 className="text-xl font-medium mb-2 text-[var(--primary)]">No Content Selected</h3>
                      <p className="text-[var(--muted-foreground)] max-w-md">
                        Create a module and add content to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Dialogs */}
      <AddUserToCourseDialog
        open={showAddTeacherDialog}
        onOpenChange={setShowAddTeacherDialog}
        courseId={parseInt(courseId!)}
        userType="teacher"
        onUserAdded={handleUserAdded}
      />
      
      <AddUserToCourseDialog
        open={showAddStudentDialog}
        onOpenChange={setShowAddStudentDialog}
        courseId={parseInt(courseId!)}
        userType="student"
        onUserAdded={handleUserAdded}
      />

      {/* Add Module Dialog */}
      <Dialog open={showModuleCreator} onOpenChange={setShowModuleCreator}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
            <DialogDescription>
              Add a new module to organize your course content. Modules are like chapters that help structure your course.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateModule}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="module-title">Module Title *</Label>
                <Input
                  id="module-title"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Enter module title..."
                  disabled={isCreatingModule}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="module-description">Module Description</Label>
                <Textarea
                  id="module-description"
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  placeholder="Enter module description..."
                  rows={3}
                  disabled={isCreatingModule}
                />
              </div>
              {moduleCreationError && (
                <p className="text-sm text-[var(--destructive)]">{moduleCreationError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isCreatingModule || !newModuleTitle.trim()}
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreatingModule ? 'Creating...' : 'Create Module'}
              </Button>
              <Button
                type="button"
                onClick={handleCloseModuleDialog}
                variant="outline"
                disabled={isCreatingModule}
                className="border-[var(--border)] text-[var(--primary)]"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Content Dialog */}
      <Dialog open={contentCreatorDialog.open} onOpenChange={(open) => setContentCreatorDialog({ open, moduleId: contentCreatorDialog.moduleId })}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add New Content</DialogTitle>
            <DialogDescription>
              Create new content for your module. Choose from different content types to engage your students.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {contentCreatorDialog.moduleId && (
              <EnhancedContentCreator
                moduleId={contentCreatorDialog.moduleId}
                onContentCreated={handleModuleContentCreated(contentCreatorDialog.moduleId)}
                onCancel={handleHideModuleContentCreator}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Course Dialog */}
      <PublishCourseDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        courseTitle={course?.title || 'Untitled Course'}
        onPublish={handleConfirmPublish}
      />

    </DashboardLayout>
  );
};

export default ModifyCoursePage;
