'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { backendApiClient } from '@/utils/api/backend-client'

export default function SignupPage() {
  const router = useRouter()
  // const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>('student')
  const [username, setUsername] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get the current user from Supabase
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user || error) {
        router.push('/login?error=auth_required')
        return
      }

      // Pre-fill username from email
      if (user.email) {
        const defaultUsername = user.email.split('@')[0]
        setUsername(defaultUsername)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Authentication required')
      }

      if (!user.email) {
        throw new Error('User email is required')
      }

      // Create user in backend with selected role
      // const userType = selectedRole === 'teacher' ? 'LDUser' : 'EmployeeUser'

      switch (selectedRole) {
        case 'teacher':
          await backendApiClient.createTeacher({
            username: username.trim(),
            email: user.email
          });
          break;
        case 'student':
          await backendApiClient.createStudent({
            username: username.trim(),
            email: user.email
          });
          break;
        default:
          throw new Error('Invalid role selected');

      }



      // Update Supabase user metadata with the selected role
      await supabase.auth.updateUser({
        data: { role: selectedRole }
      })

      // Redirect to dashboard
      router.push('/management-dashboard')

    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--muted)',
      color: 'var(--text)'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        backgroundColor: 'var(--card)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '8px',
            color: 'var(--card-foreground)'
          }}>
            Complete Your Signup
          </h2>
          <p style={{
            color: 'var(--muted-foreground)',
            fontSize: '14px'
          }}>
            Choose your role and username
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: 'var(--card-foreground)'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '12px',
              color: 'var(--card-foreground)'
            }}>
              I am a:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '12px',
                border: `1px solid ${selectedRole === 'student' ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '6px',
                backgroundColor: selectedRole === 'student' ? 'var(--accent)' : 'transparent'
              }}>
                <input
                  type="radio"
                  value="student"
                  checked={selectedRole === 'student'}
                  onChange={() => setSelectedRole('student')}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>
                  Student - I want to take courses
                </span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '12px',
                border: `1px solid ${selectedRole === 'teacher' ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '6px',
                backgroundColor: selectedRole === 'teacher' ? 'var(--accent)' : 'transparent'
              }}>
                <input
                  type="radio"
                  value="teacher"
                  checked={selectedRole === 'teacher'}
                  onChange={() => setSelectedRole('teacher')}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>
                  Teacher - I want to create and manage courses
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div style={{
              color: 'var(--destructive-foreground)',
              backgroundColor: 'var(--destructive)',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              border: '1px solid var(--destructive)'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: isSubmitting ? 'var(--muted)' : 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Signup'}
          </button>
        </form>
      </div>
    </div>
  )
} 