import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xsnsmlnfsewxgqkteadu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzbnNtbG5mc2V3eGdxa3RlYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NzU0ODIsImV4cCI6MjA3MjU1MTQ4Mn0.cxwLJIdhoYOhXGe6VkFYvL_PotTFFFnvMlrsElLubaE';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'findash-auth'
  }
});

export { supabase };