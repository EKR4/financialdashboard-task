"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Isolated client component that uses useSearchParams
const ParamsHandler = () => {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<{
    error?: string;
    errorDescription?: string;
    emailConfirmed?: string;
  }>({});
  
  useEffect(() => {
    setParams({
      error: searchParams.get('error') || undefined,
      errorDescription: searchParams.get('error_description') || undefined,
      emailConfirmed: searchParams.get('email_confirmed') || undefined,
    });
  }, [searchParams]);
  
  return { params };
};

// Main component
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();
  const { signIn, loading, user } = useAuth();

  // Client-side redirection if user is already authenticated
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Handle specific auth errors with more helpful messages
        if (error.message.includes('Email not confirmed')) {
          setFormError('Please check your email and confirm your account before logging in.');
        } else {
          setFormError(error.message);
        }
      } else {
        // Set a success message
        setFormError('');
        
        // Slight delay to ensure the session is established
        setTimeout(() => {
          // Use replace instead of push to avoid back navigation issues
          router.replace('/dashboard');
        }, 500);
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred during login');
    }
  };

  // Component that handles URL params
  const SearchParamsEffect = () => {
    const { params } = ParamsHandler();
    
    useEffect(() => {
      if (params.error) {
        setFormError(`Authentication error: ${params.errorDescription || params.error}`);
      }
      
      if (params.emailConfirmed === 'true') {
        setFormError('Email confirmed successfully! You can now log in.');
      }
    }, [params]);

    return null;
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsEffect />
      </Suspense>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">FinDash</h1>
        <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {formError && (
              <div className={`${formError.includes('confirmed successfully') ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'} border rounded-md p-3 text-sm`}>
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}