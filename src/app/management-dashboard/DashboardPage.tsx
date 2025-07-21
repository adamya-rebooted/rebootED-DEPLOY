'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import TeacherDashboard from './TeacherDashboard'
import StudentDashboard from './StudentDashboard'

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()

  if (!user) {
    // This is a fallback for while the user context is loading.
    // The UserProvider should redirect if the user is not authenticated.
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '3px solid var(--border)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: 'var(--muted-foreground)' }}>Loading dashboard...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (user.role === 'teacher') {
    return (
      <div>
        <TeacherDashboard />
      </div>
    )
  }

  if (user.role === 'student') {
    return (
      <div>
        <StudentDashboard />
      </div>
    )
  }

  // Fallback if the user has an unknown role
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Error</h1>
      <p>Your user role is not recognized. Please contact support.</p>
      <button onClick={() => router.push('/login')}>Go to Login</button>
    </div>
  )
}