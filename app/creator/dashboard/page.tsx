"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Wallet as WalletIcon,
  TrendingUp,
  ImageIcon,
  Eye,
  ShoppingBag,
  Upload,
  FolderOpen,
  CalendarDays,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Header } from "@/app/components/Header";
import { formatRM } from "@/lib/creator-events";

// ---------------------------------------------------------------------------
// NOTE: Everything below is PLACEHOLDER data so the dashboard has a real shape
// to design against. The activity feed, earnings figures, and buyer list all
// need backend modules (sales aggregation, purchase records, activity log)
// before they show live numbers. Swap the constants for API calls once those
// endpoints exist.
// ---------------------------------------------------------------------------

const MOCK_STATS = {
  netEarnings: 1284.5,
  availableBalance: 640.0,
  photosSold: 37,
  totalViews: 5820,
};

type Activity = {
  id: string;
  kind: "sale" | "view" | "upload" | "payout";
  text: string;
  time: string;
};

const MOCK_ACTIVITY: Activity[] = [
  { id: "a1", kind: "sale", text: "Sold “Finish Line Sprint” — RM 25.00", time: "12 min ago" },
  { id: "a2", kind: "view", text: "Your KL Marathon 2026 album hit 500 views", time: "1 hr ago" },
  { id: "a3", kind: "upload", text: "You uploaded 24 new photos to Genting Trail", time: "3 hrs ago" },
  { id: "a4", kind: "sale", text: "Sold “Muddy Descent” — RM 30.00", time: "Yesterday" },
  { id: "a5", kind: "payout", text: "Withdrawal of RM 200.00 marked as PAID", time: "2 days ago" },
];

type Buyer = {
  id: string;
  name: string;
  photo: string;
  amount: number;
  when: string;
};

const MOCK_BUYERS: Buyer[] = [
  { id: "b1", name: "Aiman R.", photo: "Finish Line Sprint", amount: 25, when: "12 min ago" },
  { id: "b2", name: "Nurul H.", photo: "Muddy Descent", amount: 30, when: "Yesterday" },
  { id: "b3", name: "Wei Jie", photo: "Golden Hour Rider", amount: 20, when: "2 days ago" },
  { id: "b4", name: "Sara L.", photo: "Peak Push", amount: 35, when: "3 days ago" },
];

const ACTIVITY_ICON: Record<Activity["kind"], React.ReactNode> = {
  sale: <ShoppingBag className="w-4 h-4 text-green-600" />,
  view: <Eye className="w-4 h-4 text-blue-500" />,
  upload: <Upload className="w-4 h-4 text-cyan-600" />,
  payout: <WalletIcon className="w-4 h-4 text-amber-600" />,
};

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const firstName =
    session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there";

  const [toast, setToast] = useState<string | null>(null);

  // Show the "changes saved" confirmation handed over from the profile page.
  useEffect(() => {
    const msg = sessionStorage.getItem("creatorDashboardMessage");
    if (!msg) return;
    sessionStorage.removeItem("creatorDashboardMessage");
    // Defer the state update so it doesn't run synchronously inside the effect.
    const show = setTimeout(() => setToast(msg), 0);
    const hide = setTimeout(() => setToast(null), 3000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  const quickLinks = [
    { label: "Upload photos", href: "/creator/upload", icon: Upload },
    { label: "My contents", href: "/creator/contents", icon: FolderOpen },
    { label: "Events", href: "/creator/events", icon: CalendarDays },
    { label: "Wallet", href: "/creator/wallet", icon: WalletIcon },
  ];

  return (
    <>
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-slate-100">
        {toast && (
          <div className="fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-cyan-400 text-black animate-slide-in">
            {toast}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
          {/* Welcome */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Here&apos;s how your work is performing.
              </p>
            </div>
            <button
              onClick={() => router.push("/creator/upload")}
              className="flex items-center gap-2 bg-cyan-400 text-black px-5 py-2.5 rounded-lg font-semibold hover:bg-cyan-500 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload photos
            </button>
          </div>

          {/* Placeholder notice */}
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            These figures are sample data. Live earnings and activity will appear
            once the sales &amp; activity modules are connected.
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Net earnings"
              value={formatRM(MOCK_STATS.netEarnings)}
              icon={<TrendingUp className="w-5 h-5 text-green-600" />}
              accent="bg-green-50"
            />
            <StatCard
              label="Available balance"
              value={formatRM(MOCK_STATS.availableBalance)}
              icon={<WalletIcon className="w-5 h-5 text-cyan-600" />}
              accent="bg-cyan-50"
            />
            <StatCard
              label="Photos sold"
              value={String(MOCK_STATS.photosSold)}
              icon={<ImageIcon className="w-5 h-5 text-blue-600" />}
              accent="bg-blue-50"
            />
            <StatCard
              label="Total views"
              value={MOCK_STATS.totalViews.toLocaleString()}
              icon={<Eye className="w-5 h-5 text-purple-600" />}
              accent="bg-purple-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent activity */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">
                  Recent activity
                </h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {MOCK_ACTIVITY.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-6 py-4">
                    <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      {ACTIVITY_ICON[a.kind]}
                    </span>
                    <span className="text-sm text-gray-700 flex-1">{a.text}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {a.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  Quick actions
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {quickLinks.map(({ label, href, icon: Icon }) => (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className="flex flex-col items-start gap-2 p-4 rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent buyers */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Recent sales</h2>
              <button
                onClick={() => router.push("/creator/wallet")}
                className="flex items-center gap-1 text-xs font-medium text-cyan-600 hover:text-cyan-700"
              >
                View wallet <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-3 font-medium">Buyer</th>
                    <th className="px-6 py-3 font-medium">Photo</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_BUYERS.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-semibold">
                            {b.name.charAt(0)}
                          </span>
                          <span className="font-medium text-gray-800">
                            {b.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{b.photo}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {formatRM(b.amount)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        {b.when}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`w-9 h-9 rounded-lg ${accent} flex items-center justify-center`}>
          {icon}
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
