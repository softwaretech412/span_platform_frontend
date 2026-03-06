"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type QuoteRow = {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  structure_name: string;
  structure_code: string;
};

export default function BuilderPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getBuilderQuotes({ page, limit: 20 })
      .then((res) => {
        setQuotes((res.data as QuoteRow[]) ?? []);
        setTotal(res.total ?? 0);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load quotes");
        setQuotes([]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Builder — View only</h1>
      <p className="text-gray-600 mb-6">Quotes and projects (read-only). Log in with a Builder account.</p>

      {error && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded text-amber-800">
          {error}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-3">Quote</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Structure</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">View</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-t">
                <td className="p-3">{q.quote_number}</td>
                <td className="p-3">{q.customer_name}</td>
                <td className="p-3">{q.structure_name}</td>
                <td className="p-3">${Number(q.total).toFixed(2)}</td>
                <td className="p-3">{q.status}</td>
                <td className="p-3">
                  <Link
                    href={`/builder/quotes/${q.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="py-1">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            type="button"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link>
        <Link href="/configurator" className="text-blue-600 hover:underline">Configurator</Link>
      </div>
    </div>
  );
}
