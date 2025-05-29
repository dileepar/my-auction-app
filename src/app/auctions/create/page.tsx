'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Image from 'next/image';

export default function CreateAuctionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startingPrice = parseFloat(formData.get('startingPrice') as string);
    const endTime = new Date(formData.get('endTime') as string).toISOString();
    const imageUrl = formData.get('imageUrl') as string;

    try {
      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          starting_price: startingPrice,
          end_time: endTime,
          image_url: imageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create auction');
      }

      router.push(`/auctions/${data.auction.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Calculate minimum end time (24 hours from now)
  const minEndTime = new Date();
  minEndTime.setHours(minEndTime.getHours() + 24);
  const minEndTimeString = minEndTime.toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
                <span className="text-3xl">🏷️</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Create New Auction
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                List your item and start receiving bids from buyers around the world. 
                Fill out the details below to get started.
              </p>
            </div>

            {/* Main Form Card */}
            <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden">
              {/* Progress Bar */}
              <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              
              <div className="p-8 lg:p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg animate-pulse">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="text-red-400 text-xl">⚠️</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-red-700 font-medium">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auction Details Section */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">1</span>
                        </span>
                        Auction Details
                      </h2>
                      <p className="text-gray-600 mt-2 ml-11">Basic information about your auction item</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                          Title *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            placeholder="Enter a compelling title for your auction"
                            className="block w-full border-2 border-gray-200 rounded-xl shadow-sm py-4 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={6}
                          required
                          placeholder="Describe your item in detail. Include condition, features, and any relevant information buyers should know..."
                          className="block w-full border-2 border-gray-200 rounded-xl shadow-sm py-4 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Timing Section */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-green-600 font-bold">2</span>
                        </span>
                        Pricing & Schedule
                      </h2>
                      <p className="text-gray-600 mt-2 ml-11">Set your starting price and auction duration</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="startingPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                          Starting Price *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-lg font-medium">$</span>
                          </div>
                          <input
                            type="number"
                            name="startingPrice"
                            id="startingPrice"
                            min="0.01"
                            step="0.01"
                            required
                            placeholder="0.00"
                            className="block w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 mb-2">
                          End Time *
                        </label>
                        <input
                          type="datetime-local"
                          name="endTime"
                          id="endTime"
                          required
                          min={minEndTimeString}
                          className="block w-full border-2 border-gray-200 rounded-xl shadow-sm py-4 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                        />
                        <p className="mt-2 text-sm text-gray-500 flex items-center">
                          <span className="text-blue-500 mr-1">ℹ️</span>
                          Auction must run for at least 24 hours
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-bold">3</span>
                        </span>
                        Item Image
                      </h2>
                      <p className="text-gray-600 mt-2 ml-11">Add an image to showcase your item (optional)</p>
                    </div>

                    <div>
                      <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                        Image URL
                      </label>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <input
                            type="url"
                            name="imageUrl"
                            id="imageUrl"
                            value={imageUrl}
                            onChange={handleImageUrlChange}
                            placeholder="https://example.com/your-image.jpg"
                            className="block w-full border-2 border-gray-200 rounded-xl shadow-sm py-4 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                          />
                          <p className="mt-2 text-sm text-gray-500">
                            Enter a direct link to your image
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-center">
                          {imageUrl && !imageError ? (
                            <div className="relative">
                              <Image
                                src={imageUrl}
                                alt="Preview"
                                width={128}
                                height={128}
                                onError={handleImageError}
                                className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                              />
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                              <div className="text-center">
                                <span className="text-4xl text-gray-400 mb-2 block">🖼️</span>
                                <p className="text-sm text-gray-500">Image preview will appear here</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          loading ? 'opacity-50 cursor-not-allowed transform-none' : ''
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating Auction...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span className="mr-2">🚀</span>
                            Create Auction
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-3">💡</span>
                Tips for a Successful Auction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-green-500 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Use clear, high-quality images to showcase your item</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Write detailed descriptions including condition and features</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Set competitive starting prices to attract more bidders</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Choose optimal auction duration for maximum exposure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 