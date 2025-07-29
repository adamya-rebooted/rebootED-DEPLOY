'use client'

import React, { useState, useEffect } from "react";
import Navbar from "@/components/content/Navbar";
import CreateCourseDialog from "@/components/content/CreateCourseDialog";
import DeleteCourseDialog from "@/components/content/DeleteCourseDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser(); // Get user from context
  const {showAssistant} = useAIAssistant();

  // Function to fetch and refresh courses
  const refreshCourses = async () => {
    if (!user || !user.id) return;
    try {
      const courses = await apiService.getUserCourses(user.id);
      const sortedCourses = courses.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ).slice(0, 5);
      setRecentCourses(sortedCourses);
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

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 text-center md:text-left">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[var(--primary)]">Course Management</h1>
            <p className="text-[var(--muted-foreground)]">Manage your courses and track student progress</p>
          </div>
          <div className="flex justify-center space-x-4 md:justify-end w-full md:w-auto">
            <Button onClick={showAssistant} className="w-full md:w-auto bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Create Course with AI
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full md:w-auto bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Students
              </CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <CheckCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Course Completion
              </CardTitle>
              <BarChart3 className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                +7% from last month
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Recent Courses */}
        <Card className="bg-[var(--primary)] text-[var(--primary-foreground)]">
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Your most recently created courses
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-[var(--muted-foreground)]">Loading courses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-[var(--destructive)]">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-2 border-[var(--border)] text-[var(--primary)]"
                >
                  Retry
                </Button>
              </div>
            ) : recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-[var(--card)] text-[var(--card-foreground)] flex items-center justify-between p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--primary)]">{course.title}</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {course.body || 'No description available'}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        className="border-[var(--secondary)] drop-shadow-md border-2 text-[var(--secondary)]"
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/modify-course?id=${course.id}`)}
                      >
                        Edit
                      </Button>
                      <Button 
                        className="!border-[var(--destructive)] text-[var(--destructive)] drop-shadow-md"
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClick(course)}
                      >
                        <Trash2 className="h-4 w-4 " />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg mb-2 text-[var(--primary-foreground)]">Create Your First Course</h3>
                <p className="text-[var(--muted-foreground)] mb-4">
                  Get started by creating your first course to manage students and content.
                </p>
                <Button className="border-[var(--secondary)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
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
      </div>
    </>
  );
};

export default TeacherDashboard;
