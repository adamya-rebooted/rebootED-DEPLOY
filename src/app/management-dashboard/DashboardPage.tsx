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
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #1f3a60',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#64748b', fontWeight: '500' }}>Loading dashboard...</p>
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
    <div style={{ 
      padding: '32px', 
      textAlign: 'center', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      minHeight: '100vh', 
      color: '#1e293b',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#dc2626', marginBottom: '12px', fontSize: '24px', fontWeight: '600' }}>Error</h1>
        <p style={{ marginBottom: '24px', color: '#64748b', lineHeight: '1.5' }}>Your user role is not recognized. Please contact support.</p>
        <button
          onClick={() => router.push('/login')}
          style={{
            padding: '12px 28px',
            backgroundColor: '#1f3a60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 2px 8px 0 rgba(31, 58, 96, 0.10)',
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#152a4a';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px 0 rgba(31, 58, 96, 0.15)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1f3a60';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px 0 rgba(31, 58, 96, 0.10)';
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}