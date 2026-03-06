"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Design your outdoor structure
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Australian outdoor structure configurator with real-time 3D preview, council compliance, and instant quotes. 
            Enter your address and build with confidence.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/configurator"
              className="w-full rounded-xl bg-teal-600 px-8 py-3.5 text-center font-semibold text-white shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:w-auto"
            >
              Start Configurator
            </Link>
            {!loading && (
              user ? (
                <Link
                  href="/dashboard"
                  className="w-full rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-center font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-center font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="w-full rounded-xl border border-teal-600 bg-white px-8 py-3.5 text-center font-medium text-teal-600 hover:bg-teal-50 sm:w-auto"
                  >
                    Register
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">◈</div>
              <h3 className="mt-3 font-semibold text-slate-900">3D configurator</h3>
              <p className="mt-1 text-sm text-slate-500">Real-time visual feedback as you adjust dimensions and options.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">📍</div>
              <h3 className="mt-3 font-semibold text-slate-900">Address-based compliance</h3>
              <p className="mt-1 text-sm text-slate-500">Council rules and setbacks for your exact address, automatically.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">📋</div>
              <h3 className="mt-3 font-semibold text-slate-900">Instant quotes</h3>
              <p className="mt-1 text-sm text-slate-500">BOM, pricing, and supplier info as you design.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-semibold text-slate-900">Ready to get started?</h2>
          <p className="mt-2 text-slate-600">Use the configurator with or without an account. Register to save quotes and access your dashboard.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/configurator" className="text-sm font-medium text-teal-600 hover:text-teal-700">Start Configurator →</Link>
            {!user && !loading && (
              <Link href="/register" className="text-sm font-medium text-teal-600 hover:text-teal-700">Create account →</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
