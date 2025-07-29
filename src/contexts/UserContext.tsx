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
    // Skip backend call if user is on signup page (they're creating their backend profile)
    if (typeof window !== 'undefined' && window.location.pathname === '/signup') {
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: (supabaseUser.user_metadata?.role as 'teacher' | 'student') || null,
        user_metadata: {
          full_name: supabaseUser.user_metadata?.full_name,
          preferred_username: supabaseUser.user_metadata?.preferred_username,
        }
      }
    }
    
    try {
      // Try to get role from backend first
      const { data: { session } } = await supabase.auth.getSession()
      console.log('=== JWT DEBUG INFO ===');
      console.log('Supabase user ID:', supabaseUser.id);
      console.log('Session:', session);
      console.log('Access token:', session?.access_token);
      console.log('Token length:', session?.access_token?.length);
      console.log('Token starts with:', session?.access_token?.substring(0, 20) + '...');
      console.log('Backend URL:', `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${supabaseUser.id}`);
      console.log('=====================');
      
      const backendUser = await backendApiClient.getUserById(supabaseUser.id)
      console.log('Backend user data:', backendUser)
      const role = backendUser.userType === 'Teacher' ? 'teacher' : 
                   backendUser.userType === 'Student' ? 'student' : 
                   null
      console.log('Mapped role:', role, 'from userType:', backendUser.userType)
      
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role,
        user_metadata: {
          full_name: supabaseUser.user_metadata?.full_name,
          preferred_username: supabaseUser.user_metadata?.preferred_username,
        }
      }
    } catch (error) {
      console.warn('Failed to get role from backend, falling back to metadata:', error)
    }
    
    // Fallback to Supabase metadata if backend fails
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: (supabaseUser.user_metadata?.role as 'teacher' | 'student') || null,
      user_metadata: {
        full_name: supabaseUser.user_metadata?.full_name,
        preferred_username: supabaseUser.user_metadata?.preferred_username,
      }
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const convertedUser = await convertSupabaseUser(session.user);
          setUser(convertedUser);
          if (!convertedUser.role && window.location.pathname !== '/signup') {
            router.push('/signup');
          }
        }
        setLoading(false); // Set loading to false after initial check

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              const convertedUser = await convertSupabaseUser(session.user);
              setUser(convertedUser);
              if (!convertedUser.role && window.location.pathname !== '/signup') {
                router.push('/signup');
              }
            } else {
              setUser(null);
            }
            // Also set loading to false on auth changes to handle subsequent updates
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
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

