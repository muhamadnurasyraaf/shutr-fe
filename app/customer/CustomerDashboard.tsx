"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Search,
  Image as ImageIcon,
  Calendar,
  Camera,
  Download,
  Heart,
  Settings,
  ChevronRight,
} from "lucide-react";

interface CustomerDashboardProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    displayName?: string | null;
    type?: "Creator" | "Customer";
  };
}

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "purchases" | "saved">(
    "overview"
  );

  return (
    <>
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="bg-cyan-400 text-black text-xl font-semibold">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.displayName || user.name || "there"}!
                </h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <Link href="/customer/settings">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Left Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "overview"
                        ? "bg-cyan-50 text-cyan-600 border-2 border-cyan-400"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Overview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("purchases")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "purchases"
                        ? "bg-cyan-50 text-cyan-600 border-2 border-cyan-400"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Download className="h-5 w-5" />
                    <span className="font-medium">My Purchases</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "saved"
                        ? "bg-cyan-50 text-cyan-600 border-2 border-cyan-400"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Heart className="h-5 w-5" />
                    <span className="font-medium">Saved Photos</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link href="/explore">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                              <Search className="h-6 w-6 text-cyan-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                Find My Photos
                              </h3>
                              <p className="text-sm text-gray-500">
                                Search by face
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </CardContent>
                        </Card>
                      </Link>

                      <Link href="/events">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                Browse Events
                              </h3>
                              <p className="text-sm text-gray-500">
                                Find event photos
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </CardContent>
                        </Card>
                      </Link>

                      <Link href="/top-photographers">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Camera className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                Photographers
                              </h3>
                              <p className="text-sm text-gray-500">
                                Top creators
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                            <p className="text-sm text-gray-500">Photos Purchased</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                            <p className="text-sm text-gray-500">Events Visited</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Heart className="h-6 w-6 text-pink-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                            <p className="text-sm text-gray-500">Saved Photos</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Activity
                    </h2>
                    <div className="text-center py-12">
                      <ImageIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No recent activity yet</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Start by exploring events and finding your photos!
                      </p>
                      <Link href="/explore">
                        <Button className="mt-4 bg-cyan-400 hover:bg-cyan-500 text-black">
                          Explore Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "purchases" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    My Purchases
                  </h2>
                  <div className="text-center py-12">
                    <Download className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No purchases yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Photos you purchase will appear here for easy download.
                    </p>
                    <Link href="/explore">
                      <Button className="mt-4 bg-cyan-400 hover:bg-cyan-500 text-black">
                        Find Photos
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "saved" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Saved Photos
                  </h2>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No saved photos yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Save photos you like to purchase them later.
                    </p>
                    <Link href="/events">
                      <Button className="mt-4 bg-cyan-400 hover:bg-cyan-500 text-black">
                        Browse Events
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
