import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { sql } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { CreateAuctionRequest } from '@/types';

// GET /api/auctions - List all active auctions
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        a.*,
        u.email as seller_email,
        ub.email as highest_bidder_email
      FROM auctions a
      LEFT JOIN users u ON a.seller_id = u.id
      LEFT JOIN users ub ON a.current_highest_bidder_id = ub.id
      WHERE a.status = 'active'
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auctions' },
      { status: 500 }
    );
  }
}

// POST /api/auctions - Create new auction listing
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create an auction' },
        { status: 401 }
      );
    }

    const seller_id = (session.user as any).id;

    if (!seller_id) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    const body: CreateAuctionRequest = await request.json();
    const { title, description, starting_price, end_time, image_url } = body;

    // Validate required fields
    if (!title || !starting_price || !end_time) {
      return NextResponse.json(
        { error: 'Title, starting price, and end time are required' },
        { status: 400 }
      );
    }

    // Validate end time is in the future
    const endDateTime = new Date(end_time);
    if (endDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'End time must be in the future' },
        { status: 400 }
      );
    }

    // Insert new auction
    const result = await sql`
      INSERT INTO auctions (
        seller_id, title, description, starting_price, end_time, image_url
      ) VALUES (
        ${seller_id}, ${title}, ${description || null}, ${starting_price}, ${end_time}, ${image_url || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ auction: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json(
      { error: 'Failed to create auction' },
      { status: 500 }
    );
  }
} 