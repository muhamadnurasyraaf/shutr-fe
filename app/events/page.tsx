"use client"

import { useState } from "react"
import { Header } from "../components/Header"
import { Search, MapPin, Calendar, Camera, Users, Filter, X } from "lucide-react"
import Image from "next/image"

export default function SearchEventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const categories = ["All", "Marathon", "Sports", "Concert", "Wedding", "Corporate", "Festival"]

  const events = [
    {
      id: 1,
      title: "Score Marathon 2025",
      image: "/thumbnail.png",
      date: "2025-12-15",
      location: "San Francisco, CA",
      photographer: "Sarah Chen",
      photographerCount: 24,
      photoCount: 342,
      category: "Marathon",
      featured: true,
    },
    {
      id: 2,
      title: "NBA Finals Game 7",
      image: "/thumbnail.png",
      date: "2025-12-10",
      location: "Boston, MA",
      photographer: "Marcus Rodriguez",
      photographerCount: 15,
      photoCount: 518,
      category: "Sports",
      featured: true,
    },
    {
      id: 3,
      title: "Tech Summit 2025",
      image: "/thumbnail.png",
      date: "2025-12-05",
      location: "Austin, TX",
      photographer: "Emily Watson",
      photographerCount: 18,
      photoCount: 276,
      category: "Corporate",
      featured: false,
    },
    {
      id: 4,
      title: "Summer Music Festival",
      image: "/thumbnail.png",
      date: "2025-11-30",
      location: "Los Angeles, CA",
      photographer: "David Kim",
      photographerCount: 32,
      photoCount: 892,
      category: "Concert",
      featured: true,
    },
    {
      id: 5,
      title: "City Marathon 2025",
      image: "/thumbnail.png",
      date: "2025-11-25",
      location: "New York, NY",
      photographer: "Jessica Martinez",
      photographerCount: 45,
      photoCount: 1240,
      category: "Marathon",
      featured: false,
    },
    {
      id: 6,
      title: "Wedding Expo 2025",
      image: "/thumbnail.png",
      date: "2025-11-20",
      location: "Miami, FL",
      photographer: "Ryan Thompson",
      photographerCount: 12,
      photoCount: 167,
      category: "Wedding",
      featured: false,
    },
  ]

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory
    const matchesLocation = !selectedLocation || event.location.includes(selectedLocation)
    const matchesDate = !selectedDate || event.date === selectedDate
    
    return matchesSearch && matchesCategory && matchesLocation && matchesDate
  })

  const clearFilters = () => {
    setSelectedDate("")
    setSelectedLocation("")
    setSelectedCategory("All")
    setSearchQuery("")
  }

  return (
    <>
      <Header variant="solid" textVariant="dark" />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Search Events</h1>
              <p className="text-lg md:text-xl text-cyan-100 max-w-2xl mx-auto">
                Find your photos from thousands of events captured by professional photographers
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by event name, location, or photographer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto flex-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-cyan-400 text-black"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="Enter city or state"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-6">
            <p className="text-gray-600">
              Found <span className="font-semibold">{filteredEvents.length}</span> events
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </p>
          </div>

          {/* Featured Events */}
          {filteredEvents.some(e => e.featured) && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.filter(e => e.featured).map((event) => (
                  <EventCard key={event.id} event={event} featured />
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-cyan-400 text-black rounded-lg font-semibold hover:bg-cyan-500 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Load More */}
          {filteredEvents.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="px-8 py-3 border border-cyan-400 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
                Load More Events
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

function EventCard({ event, featured = false }: { event: any; featured?: boolean }) {
  return (
    <div className={`bg-white rounded-lg border overflow-hidden hover:shadow-xl transition-all cursor-pointer ${
      featured ? "border-cyan-400 ring-2 ring-cyan-100" : "border-gray-200"
    }`}>
      {/* Event Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
        />
        {featured && (
          <div className="absolute top-3 left-3 bg-cyan-400 text-black px-3 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium text-gray-700">
          {event.category}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-1">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 shrink-0" />
            <span>{event.photographerCount} photographers</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-sm font-medium text-cyan-600">
            <Users className="h-4 w-4" />
            <span>{event.photoCount.toLocaleString()} photos</span>
          </div>
          <button className="px-4 py-2 bg-cyan-400 text-black text-sm font-semibold rounded-lg hover:bg-cyan-500 transition-colors">
            View Photos
          </button>
        </div>
      </div>
    </div>
  )
}