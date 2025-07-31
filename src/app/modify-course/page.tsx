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

  // Module expansion state
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [contentCreatorDialog, setContentCreatorDialog] = useState<{ open: boolean; moduleId: number | null }>({ open: false, moduleId: null });
  const [addContentCallbacks, setAddContentCallbacks] = useState<Map<number, (newContent: ContentResponse) => void>>(new Map());

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
        setModules(prev => [...prev, module]);
        // Auto-expand the newly created module
        setExpandedModules(prev => new Set([...prev, module.id]));
      }
    };

    window.addEventListener('moduleCreated', handleModuleCreated as EventListener);
    
    return () => {
      window.removeEventListener('moduleCreated', handleModuleCreated as EventListener);
    };
  }, []);

  // Listen for contentCreated events from AI assistant
  useEffect(() => {
    const handleContentCreated = (event: CustomEvent) => {
      const { content, moduleId } = event.detail;
      
      // Try to use the direct add content callback for the module
      const addContentFn = addContentCallbacks.get(moduleId);
      if (addContentFn) {
        addContentFn(content);
      } else {
        // Fallback to reloading all data
        loadData();
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

      // Auto-expand the newly created module
      setExpandedModules(prev => new Set([...prev, newModule.id]));

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

  const handleSaveModule = async (moduleId: number) => {
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
    setContentCreatorDialog({ open: true, moduleId });
  };

  const handleHideModuleContentCreator = () => {
    setContentCreatorDialog({ open: false, moduleId: null });
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
    // Content is already updated locally in ContentBlockList
    // No need to reload entire page - this was causing unnecessary page refreshes
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
              </CardContent>
            </Card>
          )}

          {/* Modules Section */}
          <Card className="bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-[var(--primary)]">
                    <BookOpen className="h-5 w-5" />
                    Course Modules ({modules.length})
                    <div className="relative group">
                      <Info
                        className="h-4 w-4 text-[var(--muted-foreground)] cursor-help hover:text-[var(--primary)] transition-colors"
                      />
                      <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-[var(--popover)] text-[var(--popover-foreground)] text-sm rounded-md shadow-lg border border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-80">
                        Modules are like chapters in a textbook or weeks of content - they help organize your course into manageable sections
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--border)]"></div>
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-[var(--muted-foreground)]">
                    Create and organize modules for your course content. Think of Modules like chapters to teach.
                  </CardDescription>
                </div>
                <Button onClick={handleOpenModuleDialog} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>


              {/* AI Assistant Module Selection Indicator */}
              {isAIVisible && modules.length > 0 && (
                <div className="text-sm text-blue-600 mb-4 p-2 bg-blue-50 rounded">
                  💡 Click on a module below to create content with AI{selectedModuleId ? ' • Click outside to deselect' : ''}
                </div>
              )}

              {/* Modules List */}
              {modules.length > 0 ? (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <Card 
                      key={module.id} 
                      data-module-card
                      className={`border-l-4 border-l-[var(--primary)] bg-[var(--background)] transition-all duration-200 ${
                        isAIVisible ? 'cursor-pointer hover:shadow-md' : ''
                      } ${
                        selectedModuleId === module.id ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/25' : ''
                      }`}
                      onClick={() => isAIVisible && selectModule(module.id)}
                    >
                      <CardContent className="pt-6">
                        {/* Module Edit Form */}
                        {editingModules.has(module.id) ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="px-2 py-1 rounded text-sm font-medium" style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
                                Module {index + 1} - Editing
                              </span>
                            </div>
                            <div>
                              <Label htmlFor={`edit-module-title-${module.id}`}>Module Title *</Label>
                              <Input
                                id={`edit-module-title-${module.id}`}
                                value={editModuleForms.get(module.id)?.title || ''}
                                onChange={(e) => updateModuleForm(module.id, 'title', e.target.value)}
                                placeholder="Enter module title..."
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-module-description-${module.id}`}>Module Description</Label>
                              <Textarea
                                id={`edit-module-description-${module.id}`}
                                value={editModuleForms.get(module.id)?.body || ''}
                                onChange={(e) => updateModuleForm(module.id, 'body', e.target.value)}
                                placeholder="Enter module description..."
                                rows={3}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSaveModule(module.id)}
                                disabled={savingModules.has(module.id) || !editModuleForms.get(module.id)?.title?.trim()}
                                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {savingModules.has(module.id) ? 'Saving...' : 'Save Changes'}
                              </Button>
                              <Button
                                onClick={() => handleCancelEditModule(module.id)}
                                variant="outline"
                                disabled={savingModules.has(module.id)}
                                className="border-[var(--border)] text-[var(--primary)]"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Regular Module Display */
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
                                onClick={() => handleEditModule(module.id, module.title, module.body)}
                                variant="outline"
                                size="sm"
                                className="border-[var(--border)] text-[var(--primary)]"
                              >
                                <Edit className="h-4 w-4" />
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
                        )}
                        {/* Expandable Content Management Section */}
                        {expandedModules.has(module.id) && (
                          <div className="mt-6 pt-6 border-t border-[var(--border)]">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium flex items-center gap-2 text-[var(--primary)]">
                                <FileText className="h-4 w-4" />
                                Module Content
                              </h4>
                              <Button
                                onClick={() => handleShowModuleContentCreator(module.id)}
                                size="sm"
                                className="bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                New Item
                              </Button>
                            </div>

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
                  <Button onClick={handleOpenModuleDialog} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Module
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="module-title">Module Title *</Label>
              <Input
                id="module-title"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Enter module title..."
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
              />
            </div>
            {moduleCreationError && (
              <p className="text-sm text-[var(--destructive)]">{moduleCreationError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateModule}
              disabled={isCreatingModule || !newModuleTitle.trim()}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreatingModule ? 'Creating...' : 'Create Module'}
            </Button>
            <Button
              onClick={handleCloseModuleDialog}
              variant="outline"
              disabled={isCreatingModule}
              className="border-[var(--border)] text-[var(--primary)]"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
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

    </DashboardLayout>
  );
};

export default ModifyCoursePage;
