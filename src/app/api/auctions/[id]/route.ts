import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/auctions/[id] - Get auction details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sql`
      SELECT 
        a.*,
        u.email as seller_email,
        ub.email as highest_bidder_email
      FROM auctions a
      LEFT JOIN users u ON a.seller_id = u.id
      LEFT JOIN users ub ON a.current_highest_bidder_id = ub.id
      WHERE a.id = ${id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }

    // Also get bid history
    const bidsResult = await sql`
      SELECT 
        b.id,
        b.bid_amount,
        b.created_at,
        u.email as bidder_email
      FROM bids b
      LEFT JOIN users u ON b.bidder_id = u.id
      WHERE b.auction_id = ${id}
      ORDER BY b.created_at DESC
      LIMIT 10
    `;

    const auction = result.rows[0];
    const bids = bidsResult.rows;

    return NextResponse.json({
      ...auction,
      recent_bids: bids
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction' },
      { status: 500 }
    );
  }
} 