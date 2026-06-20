"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import {
  Star,
  Calendar,
  Camera,
  Calendar1,
  MapPin,
  Search,
  Download,
} from "lucide-react";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { redirect, useRouter } from "next/navigation";

interface LandingPageProps {
  recentEvents: {
    id: string;
    name: string;
    description: string;
    date: Date;
    thumbnailUrl?: string | null;
    location: string;
  }[];
  topPhotographers: {
    id: string;
    email: string;
    name: string;
    displayName?: string | null;
    creatorInfo?: {
      location: string | null;
    };
  }[];
  isFallback?: boolean;
}

export default function LandingPage({
  recentEvents,
  topPhotographers,
  isFallback = false,
}: LandingPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  // Check for profile complete message from sessionStorage
  useEffect(() => {
    const message = sessionStorage.getItem("profileCompleteMessage");
    if (message) {
      setToast({ show: true, message });
      sessionStorage.removeItem("profileCompleteMessage");
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: "" });
      }, 3000);
    }
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
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
      {isFallback && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-sm text-amber-700">
            Showing cached content. Live data will be available shortly.
          </p>
        </div>
      )}
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/75" />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
            {/* Main Heading — one dominant line, accent as support not a second shout */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white text-balance">
                Find your best moment,{" "}
                <span className="text-brand">instantly.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base md:text-lg text-white/75 text-balance">
                Browse, search, and relive your favorite event — in just a few
                clicks.
              </p>
            </div>

            {/* Search Bar — one unified field, real icon, accessible label */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur transition-shadow focus-within:ring-2 focus-within:ring-brand">
                <Search className="ml-2 h-5 w-5 shrink-0 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search an event or photographer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent px-1 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  aria-label="Search"
                  className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-16 text-gray-900">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-brand-subtle rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-brand-strong" />
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
                <div className="w-20 h-20 bg-brand-subtle rounded-full flex items-center justify-center mb-6">
                  <Camera className="w-10 h-10 text-brand-strong" />
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
                <div className="w-20 h-20 bg-brand-subtle rounded-full flex items-center justify-center mb-6">
                  <Download className="w-10 h-10 text-brand-strong" />
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
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 text-gray-900 text-center">
              Browse Recent Events
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl overflow-hidden border border-gray-200 text-gray-900 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  {/* Event Image */}
                  <div className="relative w-full h-48">
                    {event.thumbnailUrl ? (
                      <Image
                        src={getCloudinaryUrl(event.thumbnailUrl, "standard")}
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-subtle">
                        <Camera className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-3">{event.name}</h3>

                    {/* Date */}
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar1 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <p className="text-gray-500 text-sm">
                        {event.date.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <p className="text-gray-500 text-sm">
                        {event.location || "Kuala Lumpur"}
                      </p>
                    </div>

                    <button
                      onClick={() => redirect(`/events/${event.id}/images`)}
                      className="w-full px-4 py-2 bg-brand text-brand-foreground font-semibold rounded-lg hover:bg-brand/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
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
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 text-gray-900 text-center">
              Top Photographers Of The Week
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {topPhotographers.map((photographer) => (
                <div
                  key={photographer.id}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {photographer.displayName || photographer.name}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{5.0}</span>
                  </div>
                  <p className="text-xs text-gray-500">10 events</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 text-gray-900 text-center">
              What Our Users Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-6 rounded-2xl border border-gray-200 bg-white"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    &quot;{testimonial.text}&quot;
                  </p>
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
              <div className="text-2xl font-semibold tracking-tight mb-4">
                <span className="text-brand">S</span>
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
                <li>
                  <a href="/events" className="hover:text-brand-strong">
                    Search Events
                  </a>
                </li>
                <li>
                  <a href="/photographers" className="hover:text-brand-strong">
                    Find Photographers
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-brand-strong">
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/help" className="hover:text-brand-strong">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-brand-strong">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-brand-strong">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              &copy; 2025 Shutr. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
