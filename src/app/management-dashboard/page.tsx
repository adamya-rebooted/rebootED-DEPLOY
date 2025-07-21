'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import DashboardPage from './DashboardPage';
import { apiService } from '@/services/api';


export default function Page() {
  return <DashboardPage />;
  // const router = useRouter();
  // const [loading, setLoading] = useState(true);
  // const [user, setUser] = useState<any>(null);
  // const [courses, setCourses] = useState<any[]>([]);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   let mounted = true;
  //   async function loadUserAndCourses() {
  //     try {
  //       // Get current user from mock auth
  //       const { data: { user: currentUser }, error: userError } = await mockAuth.getUser();
  //       if (userError || !currentUser) {
  //         router.push('/login?error=auth_required');
  //         return;
  //       }
  //       if (!mounted) return;
  //       setUser(currentUser);
  //       // Get the user ID (username from metadata or ID)
  //       const userId = currentUser.user_metadata?.preferred_username || currentUser.id;
  //       try {
  //         const coursesData = await apiService.getUserCourses(userId);
  //         if (mounted) {
  //           setCourses(coursesData);
  //         }
  //       } catch (coursesError) {
  //         if (mounted) setError('Error loading courses.');
  //       }
  //     } catch (error) {
  //       if (mounted) setError('Unexpected error.');
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   }
  //   loadUserAndCourses();
  //   return () => { mounted = false; };
  // }, [router]);

  // if (loading) {
  //   return (
  //     <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  //       <p>Loading dashboard...</p>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
  //       <p>{error}</p>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return null; // Will redirect to login
  // }

  // // Determine if user is a teacher in any course
  // if (user.role === 'teacher') {
  //   return <TeacherDashboard />;
  // } else {
  //   return <StudentDashboard />;
  // }
  // const isTeacher = courses.some(course => course.role === 'teacher');

  // return isTeacher ? <TeacherDashboard /> : <StudentDashboard />;
} 