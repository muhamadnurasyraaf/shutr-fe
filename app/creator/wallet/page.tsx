"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Header } from "@/app/components/Header";
import {
  getWallet,
  listWithdrawals,
  requestWithdrawal,
  formatRM,
  type Wallet,
  type WithdrawalRequest,
} from "@/lib/creator-events";
import { Wallet as WalletIcon, Loader2, ArrowLeft } from "lucide-react";

const STATUS_STYLES: Record<WithdrawalRequest["status"], string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
};

export default function WalletPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [w, h] = await Promise.all([
        getWallet(userId),
        listWithdrawals(userId),
      ]);
      setWallet(w);
      setHistory(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!userId) return;
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      await requestWithdrawal(userId, value);
      setSuccess("Withdrawal request submitted.");
      setAmount("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to request withdrawal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header variant="solid" textVariant="dark" />
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-8 pt-24">
          <Link
            href="/creator/events"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to events
          </Link>

          <div className="flex items-center gap-2 mb-6">
            <WalletIcon className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-bold text-gray-800">Wallet & Payouts</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            wallet && (
              <>
                {/* Balance cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <BalanceCard
                    label="Available"
                    value={formatRM(wallet.availableBalance)}
                    highlight
                  />
                  <BalanceCard
                    label="Net earnings"
                    value={formatRM(wallet.netEarnings)}
                  />
                  <BalanceCard
                    label="Pending payout"
                    value={formatRM(wallet.pendingWithdrawn)}
                  />
                  <BalanceCard
                    label="Paid out"
                    value={formatRM(wallet.paidWithdrawn)}
                  />
                </div>

                <p className="text-xs text-gray-400 mb-6">
                  Gross sales {formatRM(wallet.grossEarnings)} · platform
                  commission {Math.round(wallet.commissionRate * 100)}% · you
                  keep {100 - Math.round(wallet.commissionRate * 100)}%.
                </p>

                {/* Withdraw form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="font-semibold text-gray-800 mb-3">
                    Request a withdrawal
                  </h2>
                  {error && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                      {success}
                    </div>
                  )}
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (RM)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Up to ${formatRM(wallet.availableBalance)}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={submit}
                      disabled={busy || wallet.availableBalance <= 0}
                      className="px-6 py-2 rounded-lg font-semibold bg-cyan-400 text-black hover:bg-cyan-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {busy ? "Submitting…" : "Withdraw"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Payouts are reviewed and sent to your registered bank
                    account. Requires banking details on file.
                  </p>
                </div>

                {/* History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-800">
                      Withdrawal history
                    </h2>
                  </div>
                  {history.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-400 text-sm">
                      No withdrawals yet.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="text-left px-6 py-2 font-medium">
                            Date
                          </th>
                          <th className="text-left px-6 py-2 font-medium">
                            Amount
                          </th>
                          <th className="text-left px-6 py-2 font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((w) => (
                          <tr key={w.id} className="border-t border-gray-100">
                            <td className="px-6 py-3 text-gray-600">
                              {new Date(w.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3 font-semibold text-gray-800">
                              {formatRM(w.amount)}
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[w.status]}`}
                              >
                                {w.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </>
  );
}

function BalanceCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? "bg-cyan-50 border-cyan-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`text-xl font-bold ${highlight ? "text-cyan-700" : "text-gray-800"}`}
      >
        {value}
      </div>
    </div>
  );
}
