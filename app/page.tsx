'use client';

import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { Header } from './components/Header';

export default function Home() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample event data
  const events = [
    {
      id: 1,
      name: 'Score Marathon 2025',
      image: '/event-placeholder.jpg',
      photographers: 24,
    },
    {
      id: 2,
      name: 'Score Marathon 2025',
      image: '/event-placeholder.jpg',
      photographers: 24,
    },
    {
      id: 3,
      name: 'Score Marathon 2025',
      image: '/event-placeholder.jpg',
      photographers: 24,
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <section
          className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/hero-bg.jpg")',
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/80" />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
            {/* Main Heading */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Find Your Best Moment.
              </h1>
              <p className="text-2xl md:text-4xl font-light text-cyan-400">Instantly.</p>
            </div>

            {/* Subtitle */}
            <p className="text-center text-white/80 text-lg mb-8 max-w-2xl">
              Browse, search, and relive your favorite event experience in just a few clicks.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Event Name / Photographer Profile"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-3 rounded text-sm bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button className="px-6 py-3 bg-cyan-400 text-black font-semibold rounded hover:bg-cyan-300 transition-colors">
                  🔍
                </button>
              </div>
            </div>

            {/* CTA if not signed in */}
            {!session && (
              <button
                onClick={() => signIn('google')}
                className="mt-8 px-8 py-3 bg-cyan-400 text-black font-semibold rounded hover:bg-cyan-300 transition-colors"
              >
                Continue with Google to Get Started
              </button>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-black">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-3xl">
                  📅
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Choose Your Event</h3>
                <p className="text-gray-600">
                  Select from 100+ covered events of your favorite sports and more.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-3xl">
                  🔍
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Search Your Photos</h3>
                <p className="text-gray-600">
                  Upload your photo, name, and get results where you can view, filter, and like.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-3xl">
                  ⬇️
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Download Your Memories</h3>
                <p className="text-gray-600">
                  Purchase and download high-resolution photos of your best memories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Browse Recent Events Section */}
        <section className="py-20 px-4 bg-black">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">Browse Recent Events</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg overflow-hidden bg-gray-900 hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {/* Event Image Placeholder */}
                  <div className="w-full h-48 bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <span className="text-white text-3xl">📸</span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {event.photographers} photographers
                    </p>
                    <button className="w-full px-4 py-2 bg-cyan-400 text-black font-semibold rounded hover:bg-cyan-300 transition-colors">
                      View Photos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-950 border-t border-gray-800 py-12 px-4">
          <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
            <p>&copy; 2025 iQShutrl. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
