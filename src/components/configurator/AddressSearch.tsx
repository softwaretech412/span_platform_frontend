"use client";

import { useState } from "react";
import { getLocationRules, type LocationRulesData } from "@/lib/api";

export function AddressSearch({ onFound }: { onFound: (data: LocationRulesData) => void }) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getLocationRules(address.trim());
      onFound(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Address not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="e.g. 123 Main St, Melbourne VIC 3000"
        className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Searching..." : "Search"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
