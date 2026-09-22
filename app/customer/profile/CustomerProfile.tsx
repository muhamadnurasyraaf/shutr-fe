"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ArrowLeft, Settings, Loader2, Mail } from "lucide-react";
import {
  updateCustomerProfile,
  type CustomerProfile as CustomerProfileType,
} from "@/app/api/actions/customer";

export default function CustomerProfile({
  profile,
}: {
  profile: CustomerProfileType;
}) {
  const [form, setForm] = useState({
    name: profile.name || "",
    displayName: profile.displayName || "",
    phoneNumber: profile.phoneNumber || "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const change = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const dirty =
    form.name !== (profile.name || "") ||
    form.displayName !== (profile.displayName || "") ||
    form.phoneNumber !== (profile.phoneNumber || "");

  const save = async () => {
    if (!form.name.trim()) {
      showToast("Full name is required.", "error");
      return;
    }
    setSaving(true);
    try {
      await updateCustomerProfile({
        userId: profile.id,
        name: form.name.trim(),
        displayName: form.displayName.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });
      showToast("Profile saved successfully!", "success");
    } catch {
      showToast("Failed to save profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-slate-100">
        {toast && (
          <div
            className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-in ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-cyan-400 text-black"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 py-8 pt-24">
          <Link
            href="/customer"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <Link
              href="/customer/settings"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          {/* Avatar + identity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={profile.image || undefined}
                  alt={profile.name || "User"}
                />
                <AvatarFallback className="bg-cyan-400 text-black text-xl font-semibold">
                  {profile.name?.charAt(0).toUpperCase() ||
                    profile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.displayName || profile.name || "Customer"}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          {/* Editable form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center">
                <User className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-500">Update your details</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => change("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => change("displayName", e.target.value)}
                    placeholder="How others will see you"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => change("phoneNumber", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Email is managed by your login provider
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-6 mt-8 border-t border-gray-200">
                <button
                  onClick={save}
                  disabled={saving || !dirty}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
                    saving || !dirty
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-400 text-black hover:bg-cyan-500"
                  }`}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
