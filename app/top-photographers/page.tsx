"use client"

import { useState } from "react"
import { Header } from "../components/Header"
import { Star, MapPin, Camera, Mail, Phone, Award } from "lucide-react"
import Image from "next/image"

export default function TopPhotographersPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "Sports", "Events", "Wedding", "Portrait", "Commercial"]

  const photographers = [
    {
      id: 1,
      name: "Sarah Chen",
      displayName: "SarahChen_Photos",
      avatar: "/asian-woman-photographer.jpg",
      specialty: "Wedding & Events",
      rating: 4.9,
      reviewCount: 156,
      eventsShot: 127,
      location: "San Francisco, CA",
      verified: true,
      price: "$$$$",
      description: "Award-winning wedding photographer specializing in candid moments and emotional storytelling.",
      coverPhoto: "/thumbnail.png",
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      displayName: "MarcusRodriguez_Sports",
      avatar: "/latino-man-photographer.jpg",
      specialty: "Sports",
      rating: 4.8,
      reviewCount: 132,
      eventsShot: 89,
      location: "Austin, TX",
      verified: true,
      price: "$$$",
      description: "Professional sports photographer capturing the intensity and passion of athletic competition.",
      coverPhoto: "/thumbnail.png",
    },
    {
      id: 3,
      name: "Emily Watson",
      displayName: "EmilyWatson_Corporate",
      avatar: "/woman-photographer-with-camera.jpg",
      specialty: "Events",
      rating: 4.9,
      reviewCount: 198,
      eventsShot: 156,
      location: "New York, NY",
      verified: true,
      price: "$$$$",
      description: "Corporate event specialist with a keen eye for detail and professional composition.",
      coverPhoto: "/thumbnail.png",
    },
    {
      id: 4,
      name: "David Kim",
      displayName: "DavidKim_Concerts",
      avatar: "/asian-man-photographer.png",
      specialty: "Events",
      rating: 4.7,
      reviewCount: 143,
      eventsShot: 203,
      location: "Los Angeles, CA",
      verified: true,
      price: "$$$",
      description: "Concert and music event photographer bringing energy and artistry to every shot.",
      coverPhoto: "/thumbnail.png",
    },
    {
      id: 5,
      name: "Jessica Martinez",
      displayName: "JessicaMartinez_Weddings",
      avatar: "/asian-woman-photographer.jpg",
      specialty: "Wedding",
      rating: 5.0,
      reviewCount: 210,
      eventsShot: 145,
      location: "Miami, FL",
      verified: true,
      price: "$$$$",
      description: "Luxury wedding photographer creating timeless memories with elegance and style.",
      coverPhoto: "/thumbnail.png",
    },
    {
      id: 6,
      name: "Ryan Thompson",
      displayName: "RyanThompson_Action",
      avatar: "/latino-man-photographer.jpg",
      specialty: "Sports",
      rating: 4.8,
      reviewCount: 167,
      eventsShot: 98,
      location: "Denver, CO",
      verified: true,
      price: "$$$",
      description: "Action sports photographer specializing in extreme sports and outdoor adventures.",
      coverPhoto: "/thumbnail.png",
    },
  ]

  const filteredPhotographers = selectedCategory === "All" 
    ? photographers 
    : photographers.filter(p => p.specialty.includes(selectedCategory))

  return (
    <>
      <Header variant="solid" textVariant="dark" />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Top Photographers</h1>
              <p className="text-lg md:text-xl text-cyan-100 max-w-2xl mx-auto">
                Discover talented photographers capturing moments at events worldwide
              </p>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 overflow-x-auto">
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
          </div>
        </section>

        {/* Photographers Grid */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredPhotographers.length}</span> photographers
            </p>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
              <option>Sort by: Top Rated</option>
              <option>Sort by: Most Events</option>
              <option>Sort by: Recent</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotographers.map((photographer) => (
              <div
                key={photographer.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Cover Photo */}
                <div className="relative h-32 bg-gradient-to-r from-cyan-400 to-blue-500">
                  <Image
                    src={photographer.coverPhoto}
                    alt="Cover"
                    fill
                    className="object-cover opacity-50"
                  />
                </div>

                {/* Avatar */}
                <div className="relative px-6 pb-6">
                  <div className="absolute -top-12 left-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                        <Image
                          src={photographer.avatar}
                          alt={photographer.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {photographer.verified && (
                        <div className="absolute bottom-0 right-0 bg-cyan-400 rounded-full p-1">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-14">
                    <h3 className="text-xl font-bold text-gray-900">{photographer.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">@{photographer.displayName}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-900">{photographer.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({photographer.reviewCount} reviews)</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        <span>{photographer.eventsShot} events</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{photographer.location}</span>
                      </div>
                    </div>

                    {/* Specialty */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium">
                        {photographer.specialty}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {photographer.description}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-cyan-500 transition-colors">
                        View Profile
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 flex justify-center">
            <button className="px-8 py-3 border border-cyan-400 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
              Load More Photographers
            </button>
          </div>
        </section>
      </div>
    </>
  )
}