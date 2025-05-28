import { sql } from '@/lib/db';

// Update auction status based on end time
export async function updateExpiredAuctions() {
  try {
    const result = await sql`
      UPDATE auctions 
      SET status = 'closed', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'active' 
      AND end_time <= CURRENT_TIMESTAMP
      RETURNING id, title
    `;

    console.log(`Closed ${result.rowCount} expired auctions`);
    return result.rows;
  } catch (error) {
    console.error('Error updating expired auctions:', error);
    throw error;
  }
}

// Check if auction is expired and update status
export async function checkAndUpdateAuctionStatus(auctionId: string) {
  try {
    const result = await sql`
      UPDATE auctions 
      SET status = 'closed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${auctionId} 
      AND status = 'active' 
      AND end_time <= CURRENT_TIMESTAMP
      RETURNING id, status
    `;

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error checking auction status:', error);
    throw error;
  }
}

// Get auction time remaining in minutes
export function getTimeRemaining(endTime: Date): number {
  const now = new Date();
  const timeRemaining = endTime.getTime() - now.getTime();
  return Math.max(0, Math.floor(timeRemaining / (1000 * 60))); // in minutes
}

// Format time remaining for display
export function formatTimeRemaining(endTime: Date): string {
  const now = new Date();
  const timeRemaining = endTime.getTime() - now.getTime();

  if (timeRemaining <= 0) {
    return 'Auction ended';
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
} 