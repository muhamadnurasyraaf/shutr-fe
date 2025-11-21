"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut } from "lucide-react"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-xl font-bold">
              <span className="text-blue-400">S</span>
              <span className="text-white">hutr</span>
            </div>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full">
                  <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all">
                    <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                    <AvatarFallback className="bg-cyan-400 text-black text-sm font-semibold">
                      {session.user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/95 backdrop-blur border-white/10">
                  <DropdownMenuLabel className="text-white/90">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{session.user?.name || "User"}</p>
                      <p className="text-xs text-white/50">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="text-white/70 hover:text-white hover:bg-white/10 cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 text-sm font-semibold text-white bg-cyan-400 rounded hover:bg-cyan-300 transition-colors"
              >
                Join as Creator
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
