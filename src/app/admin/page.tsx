"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<{
    quotes_by_status: Record<string, number>;
    this_month: { total_quotes: number; total_revenue: number };
    recent_quotes: Array<{ quote_number: string; customer_name: string; total: number; status: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminDashboard()
      .then((res) => {
        if (res.success && res.data) setDashboard(res.data as typeof dashboard);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {dashboard ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border rounded p-4">
              <h2 className="font-semibold text-gray-600">This month</h2>
              <p className="text-2xl">{dashboard.this_month.total_quotes} quotes</p>
              <p className="text-lg">${dashboard.this_month.total_revenue.toFixed(2)} revenue</p>
            </div>
            <div className="border rounded p-4">
              <h2 className="font-semibold text-gray-600">By status</h2>
              <ul className="mt-2">
                {Object.entries(dashboard.quotes_by_status).map(([status, count]) => (
                  <li key={status}>
                    {status}: {count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Recent quotes</h2>
            <ul className="space-y-2">
              {dashboard.recent_quotes?.map((q) => (
                <li key={q.quote_number} className="flex justify-between border-b pb-2">
                  <span>{q.quote_number} — {q.customer_name}</span>
                  <span>${Number(q.total).toFixed(2)} ({q.status})</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="text-gray-600">No dashboard data. Ensure you are logged in with admin access.</p>
      )}
      <Link href="/configurator" className="text-blue-600 underline mt-6 block">
        Configurator
      </Link>
    </div>
  );
}
