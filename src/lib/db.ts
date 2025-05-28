import { sql } from '@vercel/postgres';

export { sql };

// Helper function to execute queries with error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query(text: string, params?: any[]) {
  try {
    const result = await sql.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create auctions table
    await sql`
      CREATE TABLE IF NOT EXISTS auctions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        starting_price DECIMAL(10,2) NOT NULL,
        current_highest_bid DECIMAL(10,2),
        current_highest_bidder_id UUID REFERENCES users(id),
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create bids table
    await sql`
      CREATE TABLE IF NOT EXISTS bids (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
        bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bid_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_auctions_seller_id ON auctions(seller_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id)`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
} 