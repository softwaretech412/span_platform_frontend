"use client";

import { useState } from "react";
import { createQuote } from "@/lib/api";

interface BOMQuoteProps {
  validation: {
    complies: boolean;
    redFlags: Array<{ message: string }>;
    structural: unknown;
    bom: { lineItems: Array<{ sku: string; qty: number; unit: string; cost: number; description?: string }>; totalCost: number } | null;
    suppliers: Array<{ branchId: string; supplierName: string; distance: number; freight: number }>;
  } | null;
  configuration: { width: number; depth: number; height: number };
  structureType: string;
  addressData: { fullAddress: string; councilId: string; postcode?: string } | null;
}

export function BOMQuote(props: BOMQuoteProps) {
  const { validation, configuration, structureType, addressData } = props;
  const [submitting, setSubmitting] = useState(false);
  const [quoteResult, setQuoteResult] = useState<{ quote_number: string; total: number } | null>(null);

  const handleQuote = async () => {
    if (!addressData) return;
    setSubmitting(true);
    try {
      const res = await createQuote({
        structure_type: structureType,
        configuration,
        addons: [],
        customer: { name: "Customer", email: "customer@example.com", phone: "" },
        installation: { address: addressData.fullAddress, postcode: addressData.postcode },
      });
      setQuoteResult({ quote_number: res.quote_number, total: res.total });
    } catch (e) {
      console.error("Quote failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const bom = validation?.bom;
  const suppliers = validation?.suppliers ?? [];

  return (
    <div className="space-y-4">
      {bom ? (
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="font-medium mb-2">Bill of Materials</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th>Item</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {bom.lineItems.map((item, i) => (
                <tr key={i} className="border-t border-slate-700">
                  <td>{item.description ?? item.sku}</td>
                  <td>{item.qty}</td>
                  <td>{item.unit}</td>
                  <td>{"$" + (item.qty * item.cost).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 font-medium">{"Total: $" + bom.totalCost.toFixed(2)}</p>
        </div>
      ) : null}

      {suppliers.length > 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="font-medium mb-2">Nearest suppliers</h3>
          <ul className="space-y-1 text-sm text-slate-300">
            {suppliers.slice(0, 3).map((sup, i) => (
              <li key={i}>
                {sup.supplierName} — {sup.distance}km, freight ~{sup.freight}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        onClick={handleQuote}
        disabled={submitting || !addressData}
        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {submitting ? "Creating quote..." : "Get quote"}
      </button>

      {quoteResult ? (
        <p className="text-green-400">
          Quote {quoteResult.quote_number} created. Total: {"$" + quoteResult.total.toFixed(2)}
        </p>
      ) : null}
    </div>
  );
}
