'use client';

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'

export default function LoginPage() {
  const { user, signInWithGoogle } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      router.push('/management-dashboard')
      return
    }
  }, [user, router])

  useEffect(() => {
    // Check for error messages from URL params
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'auth_required':
          setError('Please sign in to access your dashboard.')
          break
        case 'session_expired':
          setError('Your session has expired. Please sign in again.')
          break
        default:
          setError('Please sign in to continue.')
      }
    }
  }, [searchParams])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message || 'Google sign in failed')
      }
    } catch (err) {
      setError('Unexpected error during Google sign in.')
    } finally {
      setIsLoading(false)
    }
  }

  // If user is already authenticated, show loading while redirecting
  if (user) {
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
          <p style={{ color: 'var(--muted-foreground)' }}>Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--muted)',
      color: 'var(--text)'
    }}>
      <div style={{
        padding: '40px',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        backgroundColor: 'var(--card)',
        textAlign: 'center',
        minWidth: '400px',
        maxWidth: '500px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          marginBottom: '8px',
          fontSize: '24px',
          fontWeight: '600',
          color: 'var(--card-foreground)'
        }}>
          Welcome to L&D Platform
        </h1>
        <p style={{
          color: 'var(--muted-foreground)',
          marginBottom: '30px',
          fontSize: '14px'
        }}>
          Sign in to access your courses and learning materials
        </p>
        
        {error && (
          <div style={{
            backgroundColor: 'var(--destructive)',
            border: '1px solid var(--destructive)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            color: 'var(--destructive-foreground)',
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: 'var(--muted)',
          borderRadius: '6px',
          fontSize: '14px',
          color: 'var(--text)',
          textAlign: 'left'
        }}>
          <p style={{margin: '0 0 10px 0', fontWeight: 'bold' }}>Phase 2 Status:</p>
          <p style={{margin: '0', fontSize: '12px' }}>
            Now using real Supabase authentication with Google OAuth support.
            <br />
            Use Google to sign in.
          </p>
        </div>
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