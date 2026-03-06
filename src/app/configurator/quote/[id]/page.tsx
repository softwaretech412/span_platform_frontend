"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function QuotePage({ params }: { params: { id: string } }) {
  const [quote, setQuote] = useState<{
    quoteNumber: string;
    total: number;
    status: string;
    structure_name: string;
    customerName: string;
    line_items: Array<{ description: string; quantity: number; totalCost: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getQuote(params.id)
      .then((res) => {
        if (res.success && res.data) setQuote(res.data as typeof quote);
        else setError("Quote not found");
      })
      .catch(() => setError("Failed to load quote"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error || !quote)
    return (
      <div className="p-8">
        <p className="text-red-600">{error ?? "Quote not found"}</p>
        <Link href="/configurator" className="text-blue-600 underline mt-4 block">
          Back to configurator
        </Link>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Quote {quote.quoteNumber}</h1>
      <p className="text-gray-600 mb-6">
        {quote.structure_name} — {quote.customerName}
      </p>
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Line items</h2>
        <ul className="space-y-1">
          {quote.line_items?.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span>{item.description} x {item.quantity}</span>
              <span>${Number(item.totalCost).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xl font-bold">Total: ${Number(quote.total).toFixed(2)}</p>
      <p className="text-sm text-gray-500 mt-2">Status: {quote.status}</p>
      <Link href="/configurator" className="text-blue-600 underline mt-6 block">
        Back to configurator
      </Link>
    </div>
  );
}
