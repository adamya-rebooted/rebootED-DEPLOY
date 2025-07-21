'use client'

import React, { useState, useEffect } from "react";
import Layout from "@/components/content/Layout";
import CreateCourseDialog, {
  CourseFormData,
} from "@/components/content/CreateCourseDialog";
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

const TeacherDashboard: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser(); // Get user from context

  // Function to fetch and refresh courses
  const refreshCourses = async () => {
    try {
      const courses = await apiService.getCourses();
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

  const handleCourseCreated = (courseData: CourseFormData) => {
    // Refresh courses from backend after creation
    refreshCourses();

    toast.success("Course Created Successfully!", {
      description: `"${courseData.title}" has been created and is ready for content.`,
      duration: 5000,
    });
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
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">
              Course Management
            </h1>
            <p className="">
              Manage your courses and track student progress
            </p>
          </div>
          <div className="flex gap-2">
           <Button onClick={() => setIsCreateDialogOpen(true)}>
            {/* <Button onClick={() => router.push('/create-course')}> */}
              <Plus className="h-4 w-4 mr-2 " />
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
        <Card className="bg-primary text-white">
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>
              Your most recently created courses
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-muted-foreground">Loading courses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className=" bg-background text-black flex items-center justify-between p-4 border rounded-lg hover:bg-muted/ transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.body || 'No description available'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        className="border-secondary drop-shadow-md border-2"
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/modify-course?id=${course.id}`)}
                      >
                        Edit
                      </Button>
                      <Button 
                        className="!border-red-500 text-red-500 drop-shadow-md"
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
                <h3 className="text-lg mb-2">Create Your First Course</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first course to manage students and content.
                </p>
                <Button className="border-secondary" onClick={() => setIsCreateDialogOpen(true)}>
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
    </Layout>
  );
};

export default TeacherDashboard;
