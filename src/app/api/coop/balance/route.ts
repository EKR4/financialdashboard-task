import { NextResponse } from 'next/server';
import type { CoopBalance, ApiResponse } from '@/types';
import { createClient } from '@/utils/supabase/server';

// Simulate network delay for API-like behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    // Simulate a network delay (500-1200ms) to mimic an API call
    await delay(Math.floor(Math.random() * 700) + 500);
    
    const supabase = createClient();
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // First get the user's Co-op account
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id, account_number, additional_data')
      .eq('user_id', session.user.id)
      .eq('account_type', 'coop')
      .eq('is_active', true)
      .single();
    
    if (accountError || !accountData) {
      return NextResponse.json(
        { success: false, error: "No Co-operative Bank account found" },
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
        { success: false, error: "Failed to fetch Co-operative Bank balance" },
        { status: 500 }
      );
    }
    
    // Extract branch from additional_data JSON
    const additionalData = accountData.additional_data || {};
    
    // Format the response to match expected CoopBalance type
    const responseData: CoopBalance = {
      account_number: accountData.account_number,
      balance: balanceData?.amount || 0,
      currency: balanceData?.currency || 'KES',
      branch: additionalData.branch || 'Main Branch',
      last_updated: balanceData?.last_updated || new Date().toISOString()
    };
    
    // Format the response
    const response: ApiResponse<CoopBalance> = {
      success: true,
      data: responseData
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching Co-operative Bank balance:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch Co-operative Bank balance" },
      { status: 500 }
    );
  }
}