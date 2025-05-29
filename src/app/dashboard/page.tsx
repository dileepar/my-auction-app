'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';

interface Auction {
  id: string;
  title: string;
  current_highest_bid: number | null;
  end_time: string;
  status: 'active' | 'closed' | 'cancelled';
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch('/api/users/me/auctions');
        if (!response.ok) throw new Error('Failed to fetch auctions');
        const data = await response.json();
        setAuctions(data.auctions);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAuctions();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Your Dashboard</h1>
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-900">Your Auctions</h2>
              <button
                onClick={() => router.push('/auctions/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Create New Auction
              </button>
            </div>

            {auctions.length === 0 ? (
              <p className="text-gray-500">You haven't created any auctions yet.</p>
            ) : (
              <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
                {auctions.map((auction) => (
                  <div
                    key={auction.id}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {auction.title}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Current Bid:{' '}
                          {auction.current_highest_bid
                            ? `$${auction.current_highest_bid.toFixed(2)}`
                            : 'No bids yet'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {auction.status}
                        </p>
                        <p className="text-sm text-gray-500">
                          Ends: {new Date(auction.end_time).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => router.push(`/auctions/${auction.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 