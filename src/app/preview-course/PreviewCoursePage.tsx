'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { createClient } from '@/utils/supabase/client';
import { Course, Module } from '@/types/backend-api';
import CourseView from '@/components/content/CourseView';

export default function PreviewCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!courseId) {
      setError('No course ID provided');
      setLoading(false);
      return;
    }

    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      setCurrentUser(user);

      // Fetch course basic info
      const courseData = await apiService.getCourseById(parseInt(courseId!));
      setCourse(courseData);

      // Fetch modules for this course
      const modulesData = await apiService.getModulesByCourseId(parseInt(courseId!));
      setModules(modulesData);

    } catch (err) {
      console.error('Error loading course data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEdit = () => {
    router.push(`/modify-course?id=${courseId}`);
  };

  const handleContentUpdate = () => {
    // Refresh data when content is updated
    loadCourseData();
  };

  return (
    <div style={{ height: '100vh', background: 'var(--background)' }}>
      {course && (
        <CourseView
          course={course}
          modules={modules}
          isLoading={loading}
          error={error}
          showBackButton={true}
          onBackClick={handleBackToEdit}
          showStudentView={true}
          onContentUpdate={handleContentUpdate}
        />
      )}
    </div>
  );
} 