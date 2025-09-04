import { NextResponse } from 'next/server';
import type { MpesaBalance, ApiResponse } from '@/types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    // Simulate a network delay (300-800ms)
    await delay(Math.floor(Math.random() * 500) + 300);

    // Mock M-Pesa balance data
    const balanceData: MpesaBalance = {
      account_number: "254712345678",
      balance: 15750.85,
      currency: "KES",
      last_updated: new Date().toISOString()
    };

    // Format the response
    const response: ApiResponse<MpesaBalance> = {
      success: true,
      data: balanceData
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