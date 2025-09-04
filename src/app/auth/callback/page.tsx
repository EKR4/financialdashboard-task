'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// Isolated client component that uses useSearchParams
const ParamsHandler = () => {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<{
    code?: string;
    type?: string;
    flow?: string;
    error?: string;
  }>({});
  
  useEffect(() => {
    setParams({
      code: searchParams.get('code') || undefined,
      type: searchParams.get('type') || undefined,
      flow: searchParams.get('flow') || undefined,
      error: searchParams.get('error') || undefined
    });
  }, [searchParams]);
  
  return { params };
};

// Component that uses params and handles auth logic
const AuthHandler = ({ router }: { router: ReturnType<typeof useRouter> }) => {
  const { params } = ParamsHandler();
  const supabase = createClient();
  
  useEffect(() => {
    // This will handle the Supabase auth callback
    const handleAuthCallback = async () => {
      try {
        // Exchange the code for a session
        if (!params.code) {
          router.replace('/login?error=Invalid authentication attempt');
          return;
        }
        
        const { error } = await supabase.auth.exchangeCodeForSession(params.code);
        
        if (error) {
          console.error('Auth error:', error.message);
          router.replace(`/login?error=${encodeURIComponent(error.message || 'Authentication error')}`);
          return;
        }

        // Get the current session after exchange
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          // Check if this was from an email confirmation (sign-up)
          const isSignUp = params.type === 'signup' || params.flow === 'signup';
          
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
    if (params.code) {
      handleAuthCallback();
    } else if (params.error) {
      router.replace(`/login?error=${encodeURIComponent(params.error)}`);
    }
  }, [params, router, supabase.auth]);

  return null;
};

export default function AuthCallbackPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoadingUI />}>
        <AuthHandler router={router} />
      </Suspense>
    </div>
  );
}

// UI component for loading state
const LoadingUI = () => (
  <div className="text-center">
    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Processing authentication...</h1>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
  </div>
);