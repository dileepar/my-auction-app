'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Bid {
  id: string;
  bid_amount: number;
  created_at: string;
}

interface AuctionDetail {
  id: string;
  title: string;
  description: string;
  current_highest_bid: number | null;
  starting_price: number;
  end_time: string;
  image_url: string | null;
  status: 'active' | 'closed' | 'cancelled';
  seller_id: string;
}

function AuctionDetailPage() {
  const params = useParams();
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [bids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        const response = await fetch(`/api/auctions/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch auction details');
        }
        const data = await response.json();
        setAuction(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load auction details');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [params.id]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError(null);
    setBidSuccess(false);

    try {
      const response = await fetch(`/api/auctions/${params.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bid_amount: parseFloat(bidAmount) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place bid');
      }

      setBidSuccess(true);
      setBidAmount('');
      
      // Refresh auction details
      const updatedAuction = await fetch(`/api/auctions/${params.id}`).then(res => res.json());
      setAuction(updatedAuction);
    } catch (err) {
      setBidError(err instanceof Error ? err.message : 'Failed to place bid');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-900 font-medium">Error Loading Auction</p>
          <p className="text-red-600 mt-1">{error || 'Auction not found'}</p>
        </div>
      </div>
    );
  }

  const isActive = auction.status === 'active';
  const currentBid = Number(auction.current_highest_bid || auction.starting_price);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/auctions" className="hover:text-blue-600">
                Auctions
              </Link>
            </li>
            <li>
              <span className="mx-2">›</span>
            </li>
            <li className="text-gray-900 font-medium truncate">
              {auction.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left column - Image and details */}
          <div className="space-y-8">
            {auction.image_url ? (
              <div className="aspect-w-4 aspect-h-3 bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="relative w-full h-[400px]">
                  <Image
                    src={auction.image_url}
                    alt={auction.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h1>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p>{auction.description}</p>
              </div>
            </div>
          </div>

          {/* Right column - Bidding interface */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Current Bid</h2>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-blue-600">
                      ${currentBid.toFixed(2)}
                    </span>
                    <span className="text-gray-500">USD</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Ends {formatDistanceToNow(new Date(auction.end_time), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {isActive ? (
                  <form onSubmit={handleBidSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">
                        Your Bid (USD)
                      </label>
                      <div className="mt-2 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="bidAmount"
                          id="bidAmount"
                          step="0.01"
                          min={currentBid + 0.01}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Minimum bid: ${(currentBid + 0.01).toFixed(2)}
                      </p>
                    </div>

                    {bidError && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{bidError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {bidSuccess && (
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-700">Bid placed successfully!</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Place Bid
                    </button>
                  </form>
                ) : (
                  <div className="rounded-md bg-gray-50 p-6 text-center border border-gray-200">
                    <p className="text-gray-600 font-medium">This auction has ended</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Bid History</h3>
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div key={bid.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="font-medium">${bid.bid_amount.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
                {bids.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No bids yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage; 