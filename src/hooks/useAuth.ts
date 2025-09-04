import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@/types';

interface AuthError {
  message: string;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: { fullName?: string; phone?: string }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  error: AuthError | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { user: authUser } = session;
          if (authUser) {
            const { id, email, created_at } = authUser;
            setUser({
              id,
              email: email || '',
              created_at: created_at || '',
              updated_at: ''
            });
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setError({ message: 'Failed to check authentication status' });
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { id, email, created_at } = session.user;
          setUser({
            id, 
            email: email || '', 
            created_at: created_at || '',
            updated_at: ''
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError({ message: error.message });
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during sign in';
      setError({ message: errorMessage });
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string,
    metadata?: { fullName?: string; phone?: string }
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign up the user with Supabase Auth
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.fullName,
            phone_number: metadata?.phone
          }
        }
      });

      if (error) {
        setError({ message: error.message });
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during sign up';
      setError({ message: errorMessage });
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError({ message: error.message || 'Failed to sign out' });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    error
  };
}