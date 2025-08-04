'use client'

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/content/DashboardLayout";
import CreateCourseDialog from "@/components/content/CreateCourseDialog";
import DeleteCourseDialog from "@/components/content/DeleteCourseDialog";
import AddUserToCourseDialog from "@/components/content/AddUserToCourseDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, BookOpen, Users, BarChart3, Clock, Edit, Eye, Check, CheckCircle } from "lucide-react";
import CourseCard from "@/components/content/CourseCard";
import {toast} from "sonner"
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { useUser } from "@/contexts/UserContext";
import { Course } from "@/types/backend-api";
import { useAIAssistant } from "@/components/ai-assistant";

const TeacherDashboard: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [moduleCounts, setModuleCounts] = useState<{[courseId: number]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add user dialog state
  const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  
  const router = useRouter();
  const { user } = useUser(); // Get user from context
  const {showAssistant} = useAIAssistant();

  // Function to fetch and refresh courses
  const refreshCourses = async () => {
    if (!user || !user.id) return;
    try {
      setIsLoading(true);
      setError(null);
      const [userCourses, publishedCourses] = await Promise.all([
        apiService.getUnpublishedCourses(user.id),
        apiService.getPublishedCourses(user.id)
      ]);

      const sortedUserCourses = userCourses.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ).slice(0, 5);
      setRecentCourses(sortedUserCourses);

      // Fetch module counts for each course
      const moduleCountPromises = sortedUserCourses.map(async (course) => {
        const count = await apiService.getModuleCountByCourseId(course.id);
        return { courseId: course.id, count };
      });

      const moduleCountResults = await Promise.all(moduleCountPromises);
      const newModuleCounts: {[courseId: number]: number} = {};
      moduleCountResults.forEach(({ courseId, count }) => {
        newModuleCounts[courseId] = count;
      });
      setModuleCounts(newModuleCounts);

      setPublishedCourses(publishedCourses);

    } catch (err) {
      console.error('Error refreshing courses:', err);
    }
  };

  // Fetch courses from backend on component mount, if user is authenticated
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return; // Don't fetch if user is not available
      try {
        setIsLoading(true);
        setError(null);
        await refreshCourses();
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]); // Add user as a dependency

  // Listen for course creation events from AI assistant
  useEffect(() => {
    const handleCourseCreated = (event: CustomEvent) => {
      console.log('📡 Received courseCreated event:', event.detail);
      
      // Refresh the courses list
      refreshCourses();
      
      // Show success toast
      if (event.detail?.course?.title) {
        toast.success("Course Created Successfully!", {
          description: `"${event.detail.course.title}" has been created via AI Assistant.`,
          duration: 5000,
        });
      }
    };

    // Add event listener
    window.addEventListener('courseCreated', handleCourseCreated as EventListener);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('courseCreated', handleCourseCreated as EventListener);
    };
  }, []);

  const handleCourseCreated = (courseData: any) => {
    // Refresh courses from backend after creation
    refreshCourses();

    toast.success("Course Created Successfully!", {
      description: `"${courseData.title}" has been created and is ready for content.`,
      duration: 5000,
    });

    // Redirect to modify-course page
    router.push(`/modify-course?id=${courseData.id}`);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (courseId: number) => {
    try {
      await apiService.deleteCourse(courseId);
      
      // Remove the deleted course from the state immediately
      setRecentCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      
      toast.success("Course Deleted Successfully!", {
        description: `The course has been permanently deleted.`,
        duration: 5000,
      });
    } catch (err) {
      console.error('Error deleting course:', err);
      throw err; // Re-throw to let the dialog handle the error display
    }
  };

  // Add user dialog handlers
  const handleAddTeacher = () => {
    // For management dashboard, we'll use the first course or show a selection dialog
    if (recentCourses.length > 0) {
      setSelectedCourseId(recentCourses[0].id);
      setShowAddTeacherDialog(true);
    } else {
      toast.error("No courses available. Please create a course first.");
    }
  };

  const handleAddStudent = () => {
    // For management dashboard, we'll use the first course or show a selection dialog
    if (recentCourses.length > 0) {
      setSelectedCourseId(recentCourses[0].id);
      setShowAddStudentDialog(true);
    } else {
      toast.error("No courses available. Please create a course first.");
    }
  };

  const handlePreviewCourse = () => {
    // For management dashboard, we'll use the first course or show a selection dialog
    if (recentCourses.length > 0) {
      router.push(`/preview-course?id=${recentCourses[0].id}`);
    } else {
      toast.error("No courses available. Please create a course first.");
    }
  };

  const handleEditCourse = () => {
    // For management dashboard, we'll use the first course or show a selection dialog
    if (recentCourses.length > 0) {
      router.push(`/modify-course?id=${recentCourses[0].id}`);
    } else {
      toast.error("No courses available. Please create a course first.");
    }
  };

  const handleUserAdded = () => {
    // Optionally refresh course data or show updated member count
    // For now, just show success message which is handled in the dialog
  };

  return (
    <DashboardLayout 
      onCreateCourse={() => setIsCreateDialogOpen(true)}
      onAddTeacher={handleAddTeacher}
      onAddStudent={handleAddStudent}
      onPreviewCourse={handlePreviewCourse}
      onEditCourse={handleEditCourse}
    >
      <div className="p-8 space-y-8 bg-background min-h-full">
        {/* Header Section */}
        {/* <div className="text-center md:text-left mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Course Management Dashboard</h1>
          <p className="text-gray-600">Manage your courses and track student progress</p>
        </div> */}

        {/* Quick Stats */}
        {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Total Courses
              </CardTitle>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{recentCourses.length}</div>
              <p className="text-xs text-blue-700">
                Active courses
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Active Students
              </CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">+0</div>
              <p className="text-xs text-green-700">
                Enrolled students
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Analytics</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">Coming</div>
              <p className="text-xs text-purple-700">
                Soon
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Recent Activity</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">Live</div>
              <p className="text-xs text-orange-700">
                Real-time updates
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Recent Courses */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-3xl font-bold text-card-foreground flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-secondary" />
              Recent Courses
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your most recently created courses that are still in draft mode
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2 px-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-muted-foreground font-medium">Loading courses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 text-destructive mb-4 mx-auto">⚠️</div>
                <p className="text-destructive font-medium mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-border text-card-foreground hover:bg-muted transition-colors"
                >
                  Retry
                </Button>
              </div>
            ) : recentCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      id: course.id.toString(),
                      title: course.title,
                      description: course.body || 'No description available',
                      duration: 'N/A',
                      modules: moduleCounts[course.id] || 0,
                      category: 'Course',
                      enrolled: course.studentCount || 0
                    }}
                    isTeacher={true}
                    variant="compact"
                    onPreview={() => router.push(`/preview-course?id=${course.id}`)}
                    onEdit={() => router.push(`/modify-course?id=${course.id}`)}
                    onDelete={() => handleDeleteClick(course)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Create Your First Course</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Get started by creating your first course to manage students and content effectively.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-sm"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                  <Button
                    className="border-border text-card-foreground hover:bg-muted transition-colors"
                    variant="outline"
                    onClick={showAssistant}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create with AI
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Public Courses */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-3xl font-bold text-card-foreground flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-green-600" />
              Public Courses
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your published courses available to students
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2 px-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-muted-foreground font-medium">Loading courses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 text-destructive mb-4 mx-auto">⚠️</div>
                <p className="text-destructive font-medium mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-border text-card-foreground hover:bg-muted transition-colors"
                >
                  Retry
                </Button>
              </div>
            ) : publishedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      id: course.id.toString(),
                      title: course.title,
                      description: course.body || 'No description available',
                      duration: 'N/A',
                      modules: moduleCounts[course.id] || 0,
                      category: 'Course',
                      enrolled: course.studentCount || 0
                    }}
                    isTeacher={true}
                    variant="compact"
                    onPreview={() => router.push(`/preview-course?id=${course.id}`)}
                    // Don't pass onEdit to hide edit functionality for published courses
                    onDelete={() => handleDeleteClick(course)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">No Published Courses</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Publish your courses to make them available to students. Published courses will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Course Dialog */}
        <CreateCourseDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCourseCreated={handleCourseCreated}
        />

        {/* Delete Course Dialog */}
        <DeleteCourseDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          course={courseToDelete}
          onConfirmDelete={handleConfirmDelete}
        />

        {/* Add User Dialogs */}
        {selectedCourseId && (
          <>
            <AddUserToCourseDialog
              open={showAddTeacherDialog}
              onOpenChange={setShowAddTeacherDialog}
              courseId={selectedCourseId}
              userType="teacher"
              onUserAdded={handleUserAdded}
            />
            
            <AddUserToCourseDialog
              open={showAddStudentDialog}
              onOpenChange={setShowAddStudentDialog}
              courseId={selectedCourseId}
              userType="student"
              onUserAdded={handleUserAdded}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;



