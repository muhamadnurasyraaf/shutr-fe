"use client";

import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { Header } from "./components/Header";
import { Star, Calendar, Camera, MessageSquare } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const thumbnailUrl = "/thumbnail.png";

  // Sample event data - 6 events to match the image
  const events = [
    {
      id: 1,
      name: "Score Marathon 2025",
      image: thumbnailUrl,
      photographers: 24,
    },
    {
      id: 2,
      name: "Score Marathon 2025",
      image: thumbnailUrl,
      photographers: 24,
    },
    {
      id: 3,
      name: "Score Marathon 2025",
      image: thumbnailUrl,
      photographers: 24,
    },
    {
      id: 4,
      name: "Score Marathon 2025",
      image: thumbnailUrl,
      photographers: 24,
    },
    {
      id: 5,
      name: "Score Marathon 2025",
      image: thumbnailUrl,
      photographers: 24,
    },
    {
      id: 6,
      name: "Score Marathon 2025",
      image: thumbnailUrl,
      photographers: 24,
    },
  ];

  // Top photographers data
  const topPhotographers = [
    { id: 1, name: "John Doe", rating: 4.8, events: 45, avatar: "/placeholder.svg" },
    { id: 2, name: "Jane Smith", rating: 4.9, events: 52, avatar: "/placeholder.svg" },
    { id: 3, name: "Mike Wilson", rating: 4.7, events: 38, avatar: "/placeholder.svg" },
    { id: 4, name: "Sarah Chen", rating: 4.9, events: 61, avatar: "/placeholder.svg" },
    { id: 5, name: "David Kim", rating: 4.8, events: 47, avatar: "/placeholder.svg" },
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Alex Johnson",
      text: "Amazing service! Found all my marathon photos instantly.",
      rating: 5,
    },
    {
      id: 2,
      name: "Maria Garcia",
      text: "The quality is outstanding and the search feature is so easy to use.",
      rating: 5,
    },
    {
      id: 3,
      name: "Tom Anderson",
      text: "Best platform for event photography. Highly recommended!",
      rating: 5,
    },
  ];

  return (
    <>
      <Header variant="transparent" />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section
          className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: 'url("/landing_page_image.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
            {/* Main Heading */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Find Your Best Moment.
              </h1>
              <p className="text-2xl md:text-4xl font-light text-cyan-400">
                Instantly.
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-center text-white/80 text-lg mb-8 max-w-2xl">
              Browse, search, and relive your favorite event experience in just
              a few clicks.
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
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-cyan-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Choose Your Event
                </h3>
                <p className="text-gray-600">
                  Select from 100+ covered events of your favorite sports and
                  more.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                  <Camera className="w-10 h-10 text-cyan-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Search Your Photos
                </h3>
                <p className="text-gray-600">
                  Upload your photo, name, and get results where you can view,
                  filter, and like.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Download Your Memories
                </h3>
                <p className="text-gray-600">
                  Purchase and download high-resolution photos of your best
                  memories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Browse Recent Events Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900 text-center">
              Browse Recent Events
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg overflow-hidden border border-gray-200 text-gray-900 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  {/* Event Image */}
                  <div className="relative w-full h-48">
                    <Image
                      src={event.image}
                      alt={event.name || "Event image"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {event.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {event.photographers} photographers
                    </p>
                    <button className="w-full px-4 py-2 bg-cyan-400 text-black font-semibold rounded hover:bg-cyan-500 transition-colors">
                      View Photos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Photographers Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900 text-center">
              Top Photographers Of The Week
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {topPhotographers.map((photographer) => (
                <div
                  key={photographer.id}
                  className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {photographer.name}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{photographer.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">{photographer.events} events</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900 text-center">
              What Our Users Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-6 rounded-lg border border-gray-200 bg-white"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <p className="text-sm font-semibold text-gray-900">
                    - {testimonial.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-12 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-cyan-400">S</span>
                <span className="text-gray-900">hutr</span>
              </div>
              <p className="text-sm text-gray-600">
                Find your best moment in every event photo.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/events" className="hover:text-cyan-500">Search Events</a></li>
                <li><a href="/photographers" className="hover:text-cyan-500">Find Photographers</a></li>
                <li><a href="/about" className="hover:text-cyan-500">About Us</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/help" className="hover:text-cyan-500">Help Center</a></li>
                <li><a href="/contact" className="hover:text-cyan-500">Contact Us</a></li>
                <li><a href="/faq" className="hover:text-cyan-500">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">&copy; 2025 Shutr. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}