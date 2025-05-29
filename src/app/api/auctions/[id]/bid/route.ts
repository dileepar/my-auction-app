import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { sql } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { PlaceBidRequest } from '@/types';

// POST /api/auctions/[id]/bid - Place a bid
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to place a bid' },
        { status: 401 }
      );
    }

    const bidder_id = (session.user as any).id;

    if (!bidder_id) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    const { id: auction_id } = await params;
    const body: PlaceBidRequest = await request.json();
    const { bid_amount } = body;

    // Validate bid amount
    if (!bid_amount || bid_amount <= 0) {
      return NextResponse.json(
        { error: 'Bid amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get current auction details
    const auctionResult = await sql`
      SELECT * FROM auctions 
      WHERE id = ${auction_id} AND status = 'active'
    `;

    if (auctionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Auction not found or not active' },
        { status: 404 }
      );
    }

    const auction = auctionResult.rows[0];

    // Check if auction has ended
    if (new Date(auction.end_time) <= new Date()) {
      return NextResponse.json(
        { error: 'Auction has ended' },
        { status: 400 }
      );
    }

    // Check if user is trying to bid on their own auction
    if (auction.seller_id === bidder_id) {
      return NextResponse.json(
        { error: 'Cannot bid on your own auction' },
        { status: 400 }
      );
    }

    // Validate bid amount is higher than current highest bid or starting price
    const minimumBid = auction.current_highest_bid || auction.starting_price;
    if (bid_amount <= minimumBid) {
      return NextResponse.json(
        { error: `Bid must be higher than ${minimumBid}` },
        { status: 400 }
      );
    }

    // Start transaction
    await sql`BEGIN`;

    try {
      // Insert new bid
      const bidResult = await sql`
        INSERT INTO bids (auction_id, bidder_id, bid_amount)
        VALUES (${auction_id}, ${bidder_id}, ${bid_amount})
        RETURNING *
      `;

      // Update auction with new highest bid
      await sql`
        UPDATE auctions 
        SET 
          current_highest_bid = ${bid_amount},
          current_highest_bidder_id = ${bidder_id},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${auction_id}
      `;

      await sql`COMMIT`;

      return NextResponse.json(bidResult.rows[0], { status: 201 });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    );
  }
} 