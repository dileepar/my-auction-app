export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Auction {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  starting_price: number;
  current_highest_bid: number | null;
  current_highest_bidder_id: string | null;
  end_time: string;
  status: 'active' | 'closed' | 'cancelled';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  auction_id: string;
  bidder_id: string;
  bid_amount: number;
  created_at: string;
}

// API Request/Response types
export interface CreateAuctionRequest {
  title: string;
  description?: string;
  starting_price: number;
  end_time: string; // ISO string
  image_url?: string;
}

export interface PlaceBidRequest {
  bid_amount: number;
}

export interface AuctionWithBidder extends Auction {
  seller_email?: string;
  highest_bidder_email?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
} 