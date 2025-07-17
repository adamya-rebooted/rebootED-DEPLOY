'use client';

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'

export default function LoginPage() {
  const { user, signIn } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: signInError } = await signIn(username, password)
      
      if (signInError) {
        setError(signInError.message)
      } else if (data.user) {
        // Successful login - redirect to dashboard
        router.push('/management-dashboard')
      }
    } catch (err) {
      setError('Unexpected error during sign in. Please try again.')
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
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: 'var(--card-foreground)'
            }}>
              Username:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--input)',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: 'var(--background)',
                color: 'var(--text)',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your username"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: 'var(--card-foreground)'
            }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--input)',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: 'var(--background)',
                color: 'var(--text)',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: isLoading ? 'var(--muted-foreground)' : 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {isLoading ? (
              <>
                <div style={{ 
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  animation: 'spin 1s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: 'var(--muted)',
          borderRadius: '6px',
          fontSize: '14px',
          color: 'var(--text)',
          textAlign: 'left'
        }}>
          <p style={{margin: '0 0 px 0', fontWeight: 'bold' }}>Test Users:</p>
          <div style={{display: 'flex', gap: '12px', fontSize: '11px'}}>
            <p style={{fontWeight: 'bold' }}>Teachers:</p>
            <p >teacher1, teacher2</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px'}}>
            <p style={{ fontWeight: 'bold' }}>Students:</p>
            <p style={{ }}>student1, student2, student3</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px'}}>
            <p style={{ fontWeight: 'bold' }}>Password:</p>
            <p style={{ }}>Use any password</p>
          </div>        
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