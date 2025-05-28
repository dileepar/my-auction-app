import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Online Auction Platform
            </h1>
            <nav className="space-x-4">
              <a href="/auctions" className="text-blue-600 hover:text-blue-800">
                Browse Auctions
              </a>
              <a href="/login" className="text-blue-600 hover:text-blue-800">
                Login
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Welcome to the Auction Platform
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Buy and sell items through exciting online auctions
          </p>
          
          <div className="mt-8 space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Start Bidding
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
              Create Auction
            </button>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Development Status - Phase 1 Complete ✅
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-green-600">✅ Project Setup</h4>
              <p className="text-gray-600 mt-2">
                Next.js, TypeScript, Tailwind CSS, and folder structure
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-green-600">✅ Database Setup</h4>
              <p className="text-gray-600 mt-2">
                Vercel Postgres with User, Auction, and Bid models
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-green-600">✅ Core API Routes</h4>
              <p className="text-gray-600 mt-2">
                Create auctions, list auctions, place bids, get auction details
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-blue-800">Next Steps</h4>
          <p className="text-blue-700 mt-2">
            Phase 2: Authentication & Seller Interface (NextAuth.js, login/register, create auction UI)
          </p>
        </div>
      </main>
    </div>
  );
}
