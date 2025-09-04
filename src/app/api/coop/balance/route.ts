import { NextResponse } from 'next/server';
import type { CoopBalance, ApiResponse } from '@/types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    // Simulate a network delay (500-1200ms)
    await delay(Math.floor(Math.random() * 700) + 500);

    // Mock Co-operative Bank balance data
    const balanceData: CoopBalance = {
      account_number: "0198765432",
      balance: 42680.15,
      currency: "KES",
      branch: "Nairobi Central",
      last_updated: new Date().toISOString()
    };

    // Format the response
    const response: ApiResponse<CoopBalance> = {
      success: true,
      data: balanceData
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