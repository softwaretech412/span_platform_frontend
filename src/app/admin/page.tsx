"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Preloader } from "@/components/Preloader";

type DashboardData = {
  quotes_by_status: Record<string, number>;
  this_month: { total_quotes: number; total_revenue: number; avg_quote_value?: number };
  recent_quotes: Array<{
    quote_number: string;
    customer_name: string;
    customer_email?: string;
    total: number;
    status: string;
    created_at: string;
    structure_name: string;
  }>;
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    sent: "bg-sky-100 text-sky-800",
    viewed: "bg-slate-100 text-slate-700",
    accepted: "bg-emerald-100 text-emerald-800",
    declined: "bg-red-100 text-red-800",
    expired: "bg-amber-100 text-amber-800",
    draft: "bg-slate-100 text-slate-600",
  };
  const cls = map[status?.toLowerCase()] ?? "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAdminDashboard()
      .then((res) => {
        if (res.success && res.data) setDashboard(res.data as DashboardData);
        else setError("No dashboard data");
      })
      .catch((e) => {
        const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to load";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Preloader />;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Admin overview — quotes and revenue</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <p className="font-medium">{error}</p>
            {error.toLowerCase().includes("designer") && (
              <p className="mt-2 text-amber-700">
                Only <strong>Designer</strong>, <strong>SystemAdmin</strong>, or <strong>SuperAdmin</strong> roles grant admin access. Customer and Builder do not. Fix: have another admin assign you the correct role in User management, or from the backend run{" "}
                <code className="rounded bg-amber-100 px-1">npm run assign-admin-role -- your@email.com Designer</code>
                {" "}(or <code className="rounded bg-amber-100 px-1">SuperAdmin</code>). Run <code className="rounded bg-amber-100 px-1">npm run prisma:seed</code> first if roles are missing.
              </p>
            )}
          </div>
        )}

        {dashboard && (
          <>
            {/* Stats cards — Tocly-style */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Quotes this month</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {dashboard.this_month.total_quotes}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Revenue this month</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  ${Number(dashboard.this_month.total_revenue).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Avg quote value</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  ${Number(dashboard.this_month.avg_quote_value ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">By status</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(dashboard.quotes_by_status).map(([status, count]) => (
                    <span
                      key={status}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                    >
                      {status}: {count}
                    </span>
                  ))}
                  {Object.keys(dashboard.quotes_by_status).length === 0 && (
                    <span className="text-xs text-slate-400">No quotes yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recent quotes table */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Recent quotes</h2>
                <p className="mt-0.5 text-sm text-slate-500">Latest configurator quotes</p>
              </div>
              <div className="overflow-x-auto">
                {dashboard.recent_quotes?.length > 0 ? (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Quote
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Structure
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {dashboard.recent_quotes.map((q) => (
                        <tr key={q.quote_number} className="hover:bg-slate-50/50">
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                            {q.quote_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            <span className="font-medium">{q.customer_name}</span>
                            {q.customer_email && (
                              <span className="block text-xs text-slate-400">{q.customer_email}</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                            {q.structure_name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                            ${Number(q.total).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <StatusBadge status={q.status} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                            {formatDate(q.created_at)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <Link
                              href={`/configurator/quote/${q.quote_number}`}
                              className="text-sm font-medium text-teal-600 hover:text-teal-700"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-700">No quotes yet</p>
                    <p className="mt-1 text-sm text-slate-500">Quotes from the configurator will appear here.</p>
                    <Link
                      href="/configurator"
                      className="mt-4 inline-flex items-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                      Open Configurator
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/admin/users"
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                User management
              </Link>
              <Link
                href="/configurator"
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Configurator
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Dashboard
              </Link>
            </div>
          </>
        )}

        {!dashboard && !error && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-slate-600">Unable to load dashboard data.</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-700">
              Log in again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
