'use client'

import React from "react";
import Navbar from "@/components/content/Navbar";
import CourseCard, { Course } from "@/components/content/CourseCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
} from "lucide-react";

// Study-related background images for courses
const studyImages = [
  // "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop&crop=center", // Books and study materials
  // "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop&crop=center", // Laptop and notebook
  // "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=200&fit=crop&crop=center", // Study desk with books
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&crop=center", // Open book with coffee
  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop&crop=center", // Library books
  "https://images.unsplash.com/photo-1472173148041-00294f0814a2?w=400&h=200&fit=crop&crop=center", // Computer and books
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=200&fit=crop&crop=center", // Stack of books
  "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=400&h=200&fit=crop&crop=center", // Study materials and pen
];

// Function to get a consistent image for each course based on its ID
const getCourseImage = (courseId: string) => {
  const index = parseInt(courseId) % studyImages.length;
  return studyImages[index];
};

// Mock data for student courses
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Digital Marketing Fundamentals",
    description:
      "Learn the basics of digital marketing including SEO, social media, and content strategy.",
    duration: "4 weeks",
    modules: 8,
    progress: 75,
    status: "in-progress",
    dueDate: "2024-02-15",
    category: "Marketing",
  },
  {
    id: "2",
    title: "Data Analytics for Business",
    description:
      "Master data analysis techniques and tools to make informed business decisions.",
    duration: "6 weeks",
    modules: 12,
    progress: 100,
    status: "completed",
    category: "Analytics",
  },
  {
    id: "3",
    title: "Leadership Communication",
    description:
      "Develop effective communication skills for leadership roles and team management.",
    duration: "3 weeks",
    modules: 6,
    progress: 0,
    status: "not-started",
    dueDate: "2024-03-01",
    category: "Leadership",
  },
  {
    id: "4",
    title: "Project Management Essentials",
    description:
      "Learn project management methodologies and tools to deliver successful projects.",
    duration: "5 weeks",
    modules: 10,
    progress: 30,
    status: "in-progress",
    dueDate: "2024-02-28",
    category: "Management",
  },
];

const StudentDashboard: React.FC = () => {
  const filteredCourses = mockCourses;

  const handleCourseAction = (course: Course) => {
    console.log("Opening course:", course.title);
    // Navigate to course details page
  };

  // Calculate statistics
  const totalCourses = mockCourses.length;
  const completedCourses = mockCourses.filter(
    (c) => c.status === "completed",
  ).length;
  const inProgressCourses = mockCourses.filter(
    (c) => c.status === "in-progress",
  ).length;
  const averageProgress = Math.round(
    mockCourses.reduce((sum, course) => sum + (course.progress || 0), 0) /
      totalCourses,
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--background)] max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--primary)]">My Learning Dashboard</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">Track your progress and continue your professional development journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-5 w-5 text-[var(--primary-foreground)]/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-xs text-[var(--primary-foreground)]/80">Assigned to you</p>
            </CardContent>
          </Card>
          <Card className="bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-5 w-5 text-[var(--secondary-foreground)]/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCourses}</div>
              <p className="text-xs text-[var(--secondary-foreground)]/80">Courses finished</p>
            </CardContent>
          </Card>
          {/* <Card className="bg-[var(--muted-foreground)] text-[var(--primary-foreground)] shadow-md"> */}
          <Card className="bg-slate-400/80 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-sm border border-slate-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-5 w-5 text-[var(--primary-foreground)]/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCourses}</div>
              <p className="text-xs text-[var(--primary-foreground)]/80">Currently learning</p>
            </CardContent>
          </Card>
          <Card className="bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <TrendingUp className="h-5 w-5 text-[var(--accent-foreground)]/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress}%</div>
              <p className="text-xs text-[var(--accent-foreground)]/80">Across all courses</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        {/* <Card className="bg-white/90 shadow border border-[#e3e8f0]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#223366]">
              <Target className="h-5 w-5 text-[#3b82f6]" />
              Overall Learning Progress
            </CardTitle>
            <CardDescription className="text-[#64748b]">
              Your progress across all assigned courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#223366] font-medium">Completion Rate</span>
                <span className="text-[#223366] font-semibold">{averageProgress}%</span>
              </div>
              <Progress value={averageProgress} className="h-3 bg-[#eaf1fb]" />
              <div className="flex justify-between text-xs text-[#64748b]">
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
            <h2 className="text-2xl font-bold text-[var(--text)]">My Courses</h2>
            <div className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer transition-colors">
              <span className="text-sm">View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group h-64"
                  onClick={() => handleCourseAction(course)}
                >
                  {/* Background Image Section */}
                  <div
                    className="h-3/5 bg-cover bg-center bg-no-repeat relative"
                    style={{
                      backgroundImage: `url(${getCourseImage(course.id)})`,
                    }}
                  >
                    {/* Dark overlay for better badge visibility */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        className={
                          course.status === "completed"
                            ? "bg-green-500/90 text-white border-0"
                            : course.status === "in-progress"
                            ? "bg-blue-500/90 text-white border-0"
                            : "bg-gray-500/90 text-white border-0"
                        }
                      >
                        {course.status === "completed"
                          ? "Completed"
                          : course.status === "in-progress"
                          ? "In Progress"
                          : "Not Started"}
                      </Badge>
                    </div>
                  </div>

                  {/* White Bottom Section with Course Info */}
                  <div className="h-2/5 bg-white/70 p-4 flex flex-col justify-center">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        {/* <p className="text-sm text-gray-600 mb-2"> */}
                          {/* By Mr. Raj Mehta */}
                        {/* </p> */}
                      </div>

                      {/* Progress Bar */}
                      {course.progress !== undefined && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-700 mb-1">
                            <span>Progress</span>
                            <span className="font-medium text-gray-900">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-[var(--primary)] h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Course Details */}
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{course.duration}</span>
                        <span>•</span>
                        <span>{course.modules} modules</span>
                        {course.dueDate && (
                          <>
                            <span>•</span>
                            <span>Due: {new Date(course.dueDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-[var(--card)] border-2 border-[var(--border)]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-[var(--primary)] mb-4" />
                <h3 className="text-lg font-medium mb-2 text-[var(--primary)]">No courses found</h3>
                <p className="text-[var(--muted-foreground)] text-center">
                  You haven't been assigned any courses yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
