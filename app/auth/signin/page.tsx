"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

type UserType = "Creator" | "Customer";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Passwordless email-code flow state.
  const [emailType, setEmailType] = useState<UserType>("Customer");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailInfo, setEmailInfo] = useState<string | null>(null);

  const handleGoogleSignIn = async (userType: UserType) => {
    try {
      setIsLoading(userType);

      Cookies.set("pending_user_type", userType, { expires: 1 });
      setError(null);
      const callbackUrl = userType === "Creator" ? "/creator" : "/customer";
      await signIn("google", { callbackUrl });
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(null);
    }
  };

  const handleSendCode = async () => {
    setError(null);
    setEmailInfo(null);
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    try {
      setEmailBusy(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/email/request-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), type: emailType }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to send code.");
      }
      setCodeSent(true);
      setEmailInfo("We've sent a login code to your email. Enter it below.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send code. Try again."
      );
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyCode = async () => {
    setError(null);
    if (!code.trim()) {
      setError("Please enter the code from your email.");
      return;
    }
    try {
      setEmailBusy(true);
      const callbackUrl = emailType === "Creator" ? "/creator" : "/customer";
      const result = await signIn("email-code", {
        email: email.trim(),
        code: code.trim(),
        type: emailType,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError("Invalid or expired code. Please try again.");
        return;
      }
      window.location.href = result?.url || callbackUrl;
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error("Verify code error:", err);
    } finally {
      setEmailBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="text-2xl font-bold">
              <span className="text-white">Shutr</span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-xl">
          {/* Heading */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Welcome to Shutr
          </h1>
          <p className="text-center text-gray-400 text-sm mb-8">
            Find your best moments from your favorite events
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Sign In as Customer Button */}
          <button
            onClick={() => handleGoogleSignIn("Customer")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="currentColor"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="currentColor"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="currentColor"
              />
            </svg>
            {isLoading === "Customer"
              ? "Signing in..."
              : "Continue as Customer"}
          </button>

          {/* Sign In as Creator Button */}
          <button
            onClick={() => handleGoogleSignIn("Creator")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="currentColor"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="currentColor"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="currentColor"
              />
            </svg>
            {isLoading === "Creator" ? "Signing in..." : "Continue as Creator"}
          </button>

          {/* Divider: email */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Email code flow */}
          <div className="mb-6">
            {/* Account type toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(["Customer", "Creator"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEmailType(t)}
                  disabled={emailBusy}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                    emailType === t
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-gray-300 border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={emailBusy || codeSent}
              className="w-full py-3 px-4 mb-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-60"
            />

            {!codeSent ? (
              <button
                type="button"
                onClick={handleSendCode}
                disabled={emailBusy}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailBusy ? "Sending code..." : "Send login code"}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  disabled={emailBusy}
                  className="w-full py-3 px-4 mb-3 tracking-[0.4em] text-center bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={emailBusy}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailBusy ? "Verifying..." : "Verify & sign in"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCodeSent(false);
                    setCode("");
                    setEmailInfo(null);
                  }}
                  disabled={emailBusy}
                  className="w-full mt-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Use a different email
                </button>
              </>
            )}

            {emailInfo && (
              <p className="mt-3 text-sm text-green-400 text-center">
                {emailInfo}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">
                Or continue as guest
              </span>
            </div>
          </div>

          {/* Guest Button */}
          <Link
            href="/"
            className="w-full block text-center py-3 px-4 border border-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue as Guest
          </Link>

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
