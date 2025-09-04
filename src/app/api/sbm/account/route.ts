import { NextResponse } from 'next/server';
import type { SbmBalance, ApiResponse } from '@/types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Simulate network delay for API-like behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    // Simulate a network delay (400-1000ms) to mimic an API call
    await delay(Math.floor(Math.random() * 600) + 400);
    
    // Create a direct Supabase client for API routes
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // First get the user's SBM account
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id, account_number, additional_data')
      .eq('user_id', session.user.id)
      .eq('account_type', 'sbm')
      .eq('is_active', true)
      .single();
    
    if (accountError || !accountData) {
      return NextResponse.json(
        { success: false, error: "No SBM Bank account found" },
        { status: 404 }
      );
    }
    
    // Get the balance for this account
    const { data: balanceData, error: balanceError } = await supabase
      .from('balances')
      .select('amount, currency, last_updated')
      .eq('account_id', accountData.id)
      .single();
    
    if (balanceError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch SBM Bank balance" },
        { status: 500 }
      );
    }
    
    // Extract account type from additional_data JSON
    const additionalData = accountData.additional_data || {};
    
    // Format the response to match expected SbmBalance type
    const responseData: SbmBalance = {
      account_number: accountData.account_number,
      balance: balanceData?.amount || 0,
      currency: balanceData?.currency || 'KES',
      account_type: additionalData.accountType || 'Savings',
      last_updated: balanceData?.last_updated || new Date().toISOString()
    };
    
    // Format the response
    const response: ApiResponse<SbmBalance> = {
      success: true,
      data: responseData
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching SBM account details:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch SBM account details" },
      { status: 500 }
    );
  }
}