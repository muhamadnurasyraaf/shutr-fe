"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  variant?: "transparent" | "solid";
  textVariant?: "light" | "dark";
}

export function Header({
  variant = "solid",
  textVariant = "light",
}: HeaderProps) {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (variant !== "transparent") return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  // Determine styles based on variant and scroll state
  const isTransparent = variant === "transparent" && !isScrolled;
  const bgClass = isTransparent
    ? "bg-transparent"
    : "bg-white backdrop-blur border-b border-gray-200";

  // Text color logic: if transparent header or textVariant is light, use white text
  // Otherwise use dark text for white backgrounds
  const useWhiteText =
    isTransparent || (variant === "solid" && textVariant === "light");
  const textClass = useWhiteText ? "text-white" : "text-gray-900";
  const hoverTextClass = useWhiteText
    ? "hover:text-cyan-400"
    : "hover:text-cyan-600";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${bgClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-xl font-bold">
              <span className="text-cyan-400">S</span>
              <span className={textClass}>hutr</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`${textClass} ${hoverTextClass} transition-colors text-sm font-medium`}
            >
              Home
            </Link>
            <Link
              href="/events"
              className={`${textClass} ${hoverTextClass} transition-colors text-sm font-medium`}
            >
              Search Events
            </Link>
            <Link
              href="/top-photographers"
              className={`${textClass} ${hoverTextClass} transition-colors text-sm font-medium`}
            >
              Photographers
            </Link>
            <Link
              href="/help"
              className={`${textClass} ${hoverTextClass} transition-colors text-sm font-medium`}
            >
              Help / FAQ
            </Link>
            <Link
              href="/contact"
              className={`${textClass} ${hoverTextClass} transition-colors text-sm font-medium`}
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full">
                  <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all">
                    <AvatarImage
                      src={session.user?.image || undefined}
                      alt={session.user?.name || "User"}
                    />
                    <AvatarFallback className="bg-cyan-400 text-black text-sm font-semibold">
                      {session.user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border-gray-200"
                >
                  <DropdownMenuLabel className="text-gray-900">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem
                    asChild
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                  >
                    <Link href="/creator" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                  >
                    <Link
                      href="/creator/contents"
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>My Content</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="px-4 py-2 text-sm font-semibold text-white bg-cyan-400 rounded hover:bg-cyan-500 transition-colors"
                >
                  Login / Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
