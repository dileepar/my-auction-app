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

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'closed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const SkeletonCard = () => (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 animate-pulse">
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="mt-6 h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Header Skeleton */}
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            </div>
            
            {/* Cards Skeleton */}
            <div className="mb-6 flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {session?.user?.name || 'User'}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Manage your auctions and track your bidding activity
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">📦</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Auctions</p>
                  <p className="text-2xl font-bold text-gray-900">{auctions.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Auctions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {auctions.filter(a => a.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Bids</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {auctions.filter(a => a.current_highest_bid).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Auctions Section */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Auctions</h2>
                  <p className="text-gray-600 mt-1">Manage and monitor your auction listings</p>
                </div>
                <button
                  onClick={() => router.push('/auctions/create')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ➕ Create New Auction
                </button>
              </div>
            </div>

            <div className="p-6">
              {auctions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🏷️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No auctions yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Ready to start selling? Create your first auction and reach buyers worldwide!
                  </p>
                  <button
                    onClick={() => router.push('/auctions/create')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Create Your First Auction
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {auctions.map((auction) => (
                    <div
                      key={auction.id}
                      className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                            {auction.title}
                          </h3>
                          <span className={getStatusBadge(auction.status)}>
                            {auction.status}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Current Bid:</span>
                            <span className="text-lg font-bold text-green-600">
                              {auction.current_highest_bid
                                ? `$${auction.current_highest_bid.toFixed(2)}`
                                : 'No bids yet'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Ends:</span>
                            <span className="text-sm text-gray-700 font-medium">
                              {new Date(auction.end_time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => router.push(`/auctions/${auction.id}`)}
                            className="w-full bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-700"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {auctions.length === 0 && (
                <p className="text-gray-500 text-center mt-8">
                  You haven&apos;t created any auctions yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 