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
    <div style={{
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'var(--background)',
      minHeight: '100vh',
      color: 'var(--text)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
      }}>
        <h1 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '2rem' }}>Course Preview</h1>
        <div style={{ display: 'flex', gap: '14px' }}>
          <button
            onClick={handleBackToEdit}
            style={{
              padding: '12px 28px',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 2px 8px 0 rgba(31, 58, 96, 0.10)',
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-foreground)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px 0 rgba(31, 58, 96, 0.15)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--primary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-foreground)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px 0 rgba(31, 58, 96, 0.10)';
            }}
          >
            Back to Edit
          </button>
        </div>
      </div>
      
      {course && (
        <CourseView
          course={course}
          modules={modules}
          isLoading={loading}
          error={error}
          showBackButton={false}
          showStudentView={false}
          onContentUpdate={handleContentUpdate}
        />
      )}
    </div>
  );
} 