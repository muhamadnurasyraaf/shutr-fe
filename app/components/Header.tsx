"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();

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

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Search Events
            </Link>
            <Link
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Top Photographers
            </Link>
            <Link
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Help / FAQ
            </Link>
            <Link
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="text-sm text-white/70">
                  {session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-white/20 rounded hover:bg-white/10 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 text-sm font-semibold text-black bg-cyan-400 rounded hover:bg-cyan-300 transition-colors"
              >
                Continue with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
