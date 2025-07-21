import { NextRequest, NextResponse } from 'next/server'
import { createServer } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/management-dashboard'

  if (code) {
    const supabase = await createServer()
    
    try {
      // Exchange code for session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/login?error=auth_failed`)
      }

      // Get the authenticated user with retry logic
      let user = null
      let userError = null
      
      // Retry getting user up to 3 times to handle timing issues
      for (let i = 0; i < 3; i++) {
        const result = await supabase.auth.getUser()
        user = result.data.user
        userError = result.error
        
        if (user && !userError) {
          break
        }
        
        // Wait a bit before retrying
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      if (userError || !user) {
        console.error('Error getting user after session exchange:', userError)
        return NextResponse.redirect(`${origin}/login?error=user_not_found`)
      }

      // Check if this is a first-time user by calling the backend
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        })
        
        if (backendResponse.status === 404 || backendResponse.status === 401) {
          // User doesn't exist in backend or JWT auth failed, redirect to signup
          return NextResponse.redirect(`${origin}/signup`)
        }
      } catch (error) {
        console.error('Error checking user existence:', error)
        // If we can't check, redirect to signup to be safe
        return NextResponse.redirect(`${origin}/signup`)
      }

      // Add a small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return NextResponse.redirect(`${origin}${next}`)
      
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
    }
  }

  // Return the user to login with an error message if no code
  return NextResponse.redirect(`${origin}/login?error=no_auth_code`)
} 