"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#060C1A] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Account access</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white lg:text-5xl">
            Welcome back to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#93C5FD]">Span28</span>
          </h1>
          <p className="mt-4 max-w-md text-slate-400">
            Continue your configurator flow, manage quotes, and access admin or builder views from one dashboard.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-slate-400">Fast login</p>
              <p className="mt-1 font-semibold text-white">JWT-based</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-slate-400">Post-login</p>
              <p className="mt-1 font-semibold text-white">Role dashboard</p>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="w-full rounded-2xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl shadow-black/30">
            <h2 className="text-2xl font-semibold text-white">Sign in</h2>
            <p className="mt-1 text-sm text-slate-400">Use your account to continue.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-2.5 font-medium text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">
                Register
              </Link>
            </p>
          </div>
          <p className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
