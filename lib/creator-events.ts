// Client-side helpers for creator event management, wallet, and metrics.
// These call the Go backend directly (userId-scoped, no auth header needed),
// mirroring the pattern used elsewhere in the app.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";

export type EventStatus = "DRAFT" | "PUBLISHED" | "UNLISTED" | "ARCHIVED";

export interface CreatorEvent {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  date: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  thumbnailUrl?: string | null;
  status: EventStatus;
  publishedAt?: string | null;
  viewCount: number;
  createdAt: string;
  _count?: { images: number };
}

export interface EventMetrics {
  views: number;
  downloads: number;
  revenue: number;
  commissionRate: number;
  netRevenue: number;
}

export interface Wallet {
  grossEarnings: number;
  commissionRate: number;
  netEarnings: number;
  pendingWithdrawn: number;
  paidWithdrawn: number;
  availableBalance: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  note?: string | null;
  createdAt: string;
  processedAt?: string | null;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getMyEvents(
  userId: string,
  status?: EventStatus,
): Promise<{ data: CreatorEvent[]; pagination: unknown }> {
  const params = new URLSearchParams({ userId, limit: "100" });
  if (status) params.set("status", status);
  return handle(
    await fetch(`${API_BASE_URL}/event/mine?${params.toString()}`, {
      cache: "no-store",
    }),
  );
}

export async function updateEventStatus(
  eventId: string,
  userId: string,
  status: EventStatus,
) {
  return handle(
    await fetch(`${API_BASE_URL}/event/${eventId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    }),
  );
}

export async function getEventMetrics(
  eventId: string,
  userId: string,
): Promise<EventMetrics> {
  return handle(
    await fetch(
      `${API_BASE_URL}/event/${eventId}/metrics?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" },
    ),
  );
}

export async function recordEventView(eventId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/event/${eventId}/view`, { method: "POST" });
  } catch {
    // best-effort; a failed view count shouldn't break the page
  }
}

export async function getWallet(userId: string): Promise<Wallet> {
  return handle(
    await fetch(
      `${API_BASE_URL}/creator/wallet?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" },
    ),
  );
}

export async function listWithdrawals(
  userId: string,
): Promise<WithdrawalRequest[]> {
  return handle(
    await fetch(
      `${API_BASE_URL}/creator/withdrawals?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" },
    ),
  );
}

export async function requestWithdrawal(
  userId: string,
  amount: number,
): Promise<WithdrawalRequest> {
  return handle(
    await fetch(`${API_BASE_URL}/creator/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount }),
    }),
  );
}

export function formatRM(n: number): string {
  return `RM ${n.toFixed(2)}`;
}
