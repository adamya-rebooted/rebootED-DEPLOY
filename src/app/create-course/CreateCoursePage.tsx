'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiService } from '@/services/api';
import { createClient } from '@/utils/supabase/client';

interface ContentBlock {
  id: string;
  type: 'Text' | 'MultipleChoiceQuestion';
  title: string;
  content: string;
  isComplete: boolean;
}

interface Module {
  id: string;
  title: string;
  contentBlocks: ContentBlock[];
}

interface LDUser {
  username: string;
  userType: 'Teacher' | 'Student' | 'Admin';
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [teachers, setTeachers] = useState<LDUser[]>([]);
  const [students, setStudents] = useState<LDUser[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!courseTitle.trim() || !courseDescription.trim()) {
        throw new Error('Course title and description are required');
      }

      // Get current user
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to create a course');
      }

      // Validate that all teacher/student usernames exist
      const allUsernames = [...teachers.map(t => t.username), ...students.map(s => s.username)];
      if (allUsernames.length > 0) {
        const validationResult = await apiService.validateUsernames(allUsernames);
        const missingUsers = allUsernames.filter(username => !validationResult[username]);

        if (missingUsers.length > 0) {
          throw new Error(`These users don't exist: ${missingUsers.join(', ')}`);
        }
      }

      // Create the course
      const courseData = await apiService.createCourse({
        title: courseTitle.trim(),
        body: courseDescription.trim()
      });

      const courseId = courseData.id;

      // Create modules if any
      if (modules.length > 0) {
        for (const moduleItem of modules) {
          await apiService.createModule({
            title: moduleItem.title,
            body: '',
            courseId: courseId
          });
        }
      }

      // Add teachers to the course
      if (teachers.length > 0) {
        const teacherUsernames = teachers.map(t => t.username);
        await apiService.addTeachersToCourse(courseId, teacherUsernames);
      }

      // Add students to the course
      if (students.length > 0) {
        const studentUsernames = students.map(s => s.username);
        await apiService.addStudentsToCourse(courseId, studentUsernames);
      }

      // Add current user as teacher if not already added
      const currentUsername = user.user_metadata?.preferred_username;
      const currentUserIsTeacher = teachers.some(t => t.username === currentUsername);
      if (!currentUserIsTeacher && currentUsername) {
        await apiService.addTeachersToCourse(courseId, [currentUsername]);
      }

      // Success! Redirect to modify course page for the new course
      router.push(`/modify-course?id=${courseId}`);

    } catch (err) {
      console.error('Error creating course:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/management-dashboard');
  };

  const handlePreview = () => {
    router.push('/preview-course');
  };

  const addTeacher = () => {
    if (newTeacherUsername.trim()) {
      setTeachers([...teachers, { username: newTeacherUsername.trim(), userType: 'Teacher' }]);
      setNewTeacherUsername('');
    }
  };

  const addStudent = () => {
    if (newStudentUsername.trim()) {
      setStudents([...students, { username: newStudentUsername.trim(), userType: 'Student' }]);
      setNewStudentUsername('');
    }
  };

  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const addModule = () => {
    if (newModuleTitle.trim()) {
      const newModule: Module = {
        id: `module-${Date.now()}`,
        title: newModuleTitle.trim(),
        contentBlocks: []
      };
      setModules([...modules, newModule]);
      setNewModuleTitle('');
    }
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  return (
    <div style={{
      padding: '32px 0',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'var(--background)',
      minHeight: '100vh',
      color: 'var(--text)'
    }}>
      <div style={{
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        boxShadow: '0 4px 24px 0 rgba(31, 58, 96, 0.08)',
        borderRadius: '16px',
        padding: '40px 32px',
        border: '1px solid var(--border)',
      }}>
        <h1 style={{ marginBottom: '24px', color: 'var(--primary)', fontWeight: 700, fontSize: '2rem' }}>Create New Course</h1>
        <form onSubmit={handleSubmit} style={{
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '28px',
          background: 'var(--card)',
          boxShadow: '0 2px 8px 0 rgba(31, 58, 96, 0.06)'
        }}>
          {/* Basic Course Information */}
          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '7px', fontWeight: 'bold', color: 'var(--primary)' }}>
              Course Title:
            </label>
            <input
              type="text"
              id="title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--input)',
                borderRadius: '8px',
                backgroundColor: 'var(--background)',
                color: 'var(--text)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              placeholder="Enter course title"
            />
          </div>
          <div style={{ marginBottom: '22px' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '7px', fontWeight: 'bold', color: 'var(--primary)' }}>
              Course Description:
            </label>
            <textarea
              id="description"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              required
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--input)',
                borderRadius: '8px',
                resize: 'vertical',
                backgroundColor: 'var(--background)',
                color: 'var(--text)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              placeholder="Enter course description"
            />
          </div>
          {/* Teachers Section */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>
              Teachers (L&D Users):
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={newTeacherUsername}
                onChange={(e) => setNewTeacherUsername(e.target.value)}
                placeholder="Enter teacher username"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid var(--input)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
              />
              <button
                type="button"
                onClick={addTeacher}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                Add Teacher
              </button>
            </div>
            <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px', background: 'var(--muted)' }}>
              {teachers.map((teacher, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', margin: '2px 0', borderRadius: '6px' }}>
                  <span>{teacher.username} ({teacher.userType})</span>
                  <button
                    type="button"
                    onClick={() => removeTeacher(index)}
                    style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)', border: 'none', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Students Section */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>
              Students (Employee Users):
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={newStudentUsername}
                onChange={(e) => setNewStudentUsername(e.target.value)}
                placeholder="Enter student username"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid var(--input)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
              />
              <button
                type="button"
                onClick={addStudent}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                Add Student
              </button>
            </div>
            <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px', background: 'var(--muted)' }}>
              {students.map((student, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', margin: '2px 0', borderRadius: '6px' }}>
                  <span>{student.username} ({student.userType})</span>
                  <button
                    type="button"
                    onClick={() => removeStudent(index)}
                    style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)', border: 'none', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Modules Section */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>
              Course Modules:
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Enter module title"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid var(--input)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
              />
              <button
                type="button"
                onClick={addModule}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                Add Module
              </button>
            </div>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px', background: 'var(--muted)' }}>
              {modules.map((module, index) => (
                <div key={module.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: 'var(--card)', margin: '2px 0', borderRadius: '6px', border: '1px solid var(--input)' }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{module.title}</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginLeft: '10px' }}>
                      ({module.contentBlocks.length} content blocks)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeModule(index)}
                    style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {modules.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: '20px' }}>
                  No modules added yet. After creating the course, you can add content blocks (Text and Questions) to each module.
                </div>
              )}
            </div>
          </div>
          {/* Error Display */}
          {error && (
            <div style={{
              marginBottom: '15px',
              padding: '12px',
              backgroundColor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              border: '1px solid var(--destructive)',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '15px',
            }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 28px',
                backgroundColor: isSubmitting ? 'var(--muted-foreground)' : 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 2px 8px 0 rgba(31, 58, 96, 0.10)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => {
                if (!isSubmitting) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-foreground)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px 0 rgba(31, 58, 96, 0.15)';
                }
              }}
              onMouseOut={e => {
                if (!isSubmitting) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--primary)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-foreground)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px 0 rgba(31, 58, 96, 0.10)';
                }
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={handlePreview}
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
              Preview Course
            </button>
            <button
              type="button"
              onClick={handleCancel}
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
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 