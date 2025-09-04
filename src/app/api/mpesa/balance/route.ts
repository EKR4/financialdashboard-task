import { NextResponse } from 'next/server';
import type { MpesaBalance, ApiResponse } from '@/types';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Simulate network delay for API-like behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    // Simulate a network delay (300-800ms) to mimic an API call
    await delay(Math.floor(Math.random() * 500) + 300);
    
    const supabase = createClient();
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // First get the user's mpesa account
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id, account_number')
      .eq('user_id', session.user.id)
      .eq('account_type', 'mpesa')
      .eq('is_active', true)
      .single();
    
    if (accountError || !accountData) {
      return NextResponse.json(
        { success: false, error: "No M-Pesa account found" },
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
        { success: false, error: "Failed to fetch M-Pesa balance" },
        { status: 500 }
      );
    }
    
    // Format the response to match expected MpesaBalance type
    const responseData: MpesaBalance = {
      account_number: accountData.account_number,
      balance: balanceData?.amount || 0,
      currency: balanceData?.currency || 'KES',
      last_updated: balanceData?.last_updated || new Date().toISOString()
    };
    
    // Format the response
    const response: ApiResponse<MpesaBalance> = {
      success: true,
      data: responseData
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching M-Pesa balance:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch M-Pesa balance" },
      { status: 500 }
    );
  }
}