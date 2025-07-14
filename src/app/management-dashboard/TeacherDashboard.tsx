'use client'

import React, { useState, useEffect } from "react";
import Layout from "@/components/content/Layout";
import CreateCourseDialog, {
  CourseFormData,
} from "@/components/content/CreateCourseDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {toast} from "sonner"
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Course } from "@/types/backend-api";

const TeacherDashboard: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch courses from backend on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const courses = await apiService.getCourses();
        // Sort by creation date (most recent first) and take the first 3
        const sortedCourses = courses.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ).slice(0, 5);
        setRecentCourses(sortedCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseCreated = (courseData: CourseFormData) => {
    // Refresh courses from backend after creation
    const refreshCourses = async () => {
      try {
        const courses = await apiService.getCourses();
        const sortedCourses = courses.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ).slice(0, 3);
        setRecentCourses(sortedCourses);
      } catch (err) {
        console.error('Error refreshing courses:', err);
      }
    };

    refreshCourses();

    toast.success("Course Created Successfully!", {
      description: `"${courseData.title}" has been created and is ready for content.`,
      duration: 5000,
    });
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
            <Button onClick={() => router.push('/ai-course-generation')}>
              <Plus className="h-4 w-4 mr-2 " />
              AI Course Generation
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentCourses.length}
              </div>
              <p className="text-xs text-muted-foreground">Active courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground">Enrolled learners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                Average completion
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* <CheckCircle className="h-5 w-5 text-green-600" /> */}
              Recently Created Courses
            </CardTitle>
            <CardDescription>Your latest course creations from the backend</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading courses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="justify-between"
                  >
                    <div className="space-y-2">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.body || 'No description available'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Teachers: {course.teacherCount || 0}</span>
                        <span>•</span>
                        <span>Students: {course.studentCount || 0}</span>
                        <span>•</span>
                        <span>Modules: {course.moduleCount || 0}</span>
                      </div>
                    </div>
                    <Button
                      className="mt-2"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/add-modules?id=${course.id}`)}
                    >
                      Modules
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No courses found. Create your first course to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Course Management Dashboard</CardTitle>
            <CardDescription>
              {!isLoading && recentCourses.length > 0
                ? "Great start! Continue building your courses by adding modules and content."
                : "Create your first course to get started with course management."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              {/* <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" /> */}
              <h3 className="text-lg mb-2">
                {!isLoading && recentCourses.length > 0
                  ? "Ready to Add Course Content"
                  : "Create Your First Course"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {!isLoading && recentCourses.length > 0
                  ? "Start adding modules, lessons, and assignments to your courses."
                  : "Click the 'Create Course' button to design your first learning program."}
              </p>
              {!isLoading && recentCourses.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Course Dialog */}
        <CreateCourseDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCourseCreated={handleCourseCreated}
        />
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
