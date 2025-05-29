import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { sql } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { SessionUser } from '@/types';

// GET /api/users/me/auctions - Get current user's auction listings
export async function GET() {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to view your auctions' },
        { status: 401 }
      );
    }

    const user_id = (session.user as SessionUser).id;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ auctions: result.rows });
  } catch (error) {
    console.error('Error fetching user auctions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user auctions' },
      { status: 500 }
    );
  }
} 