import { NextResponse } from 'next/server';
import { updateExpiredAuctions } from '@/lib/auction-utils';

// POST /api/auctions/update-status - Update expired auction statuses
export async function POST() {
  try {
    const closedAuctions = await updateExpiredAuctions();
    return NextResponse.json({
      message: `Updated ${closedAuctions.length} expired auctions`,
      closedAuctions
    });
  } catch (error) {
    console.error('Error updating auction statuses:', error);
    return NextResponse.json(
      { error: 'Failed to update auction statuses' },
      { status: 500 }
    );
  }
} 