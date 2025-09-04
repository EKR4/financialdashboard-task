import { NextResponse } from 'next/server';
import type { SbmBalance, ApiResponse } from '@/types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    // Simulate a network delay (400-1000ms)
    await delay(Math.floor(Math.random() * 600) + 400);

    // Mock SBM Bank balance data
    const balanceData: SbmBalance = {
      account_number: "0123456789",
      balance: 87325.42,
      currency: "KES",
      account_type: "Savings",
      last_updated: new Date().toISOString()
    };

    // Format the response
    const response: ApiResponse<SbmBalance> = {
      success: true,
      data: balanceData
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