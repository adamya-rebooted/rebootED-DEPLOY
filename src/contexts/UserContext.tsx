'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { backendApiClient } from '@/utils/api/backend-client';

// Real Supabase user type
export interface RealUser {
  id: string;
  email: string;
  role: 'teacher' | 'student' | null;
  user_metadata?: {
    full_name?: string;
    preferred_username?: string;
  };
}

interface UserContextType {
  user: RealUser | null;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  getUser: () => Promise<{ data: any; error: any }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RealUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // Convert Supabase user to our RealUser format
  const convertSupabaseUser = useCallback(async (supabaseUser: User): Promise<RealUser> => {
    const startTime = performance.now();
    const timestamp = new Date().toISOString();
    const callId = Math.random().toString(36).substring(2, 8);
    
    console.log(`[AUTH_STATE] ${timestamp} - Converting Supabase user: ${supabaseUser.id}`);
    console.log(`[AUTH_DETAILED] ${timestamp} - convertSupabaseUser STARTED (call ID: ${callId})`);
    console.log(`[AUTH_DETAILED] ${timestamp} - Current URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`);
    console.log(`[AUTH_DETAILED] ${timestamp} - User agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`);
    console.log(`[AUTH_DETAILED] ${timestamp} - Document visibility: ${typeof document !== 'undefined' ? document.visibilityState : 'N/A'}`);
    console.log(`[AUTH_DETAILED] ${timestamp} - Window focused: ${typeof document !== 'undefined' ? document.hasFocus() : 'N/A'}`);
    
    // Skip backend call if user is on signup page (they're creating their backend profile)
    if (typeof window !== 'undefined' && window.location.pathname === '/signup') {
      console.log(`[AUTH_STATE] ${timestamp} - On signup page, skipping backend call`);
      const result = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: (supabaseUser.user_metadata?.role as 'teacher' | 'student') || null,
        user_metadata: {
          full_name: supabaseUser.user_metadata?.full_name,
          preferred_username: supabaseUser.user_metadata?.preferred_username,
        }
      };
      console.log(`[AUTH_DETAILED] ${timestamp} - convertSupabaseUser COMPLETED (call ID: ${callId}) - signup path`);
      return result;
    }
    
    try {
      // Try to get role from backend first
      console.log(`[AUTH_STATE] ${timestamp} - Getting session for backend API call`);
      console.log(`[AUTH_DETAILED] ${timestamp} - About to call supabase.auth.getSession()`);
      
      const sessionStartTime = performance.now();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      const sessionTime = performance.now() - sessionStartTime;
      
      console.log(`[AUTH_DETAILED] ${timestamp} - supabase.auth.getSession() returned after ${sessionTime.toFixed(2)}ms`);
      console.log(`[AUTH_DETAILED] ${timestamp} - Session error:`, sessionError);
      console.log(`[AUTH_DETAILED] ${timestamp} - Session exists:`, !!session);
      console.log(`[AUTH_DETAILED] ${timestamp} - Session user ID:`, session?.user?.id);
      console.log(`[AUTH_DETAILED] ${timestamp} - Session access token exists:`, !!session?.access_token);
      console.log(`[AUTH_DETAILED] ${timestamp} - Session expires at:`, session?.expires_at);
      
      console.log(`[AUTH_STATE] ${timestamp} - Session retrieved in ${sessionTime.toFixed(2)}ms`);
      console.log('=== JWT DEBUG INFO ===');
      console.log('Supabase user ID:', supabaseUser.id);
      console.log('Session:', session);
      console.log('Access token:', session?.access_token);
      console.log('Token length:', session?.access_token?.length);
      console.log('Token starts with:', session?.access_token?.substring(0, 20) + '...');
      console.log('Backend URL:', `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${supabaseUser.id}`);
      console.log('=====================');
      
      console.log(`[AUTH_STATE] ${timestamp} - Making backend API call to get user profile`);
      console.log(`[AUTH_DETAILED] ${timestamp} - About to call backendApiClient.getUserById(${supabaseUser.id})`);
      
      const backendStartTime = performance.now();
      const backendUser = await backendApiClient.getUserById(supabaseUser.id)
      const backendTime = performance.now() - backendStartTime;
      
      console.log(`[AUTH_DETAILED] ${timestamp} - backendApiClient.getUserById() returned after ${backendTime.toFixed(2)}ms`);
      console.log(`[AUTH_STATE] ${timestamp} - Backend API call completed in ${backendTime.toFixed(2)}ms`);
      console.log('Backend user data:', backendUser)
      const role = backendUser.userType === 'Teacher' ? 'teacher' : 
                   backendUser.userType === 'Student' ? 'student' : 
                   null
      console.log('Mapped role:', role, 'from userType:', backendUser.userType)
      
      const totalTime = performance.now() - startTime;
      console.log(`[AUTH_STATE] ${timestamp} - User conversion completed successfully in ${totalTime.toFixed(2)}ms`);
      
      const result = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role,
        user_metadata: {
          full_name: supabaseUser.user_metadata?.full_name,
          preferred_username: supabaseUser.user_metadata?.preferred_username,
        }
      };
      console.log(`[AUTH_DETAILED] ${timestamp} - convertSupabaseUser COMPLETED (call ID: ${callId}) - success path`);
      return result;
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.warn(`[AUTH_STATE] ${timestamp} - Failed to get role from backend after ${errorTime.toFixed(2)}ms, falling back to metadata:`, error);
      console.log(`[AUTH_DETAILED] ${timestamp} - Exception caught in convertSupabaseUser (call ID: ${callId}):`, error);
    }
    
