'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import { Course, Module } from '@/types/backend-api';
import ContentBlockList from '@/components/content/ContentBlockList';

export default function PreviewCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');
  const { user, loading: authLoading } = useUser();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  useEffect(() => {
    if (!courseId) {
      setError('No course ID provided');
      setLoading(false);
      return;
    }

    loadCourseData();
  }, [courseId, user, authLoading]);

  const loadCourseData = async () => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // If no user, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

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

  // Show loading while auth is loading or data is loading
  if (authLoading || loading) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        color: '#171717',
        textAlign: 'center'
      }}>
        <p>Loading course data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        color: '#171717',
        textAlign: 'center'
      }}>
        <div style={{
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fff5f5',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Error</h2>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <button
            onClick={handleBackToDashboard}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      color: '#171717'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1>Course Preview</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleBackToEdit}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Edit
          </button>
          <button
            onClick={handlePublishCourse}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Publish Course
          </button>
          <button
            onClick={handleBackToDashboard}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Left Column - Course Overview and Modules */}
        <div style={{ flex: '0 0 400px' }}>
          {course && (
            <div style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              backgroundColor: '#f8f9fa'
            }}>
                      <h2 style={{ marginBottom: '10px', color: '#171717' }}>{course.title}</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>{course.body}</p>
              
              <div style={{
                padding: '15px',
                backgroundColor: '#e7f3ff',
                borderRadius: '4px',
                border: '1px solid #bee5eb',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>Preview Mode</h4>
                <p style={{ margin: '0', fontSize: '14px', color: '#0c5460' }}>
                  This is how your course appears to students. Content is fully interactive.
                </p>
              </div>

              <div>
                <h3 style={{ marginBottom: '10px' }}>Course Modules ({modules.length})</h3>
                <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
                  Click on a module to explore its content
                </p>
                
                {modules.length > 0 ? (
                  <div>
                    {modules.map((module, index) => (
                      <div key={module.id} style={{
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        backgroundColor: selectedModuleId === module.id ? '#e3f2fd' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleModuleClick(module.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: '#171717' }}>{index + 1}. {module.title}</strong>
                            {module.body && (
                              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                                {module.body}
                              </p>
                            )}
                          </div>
                          <span style={{
                            color: '#007cba',
                            fontSize: '18px',
                            transform: selectedModuleId === module.id ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            marginLeft: '10px'
                          }}>
                            ▶
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No modules available</p>
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
              moduleTitle={modules.find(m => m.id === selectedModuleId)?.title}
              isInteractive={true}
              onContentUpdate={loadCourseData}
            />
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              border: '2px dashed #dee2e6',
              borderRadius: '8px',
              color: '#6c757d',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Explore Course Content</h3>
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