"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Header } from "@/app/components/Header";
import {
  ArrowLeft,
  User,
  Mail,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Heart,
  LogOut,
} from "lucide-react";
import type { CustomerProfile } from "@/app/api/actions/customer";

export default function CustomerSettings({
  profile,
}: {
  profile: CustomerProfile;
}) {
  const joined = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-8 pt-24">
          <Link
            href="/customer"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

          {/* Account details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700">
                Account details
              </h2>
            </div>
            <dl className="divide-y divide-gray-100">
              <Row
                icon={<Mail className="w-4 h-4 text-gray-400" />}
                label="Email"
                value={profile.email}
              />
              <Row
                icon={<BadgeCheck className="w-4 h-4 text-gray-400" />}
                label="Account type"
                value={profile.type}
              />
              <Row
                icon={<CalendarDays className="w-4 h-4 text-gray-400" />}
                label="Member since"
                value={joined}
              />
            </dl>
          </div>

          {/* Manage */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700">Manage</h2>
            </div>
            <div className="divide-y divide-gray-100">
              <NavRow
                href="/customer/profile"
                icon={<User className="w-4 h-4 text-cyan-600" />}
                label="Edit profile"
                sub="Update your name, display name and phone"
              />
              <NavRow
                href="/customer/contents"
                icon={<Heart className="w-4 h-4 text-cyan-600" />}
                label="My saved contents"
                sub="Photos you've purchased and saved"
              />
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-red-600 font-semibold px-6 py-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      {icon}
      <dt className="text-sm text-gray-500 w-32 flex-shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-gray-800 break-all">{value}</dd>
    </div>
  );
}

function NavRow({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
    >
      <span className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300" />
    </Link>
  );
}
