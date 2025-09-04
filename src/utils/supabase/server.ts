// Supabase client for server components
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xsnsmlnfsewxgqkteadu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzbnNtbG5mc2V3eGdxa3RlYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NzU0ODIsImV4cCI6MjA3MjU1MTQ4Mn0.cxwLJIdhoYOhXGe6VkFYvL_PotTFFFnvMlrsElLubaE';

export const createClient = () => {
  // Using type assertion for cookie store to handle potential Promise
  // This works because we have middleware refreshing the user sessions
  const cookieStore = cookies() as any;
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This is safe to ignore since we have middleware refreshing
            // user sessions.
            console.error("Error setting cookie in Server Component:", error);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This is safe to ignore since we have middleware refreshing
            // user sessions.
            console.error("Error removing cookie in Server Component:", error);
          }
        },
      },
    },
  );
};