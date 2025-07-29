'use client'

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/content/Navbar";
import { apiService } from "@/services/api";
import { createClient } from '@/utils/supabase/client';
import { Course, Module } from "@/types/backend-api";
import CourseView from "@/components/content/CourseView";

const TakeCoursePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  // State management
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load course and modules data
  useEffect(() => {
    if (!courseId) {
      setError('Course ID is required');
      setIsLoading(false);
      return;
    }

    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      setCurrentUser(user);

      // Load course details and modules in parallel
      const [courseData, modulesData] = await Promise.all([
        apiService.getCourseById(parseInt(courseId!)),
        apiService.getModulesByCourseId(parseInt(courseId!))
      ]);

      setCourse(courseData);
      setModules(modulesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handleBackToDashboard = () => {
    router.push('/student-dashboard');
  };

  const handleContentUpdate = () => {
    // Refresh data when content is updated to reflect progress changes
    loadData();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {course && (
          <CourseView
            course={course}
            modules={modules}
            isLoading={isLoading}
            error={error}
            showBackButton={true}
            onBackClick={handleBackToDashboard}
            showStudentView={true}
            onContentUpdate={handleContentUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default TakeCoursePage;