    // Fallback to Supabase metadata if backend fails
    console.log(`[AUTH_STATE] ${timestamp} - Using fallback metadata for user conversion`);
    const result = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: (supabaseUser.user_metadata?.role as 'teacher' | 'student') || null,
      user_metadata: {
        full_name: supabaseUser.user_metadata?.full_name,
        preferred_username: supabaseUser.user_metadata?.preferred_username,
      }
    };
    console.log(`[AUTH_DETAILED] ${timestamp} - convertSupabaseUser COMPLETED (call ID: ${callId}) - fallback path`);
    return result;
  }, []);

  // Window focus/visibility event logging
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      const timestamp = new Date().toISOString();
      const focusEventId = Math.random().toString(36).substring(2, 8);
      
      console.log(`[AUTH_FOCUS] ${timestamp} - Window visibility changed: ${isVisible ? 'visible' : 'hidden'} (event ID: ${focusEventId})`);
      
      if (isVisible) {
        console.log(`[AUTH_FOCUS] ${timestamp} - User returned to tab, auth state will be checked (event ID: ${focusEventId})`);
        // Store the event ID globally for correlation with subsequent auth events
        (window as any).lastFocusEventId = focusEventId;
      }
    };

    const handleWindowFocus = () => {
      const timestamp = new Date().toISOString();
      const focusEventId = Math.random().toString(36).substring(2, 8);
      console.log(`[AUTH_FOCUS] ${timestamp} - Window gained focus (event ID: ${focusEventId})`);
      (window as any).lastFocusEventId = focusEventId;
    };

    const handleWindowBlur = () => {
      const timestamp = new Date().toISOString();
      const focusEventId = Math.random().toString(36).substring(2, 8);
      console.log(`[AUTH_FOCUS] ${timestamp} - Window lost focus (event ID: ${focusEventId})`);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const startTime = performance.now();
      const timestamp = new Date().toISOString();
      console.log(`[AUTH_STATE] ${timestamp} - Initializing authentication state`);
      
      try {
        // Get initial session
        console.log(`[AUTH_STATE] ${timestamp} - Getting initial session from Supabase`);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log(`[AUTH_STATE] ${timestamp} - Initial session found for user: ${session.user.id}`);
          const convertedUser = await convertSupabaseUser(session.user);
          setUser(convertedUser);
          if (!convertedUser.role && window.location.pathname !== '/signup') {
            console.log(`[AUTH_STATE] ${timestamp} - User has no role, redirecting to signup`);
            router.push('/signup');
          }
        } else {
          console.log(`[AUTH_STATE] ${timestamp} - No initial session found`);
        }
        
        const initTime = performance.now() - startTime;
        console.log(`[AUTH_STATE] ${timestamp} - Initial auth check completed in ${initTime.toFixed(2)}ms`);
        setLoading(false); // Set loading to false after initial check

        // Listen for auth changes
        console.log(`[AUTH_STATE] ${timestamp} - Setting up auth state change listener`);
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            const authEventTime = new Date().toISOString();
            const authStartTime = performance.now();
            const lastFocusEventId = (window as any).lastFocusEventId || 'unknown';
            
            console.log(`[AUTH_STATE] ${authEventTime} - Auth state change event: ${event} (triggered by focus event: ${lastFocusEventId})`);
            
            if (session?.user) {
              console.log(`[AUTH_STATE] ${authEventTime} - Session found in auth change for user: ${session.user.id}`);
              const convertedUser = await convertSupabaseUser(session.user);
              setUser(convertedUser);
              if (!convertedUser.role && window.location.pathname !== '/signup') {
                console.log(`[AUTH_STATE] ${authEventTime} - User has no role, redirecting to signup`);
                router.push('/signup');
              }
            } else {
              console.log(`[AUTH_STATE] ${authEventTime} - No session in auth change, setting user to null`);
              setUser(null);
            }
            
            const authEventTime2 = performance.now() - authStartTime;
            console.log(`[AUTH_STATE] ${authEventTime} - Auth state change processed in ${authEventTime2.toFixed(2)}ms (focus event: ${lastFocusEventId})`);
            // Also set loading to false on auth changes to handle subsequent updates
            setLoading(false);
          }
        );

        return () => {
          console.log(`[AUTH_STATE] ${new Date().toISOString()} - Cleaning up auth state listener`);
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error(`[AUTH_STATE] ${timestamp} - Auth initialization error:`, error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [supabase.auth, convertSupabaseUser, router]);

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const convertedUser = user ? await convertSupabaseUser(user) : null;
      return { data: { user: convertedUser }, error: null };
    } catch (error) {
      return { data: { user: null }, error };
    }
  };

  const value: UserContextType = {
    user,
    signInWithGoogle,
    signOut,
    getUser
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div>Loading authentication...</div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

