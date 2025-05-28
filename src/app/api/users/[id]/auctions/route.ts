import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/users/[id]/auctions - Get user's auction listings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: user_id } = await params;

    const result = await sql`
      SELECT 
        a.*,
        ub.email as highest_bidder_email,
        COUNT(b.id) as total_bids
      FROM auctions a
      LEFT JOIN users ub ON a.current_highest_bidder_id = ub.id
      LEFT JOIN bids b ON a.id = b.auction_id
      WHERE a.seller_id = ${user_id}
      GROUP BY a.id, ub.email
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching user auctions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user auctions' },
      { status: 500 }
    );
  }
} 