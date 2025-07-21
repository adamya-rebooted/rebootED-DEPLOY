'use client'

import React, { useState } from "react";
import Navbar from "@/components/content/Navbar";
import CourseCard, { Course } from "@/components/content/CourseCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Trophy,
  Target,
  Search,
  Filter,
  TrendingUp,
} from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <Card className="bg-[var(--muted-foreground)] text-[var(--primary-foreground)] shadow-md">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-[var(--primary)] font-semibold">My Courses</h2>
          </div>
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className={
                    `transition-all duration-200 shadow-md border-2 border-[var(--border)] bg-[var(--card)] hover:shadow-lg hover:border-[var(--primary)] rounded-xl group`
                  }
                >
                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            course.status === "completed"
                              ? "default"
                              : course.status === "in-progress"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            course.status === "completed"
                              ? "bg-green-500 text-white"
                              : course.status === "in-progress"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-300 text-gray-700"
                          }
                        >
                          {course.status === "completed"
                            ? "Completed"
                            : course.status === "in-progress"
                            ? "In Progress"
                            : "Not Started"}
                        </Badge>
                        <span className="text-xs text-[var(--muted-foreground)]">{course.category}</span>
                      </div>
                      <CardTitle className="text-lg text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-[var(--muted-foreground)]">
                        {course.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-sm mt-3">
                      <span className="text-[var(--muted-foreground)]">{course.duration}</span>
                      <span className="text-[var(--muted-foreground)]">{course.modules} modules</span>
                      {course.dueDate && (
                        <span className="text-xs text-[var(--muted-foreground)]">Due: {new Date(course.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                        <span>Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2 bg-[var(--muted)]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-[var(--card)] border-2 border-[var(--border)]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-[var(--primary)] mb-4" />
                <h3 className="text-lg font-medium mb-2 text-[var(--primary)]">No courses found</h3>
                <p className="text-[var(--muted-foreground)] text-center">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't been assigned any courses yet."}
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
