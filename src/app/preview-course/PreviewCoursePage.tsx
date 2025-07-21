'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { createClient } from '@/utils/supabase/client';
import { Course, Module } from '@/types/backend-api';
import ContentBlockList from '@/components/content/ContentBlockList';
import ContentCreator from '@/components/content/ContentCreator';

export default function PreviewCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

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

      // Auto-select the first module if available
      if (modulesData.length > 0) {
        setSelectedModuleId(modulesData[0].id);
      }

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

  const handlePublishCourse = () => {
    alert('Publishing functionality coming soon!');
    router.push('/management-dashboard');
  };

  const handleBackToDashboard = () => {
    router.push('/management-dashboard');
  };

  const handleModuleClick = (moduleId: number) => {
    setSelectedModuleId(selectedModuleId === moduleId ? null : moduleId);
  };

  if (loading) {
    return (
      <div style={{
        padding: '32px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'var(--background)',
        minHeight: '100vh',
        color: 'var(--text)',
        textAlign: 'center',
      }}>
        <p>Loading course data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '32px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'var(--background)',
        minHeight: '100vh',
        color: 'var(--text)',
        textAlign: 'center',
      }}>
        <div style={{
          border: '1px solid var(--destructive)',
          borderRadius: '12px',
          padding: '28px',
          backgroundColor: 'var(--muted)',
          marginBottom: '24px',
          boxShadow: '0 2px 8px 0 rgba(31, 58, 96, 0.06)'
        }}>
          <h2 style={{ color: 'var(--destructive)', marginBottom: '12px' }}>Error</h2>
          <p style={{ marginBottom: '24px' }}>{error}</p>
          <button
            onClick={handleBackToDashboard}
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
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
          <button
            onClick={handlePublishCourse}
            style={{
              padding: '12px 28px',
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
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
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--secondary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--secondary-foreground)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px 0 rgba(31, 58, 96, 0.10)';
            }}
          >
            Publish Course
          </button>
          <button
            onClick={handleBackToDashboard}
            style={{
              padding: '12px 28px',
              backgroundColor: 'var(--muted-foreground)',
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
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--destructive)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--destructive-foreground)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px 0 rgba(31, 58, 96, 0.15)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--muted-foreground)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-foreground)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px 0 rgba(31, 58, 96, 0.10)';
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Left Column - Course Overview and Modules */}
        <div style={{ flex: '0 0 400px' }}>
          {course && (
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '28px',
              marginBottom: '24px',
              backgroundColor: 'var(--card)',
              boxShadow: '0 2px 8px 0 rgba(31, 58, 96, 0.06)'
            }}>
              <h2 style={{ marginBottom: '14px', color: 'var(--primary)' }}>{course.title}</h2>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '24px' }}>{course.body}</p>
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--accent)',
                borderRadius: '8px',
                border: '1px solid var(--accent)',
                marginBottom: '24px',
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-foreground)' }}>Preview Mode</h4>
                <p style={{ margin: '0', fontSize: '15px', color: 'var(--accent-foreground)' }}>
                  This is how your course appears to students. Content is fully interactive.
                </p>
              </div>
              <div>
                <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>Course Modules ({modules.length})</h3>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: '18px', fontSize: '15px' }}>
                  Click on a module to explore its content
                </p>
                {modules.length > 0 ? (
                  <div>
                    {modules.map((module, index) => (
                      <div key={module.id} style={{
                        padding: '16px',
                        border: '1px solid var(--input)',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        backgroundColor: selectedModuleId === module.id ? 'var(--secondary)' : 'var(--background)',
                        color: selectedModuleId === module.id ? 'var(--secondary-foreground)' : 'var(--text)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: selectedModuleId === module.id ? 600 : 400,
                        boxShadow: selectedModuleId === module.id ? '0 2px 8px 0 rgba(31, 58, 96, 0.10)' : 'none',
                      }}
                        onClick={() => handleModuleClick(module.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: selectedModuleId === module.id ? 'var(--secondary-foreground)' : 'var(--primary)' }}>{index + 1}. {module.title}</strong>
                            {module.body && (
                              <p style={{ margin: '5px 0 0 0', color: 'var(--muted-foreground)', fontSize: '15px' }}>
                                {module.body}
                              </p>
                            )}
                          </div>
                          <span style={{
                            color: 'var(--accent)',
                            fontSize: '20px',
                            transform: selectedModuleId === module.id ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            marginLeft: '12px',
                          }}>
                            ▶
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>No modules available</p>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Right Column - Content Blocks */}
        <div style={{ flex: 1 }}>
          {selectedModuleId ? (
            <ContentBlockList
              moduleId={selectedModuleId}
              moduleName={modules.find(m => m.id === selectedModuleId)?.title}
              isInteractive={true}
              onContentUpdate={loadCourseData}
            />
          ) : (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              border: '2px dashed var(--input)',
              borderRadius: '12px',
              color: 'var(--muted-foreground)',
              backgroundColor: 'var(--muted)'
            }}>
              <h3 style={{ margin: '0 0 12px 0' }}>Explore Course Content</h3>
              <p style={{ margin: 0 }}>
                Select a module from the left panel to start learning. You can read text content, answer questions, and track your progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 