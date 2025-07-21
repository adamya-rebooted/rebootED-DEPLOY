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
    <div style={{ padding: '32px', textAlign: 'center', background: 'var(--background)', minHeight: '100vh', color: 'var(--text)' }}>
      <h1 style={{ color: 'var(--destructive)', marginBottom: '12px' }}>Error</h1>
      <p style={{ marginBottom: '24px', color: 'var(--muted-foreground)' }}>Your user role is not recognized. Please contact support.</p>
      <button
        onClick={() => router.push('/login')}
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
        Go to Login
      </button>
    </div>
  )
}