"use client"

import { useState } from "react"
import { Header } from "@/app/components/Header"
import { Star, MapPin, Camera, Calendar, Award, Mail, Share2, Heart, Grid, List, Filter } from "lucide-react"
import Image from "next/image"

export default function PublicPhotographerProfile() {
  const [activeTab, setActiveTab] = useState("portfolio")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Photographer Info
  const photographer = {
    name: "Sarah Chen",
    displayName: "SarahChen_Photos",
    avatar: "/asian-woman-photographer.jpg",
    coverPhoto: "/thumbnail.png",
    specialty: "Wedding & Events",
    location: "San Francisco, CA",
    memberSince: "2023",
    verified: true,
    rating: 4.9,
    reviewCount: 156,
    totalEvents: 127,
    totalPhotos: 15420,
    bio: "Award-winning photographer specializing in capturing authentic moments at weddings and special events. With over 5 years of experience, I focus on candid photography that tells your unique story. Based in the San Francisco Bay Area and available for events nationwide.",
    skills: ["Wedding Photography", "Event Photography", "Portrait Photography", "Sports Photography"],
    equipment: ["Canon EOS R5", "Sony A7 IV", "Various Prime & Zoom Lenses"],
  }

  // Recent Events
  const events = [
    {
      id: 1,
      title: "Golden Gate Marathon 2025",
      date: "2025-11-15",
      location: "San Francisco, CA",
      category: "Sports",
      photoCount: 342,
      coverImage: "/thumbnail.png",
    },
    {
      id: 2,
      title: "Tech Summit 2025",
      date: "2025-11-10",
      location: "San Francisco, CA",
      category: "Corporate",
      photoCount: 276,
      coverImage: "/thumbnail.png",
    },
    {
      id: 3,
      title: "Summer Wedding - Smith & Johnson",
      date: "2025-11-05",
      location: "Napa Valley, CA",
      category: "Wedding",
      photoCount: 518,
      coverImage: "/thumbnail.png",
    },
    {
      id: 4,
      title: "Bay Area Music Festival",
      date: "2025-10-28",
      location: "Oakland, CA",
      category: "Concert",
      photoCount: 892,
      coverImage: "/thumbnail.png",
    },
    {
      id: 5,
      title: "Corporate Holiday Party",
      date: "2025-10-20",
      location: "San Francisco, CA",
      category: "Corporate",
      photoCount: 167,
      coverImage: "/thumbnail.png",
    },
    {
      id: 6,
      title: "Charity Run 2025",
      date: "2025-10-15",
      location: "Berkeley, CA",
      category: "Sports",
      photoCount: 445,
      coverImage: "/thumbnail.png",
    },
  ]

  // Portfolio Photos
  const portfolioPhotos = [
    { id: 1, image: "/thumbnail.png", event: "Golden Gate Marathon", likes: 42 },
    { id: 2, image: "/thumbnail.png", event: "Tech Summit", likes: 38 },
    { id: 3, image: "/thumbnail.png", event: "Summer Wedding", likes: 156 },
    { id: 4, image: "/thumbnail.png", event: "Music Festival", likes: 89 },
    { id: 5, image: "/thumbnail.png", event: "Corporate Event", likes: 27 },
    { id: 6, image: "/thumbnail.png", event: "Charity Run", likes: 64 },
    { id: 7, image: "/thumbnail.png", event: "Beach Wedding", likes: 123 },
    { id: 8, image: "/thumbnail.png", event: "Marathon", likes: 51 },
    { id: 9, image: "/thumbnail.png", event: "Conference", likes: 33 },
  ]

  // Reviews
  const reviews = [
    {
      id: 1,
      author: "Michael Johnson",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2025-11-10",
      event: "Golden Gate Marathon 2025",
      comment: "Sarah did an amazing job capturing our marathon! The photos are stunning and she got so many great action shots. Highly recommend!",
    },
    {
      id: 2,
      author: "Emily Rodriguez",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2025-11-05",
      event: "Summer Wedding",
      comment: "We couldn't be happier with our wedding photos! Sarah was professional, creative, and captured every special moment perfectly.",
    },
    {
      id: 3,
      author: "David Park",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2025-10-28",
      event: "Tech Summit 2025",
      comment: "Excellent work at our corporate event. Sarah was unobtrusive yet managed to capture all the key moments and networking interactions.",
    },
  ]

  const categories = ["All", "Sports", "Wedding", "Corporate", "Concert"]
  const filteredEvents = selectedCategory === "All" 
    ? events 
    : events.filter(e => e.category === selectedCategory)

  return (
    <>
      <Header variant="solid" textVariant="dark" />
      
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Cover Photo */}
        <div className="relative h-64 bg-gradient-to-r from-cyan-500 to-blue-600">
          <Image
            src={photographer.coverPhoto}
            alt="Cover"
            fill
            className="object-cover opacity-30"
          />
        </div>

        {/* Profile Header */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 -mt-20 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden">
                  <Image
                    src={photographer.avatar}
                    alt={photographer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {photographer.verified && (
                  <div className="absolute bottom-0 right-0 bg-cyan-400 rounded-full p-2 border-2 border-white">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{photographer.name}</h1>
                    <p className="text-lg text-gray-600 mb-2">@{photographer.displayName}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{photographer.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Member since {photographer.memberSince}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-900">{photographer.rating}</span>
                      </div>
                      <span className="text-sm text-gray-600">({photographer.reviewCount} reviews)</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button disabled={true} className="px-4 py-2 bg-cyan-400 text-black rounded-lg font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      masyraaf14@gmail.com
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{photographer.totalEvents}</div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{photographer.totalPhotos.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Photos</div>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{photographer.reviewCount}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {["portfolio", "events", "about", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-semibold capitalize whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "text-cyan-600 border-b-2 border-cyan-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Portfolio Tab */}
              {activeTab === "portfolio" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Featured Portfolio</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded ${viewMode === "grid" ? "bg-cyan-100 text-cyan-600" : "text-gray-400 hover:bg-gray-100"}`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded ${viewMode === "list" ? "bg-cyan-100 text-cyan-600" : "text-gray-400 hover:bg-gray-100"}`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4" : "space-y-4"}>
                    {portfolioPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`relative group cursor-pointer overflow-hidden rounded-lg ${
                          viewMode === "grid" ? "" : "flex gap-4 bg-gray-50 p-4"
                        }`}
                      >
                        <div className={`relative ${viewMode === "grid" ? "aspect-square" : "w-32 h-32 flex-shrink-0"} bg-gray-200`}>
                          <Image
                            src={photo.image}
                            alt={photo.event}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                        {viewMode === "grid" ? (
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                            <p className="text-sm font-medium">{photo.event}</p>
                            <div className="flex items-center gap-1 text-xs">
                              <Heart className="w-3 h-3" />
                              <span>{photo.likes}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{photo.event}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Heart className="w-4 h-4" />
                              <span>{photo.likes} likes</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {activeTab === "events" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
                    <div className="flex items-center gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === cat
                              ? "bg-cyan-400 text-black"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="relative h-40 bg-gray-200">
                          <Image
                            src={event.coverImage}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium">
                            {event.category}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                            {event.title}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-1 text-sm text-cyan-600 font-medium">
                              <Camera className="w-4 h-4" />
                              <span>{event.photoCount} photos</span>
                            </div>
                            <button className="text-sm text-cyan-600 font-semibold hover:text-cyan-700">
                              View →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                    <p className="text-gray-600 leading-relaxed">{photographer.bio}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {photographer.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Equipment</h3>
                    <ul className="space-y-2">
                      {photographer.equipment.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-gray-600">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Reviews</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                        <span className="text-2xl font-bold">{photographer.rating}</span>
                      </div>
                      <span className="text-gray-600">Based on {photographer.reviewCount} reviews</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-6 last:border-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{review.author}</h4>
                                <p className="text-sm text-gray-500">{review.event}</p>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-20" />
      </div>
    </>
  )
}