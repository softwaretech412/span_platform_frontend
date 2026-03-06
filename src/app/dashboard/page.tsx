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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">Welcome back, {user.name || user.email}. Choose where to go next.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-lg text-teal-600 group-hover:bg-teal-100">
              {card.icon}
            </span>
            <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 flex-1 text-sm text-slate-500">{card.description}</p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-700">
              {card.cta}
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50/50 p-6">
        <h2 className="text-sm font-medium text-slate-700">Quick links</h2>
        <ul className="mt-3 flex flex-wrap gap-4">
          <li>
            <Link href="/configurator" className="text-sm text-teal-600 hover:underline">Configurator</Link>
          </li>
          <li>
            <Link href="/admin" className="text-sm text-teal-600 hover:underline">Admin dashboard</Link>
          </li>
          <li>
            <Link href="/builder" className="text-sm text-teal-600 hover:underline">Builder (view-only)</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
