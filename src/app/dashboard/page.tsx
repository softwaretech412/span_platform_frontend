"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const cards = [
  {
    href: "/configurator",
    title: "3D Configurator",
    description: "Design your outdoor structure with real-time 3D preview, address-based compliance, and instant quotes.",
    icon: "◈",
    cta: "Start designing",
    accent: "teal",
  },
  {
    href: "/admin",
    title: "Admin",
    description: "Manage quotes, rules, pricing, and addons. View dashboard and recent activity.",
    icon: "⚙",
    cta: "Open admin",
    accent: "slate",
  },
  {
    href: "/builder",
    title: "Builder",
    description: "View-only access to quotes and projects. Review jobs and specifications.",
    icon: "▣",
    cta: "View quotes",
    accent: "amber",
  },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#060C1A] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Workspace</p>
            <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">Dashboard</h1>
            <p className="mt-2 text-slate-400">Welcome back, {user.name || user.email}. Pick up where you left off.</p>
          </div>
          <Link
            href="/configurator"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-blue-600 hover:to-blue-700"
          >
            Start new design
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Account", value: "Active" },
            { label: "Modules", value: "Configurator / Admin / Builder" },
            { label: "Quick access", value: "3 areas ready" },
            { label: "Session", value: "Authenticated" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-[#0F172A] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col rounded-2xl border border-white/10 bg-[#0F172A] p-6 transition-all hover:border-blue-500/40 hover:bg-[#111b35]"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-400">
                {card.icon}
              </span>
              <h2 className="text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-400">{card.description}</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-400 group-hover:text-blue-300">
                {card.cta}
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#0F172A] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Quick links</h2>
            <ul className="mt-3 flex flex-wrap gap-4">
              <li>
                <Link href="/configurator" className="text-sm text-blue-400 hover:underline">Configurator</Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-blue-400 hover:underline">Admin dashboard</Link>
              </li>
              <li>
                <Link href="/builder" className="text-sm text-blue-400 hover:underline">Builder view</Link>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0F172A] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Next steps</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Search address and run compliance checks.</li>
              <li>• Create a quote from BOM results.</li>
              <li>• Review quotes in admin or builder panel.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
