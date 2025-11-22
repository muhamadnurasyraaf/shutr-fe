"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MapPin, Calendar, Camera } from "lucide-react"
import { Header } from "../components/Header"

// Mock data for photographers
const topPhotographers = [
  {
    id: 1,
    name: "John Meurhon",
    avatar: "/asian-woman-photographer.jpg",
  },
  {
    id: 2,
    name: "John Meurhon",
    avatar: "/latino-man-photographer.jpg",
  },
  {
    id: 3,
    name: "John Meurhon",
    avatar: "/woman-photographer-with-camera.jpg",
  },
]

const thumbnailUrl = "/thumbnail.png"

// Mock data for recent events - 6 events to match the image
const recentEvents = [
  {
    id: 1,
    title: "Score Marathon 2025",
    image: thumbnailUrl,
  },
  {
    id: 2,
    title: "Score Marathon 2025",
    image: thumbnailUrl,
  },
  {
    id: 3,
    title: "Score Marathon 2025",
    image: thumbnailUrl,
  },
  {
    id: 4,
    title: "Score Marathon 2025",
    image: thumbnailUrl,
  },
  {
    id: 5,
    title: "Score Marathon 2025",
    image: thumbnailUrl,
  },
  {
    id: 6,
    title: "Score Marathon 2025",
    image: thumbnailUrl,
  },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-white">
      <Header variant="solid" textVariant="dark"/>
      
      {/* Top Filter Section */}
      <section className="bg-gray-50 border-b border-gray-200 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm text-gray-600 mb-4">
            Showing results for "<span className="text-cyan-500">Marathon</span>"
          </p>
          
          <div className="flex gap-3 mb-6">
            <Button variant="outline" size="sm" className="rounded-full border-gray-300">
              <MapPin className="h-4 w-4 mr-1" />
              Filter events
            </Button>
            <Button variant="outline" size="sm" className="rounded-full border-gray-300">
              <Calendar className="h-4 w-4 mr-1" />
              By date
            </Button>
            <Button variant="outline" size="sm" className="rounded-full border-gray-300">
              <Camera className="h-4 w-4 mr-1" />
              By location
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Input
              type="text"
              placeholder="Enter Event Name / Photographer Profile"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 bg-white border-gray-300"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-cyan-400 text-white rounded hover:bg-cyan-500 transition-colors">
              🔍
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Photographers Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Photographers</h2>

          <div className="grid grid-cols-3 gap-6">
            {topPhotographers.map((photographer) => (
              <div
                key={photographer.id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => console.log("Navigate to photographer:", photographer.name)}
              >
                <Avatar className="h-24 w-24 mb-3">
                  <AvatarImage src={photographer.avatar || "/placeholder.svg"} alt={photographer.name} />
                  <AvatarFallback className="bg-gray-200 text-gray-600">
                    {photographer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-sm font-medium text-gray-900">{photographer.name}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Events Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Events</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden border border-gray-300 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => console.log("Navigate to event:", event.title)}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <CardContent className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    {event.title}
                  </h3>
                  <Button
                    size="sm"
                    className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log("View photos:", event.title)
                    }}
                  >
                    View Photos
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 flex justify-center">
            <Button 
              variant="outline" 
              className="border-cyan-400 text-cyan-500 hover:bg-cyan-50 px-8"
            >
              Load more
            </Button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold mb-4">
              <span className="text-cyan-400">S</span>
              <span className="text-gray-900">hutr</span>
            </div>
            <p className="text-sm text-gray-500">
              Find your best moment in every event photo.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/events" className="hover:text-cyan-500">Search Events</a></li>
              <li><a href="/photographers" className="hover:text-cyan-500">Find Photographers</a></li>
              <li><a href="/faq" className="hover:text-cyan-500">Top Photographers</a></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/help" className="hover:text-cyan-500">Help Center</a></li>
              <li><a href="/contact" className="hover:text-cyan-500">Contact Us</a></li>
              <li><a href="/faq" className="hover:text-cyan-500">FAQ</a></li>
            </ul>
            
            <h4 className="font-semibold text-gray-900 mb-3 mt-6">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/privacy" className="hover:text-cyan-500">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-cyan-500">Terms of Service</a></li>
              <li><a href="/cookies" className="hover:text-cyan-500">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2025 Shutr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}