'use client'

import React, {useState, useEffect} from "react";
import DashboardLayout from "@/components/content/DashboardLayout";
import CourseCard from "@/components/content/CourseCard";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { BookOpen,Clock, Trophy, TrendingUp, Target, Users } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { apiService } from '@/services/api';
import { UserCourse } from "@/types/backend-api";
import { useRouter } from "next/navigation";



const StudentDashboard: React.FC = () => {
  const [recentCourses, setRecentCourses] = React.useState<UserCourse[]>([]);
  const [moduleCounts, setModuleCounts] = React.useState<{[courseId: number]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user} = useUser();
  const router = useRouter();

  const handleCourseAction = (course: UserCourse) => {
    console.log("Opening course:", course.title);
    // Navigate to take-course page with course ID
    router.push(`/take-course?id=${course.id}`);
  };

  const refreshCourses = async () => {
    if (!user || !user.id) return;
    try {
      const courses = await apiService.getUserCourses(user.id);
      console.log('getUserCourses returned:', courses);
      console.log('Number of courses:', courses.length);
      console.log('First course structure:', courses[0]);
      const sortedCourses = courses.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ).slice(0, 5);
      setRecentCourses(sortedCourses);

      // Fetch module counts for each course
      const moduleCountPromises = sortedCourses.map(async (course) => {
        const count = await apiService.getModuleCountByCourseId(course.id);
        return { courseId: course.id, count };
      });

      const moduleCountResults = await Promise.all(moduleCountPromises);
      const newModuleCounts: {[courseId: number]: number} = {};
      moduleCountResults.forEach(({ courseId, count }) => {
        newModuleCounts[courseId] = count;
      });
      setModuleCounts(newModuleCounts);
    } catch (err) {
      console.error('Error refreshing courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    }
  };

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

  // Calculate statistics
  const totalCourses = recentCourses.length;
  const completedCourses = recentCourses.filter(
    (c) => (c.progress || 0) >= 100,
  ).length;
  const inProgressCourses = recentCourses.filter(
    (c) => (c.progress || 0) > 0 && (c.progress || 0) < 100,
  ).length;
  const averageProgress = totalCourses > 0 ? Math.round(
    recentCourses.reduce((sum, course) => sum + (course.progress || 0), 0) /
      totalCourses,
  ) : 0;

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and continue your professional development journey</p>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-[#1f3a60]/5 to-[#1f3a60]/10 border-[#1f3a60]/20 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#1f3a60]">Total Courses</CardTitle>
              <BookOpen className="h-5 w-5 text-[#1f3a60]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1f3a60]">{totalCourses}</div>
              <p className="text-xs text-[#1f3a60]/70">Assigned to you</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
              <Trophy className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{completedCourses}</div>
              <p className="text-xs text-green-700">Courses finished</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">In Progress</CardTitle>
              <Clock className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{inProgressCourses}</div>
              <p className="text-xs text-purple-700">Currently learning</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Avg. Progress</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{averageProgress}%</div>
              <p className="text-xs text-orange-700">Across all courses</p>
            </CardContent>
          </Card>
        </div> */}

        {/* Progress Overview */}
        {/* <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Target className="h-5 w-5 text-[#1f3a60]" />
              Overall Learning Progress
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Your progress across all assigned courses
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Completion Rate</span>
                <span className="text-gray-800 font-semibold text-lg">{averageProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#1f3a60] to-[#152a4a] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${averageProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {completedCourses}/{totalCourses} courses completed
                </span>
                <span>{inProgressCourses} in progress</span>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Courses Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
            <div className="flex items-center gap-2 text-gray-600 hover:text-[#1f3a60] cursor-pointer transition-colors">
              {/* <span className="text-sm font-medium">View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg> */}
            </div>
          </div>
          {isLoading ? (
            <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a60] mb-4"></div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Loading courses...</h3>
                <p className="text-gray-600 text-center">
                  Please wait while we fetch your courses.
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-gradient-to-br from-white to-gray-50 border-red-200 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-12 w-12 text-red-500 mb-4">⚠️</div>
                <h3 className="text-lg font-semibold mb-2 text-red-600">Error loading courses</h3>
                <p className="text-gray-600 text-center mb-4">
                  {error}
                </p>
                <button
                  onClick={() => {
                    setError(null);
                    refreshCourses();
                  }}
                  className="px-6 py-2 bg-[#1f3a60] text-white rounded-md hover:bg-[#152a4a] transition-colors font-medium"
                >
                  Try Again
                </button>
              </CardContent>
            </Card>
          ) : recentCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCourses.map((course) => (
                <div key={course.id} onClick={() => handleCourseAction(course)}>
                  <CourseCard
                    course={{
                      id: course.id.toString(),
                      title: course.title,
                      description: course.body || "No description available",
                      duration: "Self-paced",
                      modules: moduleCounts[course.id] || 0,
                      progress: course.progress,
                      category: course.role === 'teacher' ? 'Teaching' : 'Learning',
                    }}
                    isTeacher={course.role === 'teacher'}
                    variant="compact"
                    onAction={(courseData) => {
                      // Convert back to UserCourse format for the handler
                      const userCourse: UserCourse = {
                        id: parseInt(courseData.id),
                        title: courseData.title,
                        body: courseData.description,
                        role: courseData.category === 'Teaching' ? 'teacher' : 'student',
                        progress: courseData.progress,
                        createdAt: course.createdAt, // Use the original course data
                      };
                      handleCourseAction(userCourse);
                    }}
                    onPreview={() => router.push(`/take-course?id=${course.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[#1f3a60]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-[#1f3a60]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">No courses found</h3>
                <p className="text-gray-600 text-center max-w-md">
                  You haven't been assigned any courses yet. Contact your instructor to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
