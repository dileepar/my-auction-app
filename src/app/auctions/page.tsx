'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import Navigation from '@/components/Navigation';

interface Auction {
  id: string;
  title: string;
  description: string;
  current_highest_bid: number | null;
  starting_price: number;
  end_time: string;
  image_url: string | null;
  status: 'active' | 'closed' | 'cancelled';
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('end_time');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auctions');
        if (!response.ok) {
          throw new Error('Failed to fetch auctions');
        }
        const data = await response.json();
        setAuctions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load auctions');
      } finally {
        setLoading(false);
      }
    };

    void fetchAuctions();
  }, []);

  const filteredAuctions = auctions
    .filter((auction) => {
      const matchesSearch = auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || auction.status === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_high':
          return (b.current_highest_bid || b.starting_price) - (a.current_highest_bid || a.starting_price);
        case 'price_low':
          return (a.current_highest_bid || a.starting_price) - (b.current_highest_bid || b.starting_price);
        case 'end_time':
          return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
        default:
          return 0;
      }
    });

  const renderSkeletonCards = () => (
    Array(6).fill(0).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-md mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    ))
  );

  const renderAuctionCard = (auction: Auction) => (
    <Link
      key={auction.id}
      href={`/auctions/${auction.id}`}
      className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative h-48 bg-gray-100">
        {auction.image_url ? (
          <Image
            src={auction.image_url}
            alt={auction.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
            auction.status === 'active' ? 'bg-green-100 text-green-800' :
            auction.status === 'closed' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}
        >
          {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {auction.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{auction.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Bid</p>
            <p className="text-lg font-semibold text-gray-900">
              ${(auction.current_highest_bid || Number(auction.starting_price)).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Ends in</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDistanceToNow(new Date(auction.end_time), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Active Auctions</h1>
          <Link
            href="/auctions/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Auction
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-8 grid gap-4 md:flex md:items-center md:justify-between">
          <div className="flex-1 max-w-lg">
            <label htmlFor="search" className="sr-only">Search auctions</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="end_time">End Time</option>
              <option value="price_high">Highest Price</option>
              <option value="price_low">Lowest Price</option>
            </select>
          </div>
        </div>

        {/* Auctions Grid */}
        {error ? (
          <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {renderSkeletonCards()}
          </div>
        ) : filteredAuctions.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAuctions.map(renderAuctionCard)}
          </div>
        ) : (
          <div className="mt-8 text-center py-12 bg-white rounded-lg shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No auctions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search or filters' : 'Start by creating a new auction'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 