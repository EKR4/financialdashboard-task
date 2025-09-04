'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // This will handle the Supabase auth callback
    const handleAuthCallback = async () => {
      try {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(
          searchParams.get('code') || ''
        );
        
        if (error) {
          console.error('Auth error:', error.message);
          router.replace(`/login?error=${encodeURIComponent(error.message || 'Authentication error')}`);
          return;
        }

        // Get the current session after exchange
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          // Check if this was from an email confirmation (sign-up)
          const type = searchParams.get('type');
          const isSignUp = type === 'signup' || searchParams.get('flow') === 'signup';
          
          if (isSignUp) {
            // Redirect to login with email_confirmed parameter for a success message
            router.replace('/login?email_confirmed=true');
          } else {
            // For normal login flow, go directly to dashboard
            console.log('User is authenticated, redirecting to dashboard...');
            router.replace('/dashboard');
          }
        } else {
          // No session means auth failed or was not completed
          router.replace('/login?error=Authentication failed');
        }
      } catch (err: unknown) {
        console.error('Auth callback error:', err);
        router.replace('/login?error=Unexpected error during authentication');
      }
    };

    // Only run the callback handler if we have a code parameter
    const code = searchParams.get('code');
    if (code) {
      handleAuthCallback();
    } else {
      // No code parameter, redirect to login
      router.replace('/login?error=Invalid authentication attempt');
    }
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Processing authentication...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}