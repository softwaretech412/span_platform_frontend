"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#060C1A] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Get started</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white lg:text-5xl">
            Create your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#93C5FD]">Span28 account</span>
          </h1>
          <p className="mt-4 max-w-md text-slate-400">
            Register once to save quotes, access your dashboard, and continue your design flow anytime.
          </p>
          <div className="mt-8 space-y-3 text-sm text-slate-300">
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">✓ Manage configurator quotes</p>
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">✓ Access admin or builder areas by role</p>
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">✓ Continue from any device</p>
          </div>
        </div>

        <div>
          <div className="w-full rounded-2xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl shadow-black/30">
            <h2 className="text-2xl font-semibold text-white">Register</h2>
            <p className="mt-1 text-sm text-slate-400">Start your design workspace.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-slate-300">
                  Full name
                </label>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="register-email"
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
                <label htmlFor="register-password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label htmlFor="register-confirm" className="block text-sm font-medium text-slate-300">
                  Confirm password
                </label>
                <input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-2.5 font-medium text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
              >
                {submitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300">
                Log in
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
