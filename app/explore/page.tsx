"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Calendar, Users, Star, Camera, TrendingUp, Clock, Filter } from "lucide-react"
import { Header } from "../components/Header"

// Mock data for photographers
const topPhotographers = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "/asian-woman-photographer.jpg",
    specialty: "Wedding & Events",
    rating: 4.9,
    eventsShot: 127,
    location: "San Francisco, CA",
    verified: true,
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    avatar: "/latino-man-photographer.jpg",
    specialty: "Sports & Action",
    rating: 4.8,
    eventsShot: 89,
    location: "Austin, TX",
    verified: true,
  },
  {
    id: 3,
    name: "Emily Watson",
    avatar: "/woman-photographer-with-camera.jpg",
    specialty: "Corporate Events",
    rating: 4.9,
    eventsShot: 156,
    location: "New York, NY",
    verified: true,
  },
  {
    id: 4,
    name: "David Kim",
    avatar: "/asian-man-photographer.png",
    specialty: "Concerts & Music",
    rating: 4.7,
    eventsShot: 203,
    location: "Los Angeles, CA",
    verified: true,
  },
]

const thumbnailUrl = "/thumbnail.png"

// Mock data for recent events
const recentEvents = [
  {
    id: 1,
    title: "TechCrunch Disrupt 2025",
    image: thumbnailUrl,
    date: "2025-11-20",
    location: "San Francisco, CA",
    photographer: "Sarah Chen",
    photoCount: 342,
    category: "Technology",
  },
  {
    id: 2,
    title: "NBA Finals Game 7",
    image: thumbnailUrl,
    date: "2025-11-19",
    location: "Boston, MA",
    photographer: "Marcus Rodriguez",
    photoCount: 518,
    category: "Sports",
  },
  {
    id: 3,
    title: "Startup Founder Summit",
    image: thumbnailUrl,
    date: "2025-11-18",
    location: "Austin, TX",
    photographer: "Emily Watson",
    photoCount: 276,
    category: "Business",
  },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "photographers" | "events">("all")

  return (
    <div className="min-h-screen bg-background">
    <Header />
      <section className="relative overflow-hidden border-b border-border from-muted/30 via-background to-accent/20"
      style={{
            backgroundImage: 'url("/landing_page_image.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
              Discover Amazing Photography
            </h1>
            <p className="mb-8 text-lg text-muted-foreground text-slate-300 md:text-xl">
              Explore top photographers and recent events from around the world
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search photographers, events, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg"
              />
            </div>

            {/* Filter Tabs */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
              >
                <Filter className="mr-2 h-4 w-4" />
                All
              </Button>
              <Button
                variant={activeFilter === "photographers" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("photographers")}
              >
                <Camera className="mr-2 h-4 w-4" />
                Photographers
              </Button>
              <Button
                variant={activeFilter === "events" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("events")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Top Photographers Section */}
        {(activeFilter === "all" || activeFilter === "photographers") && (
          <section className="mb-16">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">Top Photographers</h2>
              </div>
              <Button variant="ghost">View All</Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {topPhotographers.map((photographer) => (
                <Card
                  key={photographer.id}
                  className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:border-primary/50"
                  onClick={() => console.log("Navigate to photographer:", photographer.name)}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex flex-col items-center text-center">
                      <Avatar className="mb-4 h-24 w-24 border-4 border-border ring-2 ring-primary/20 transition-transform group-hover:scale-105">
                        <AvatarImage src={photographer.avatar || "/placeholder.svg"} alt={photographer.name} />
                        <AvatarFallback>
                          {photographer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <h3 className="mb-1 text-lg font-semibold text-foreground">{photographer.name}</h3>
                      <p className="mb-3 text-sm text-muted-foreground">{photographer.specialty}</p>

                      {/* Stats */}
                      <div className="mb-4 flex w-full items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-semibold">{photographer.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Camera className="h-4 w-4" />
                          <span>{photographer.eventsShot}</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{photographer.location}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log("View profile:", photographer.name)
                      }}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recent Events Section */}
        {(activeFilter === "all" || activeFilter === "events") && (
          <section>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">Recent Events</h2>
              </div>
              <Button variant="ghost">View All</Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentEvents.map((event) => (
                <Card
                  key={event.id}
                  className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:border-primary/50"
                  onClick={() => console.log("Navigate to event:", event.title)}
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute right-3 top-3 bg-background/90 text-foreground hover:bg-background/90">
                      {event.category}
                    </Badge>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5 shrink-0" />
                        <span>by {event.photographer}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                        <Users className="h-4 w-4" />
                        <span>{event.photoCount.toLocaleString()} photos</span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log("View photos:", event.title)
                        }}
                      >
                        View Photos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-12 flex justify-center">
              <Button size="lg" variant="outline">
                Load More Events
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
