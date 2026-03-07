"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type AdminUser, type AdminRole } from "@/lib/api";
import { Preloader } from "@/components/Preloader";

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadUsers = () => {
    setLoading(true);
    api
      .getAdminUsers({ page, limit: 20, search: search || undefined })
      .then((res) => {
        setUsers(res.data);
        setTotal(res.total);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load users");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  const loadRoles = () => {
    api.getAdminRoles().then((res) => setRoles(res.data ?? []));
  };

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  useEffect(() => {
    loadRoles();
  }, []);

  const handleAssignRole = (userId: string, roleId: string) => {
    setAssigning(userId);
    api
      .assignUserRole(userId, roleId)
      .then(() => { loadUsers(); loadRoles(); })
      .catch((e) => alert(e instanceof Error ? e.message : "Failed"))
      .finally(() => setAssigning(null));
  };

  const handleRemoveRole = (userId: string, roleId: string) => {
    setRemoving(`${userId}-${roleId}`);
    api
      .removeUserRole(userId, roleId)
      .then(() => loadUsers())
      .catch((e) => alert(e instanceof Error ? e.message : "Failed"))
      .finally(() => setRemoving(null));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  if (loading && users.length === 0) return <Preloader />;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User management</h1>
            <p className="mt-1 text-sm text-slate-500">View users and assign roles (Customer, Designer, Builder, SystemAdmin)</p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ← Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Roles</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.length === 0 ? (
                          <span className="text-xs text-slate-400">No roles</span>
                        ) : (
                          u.roles.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                            >
                              {r.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveRole(u.id, r.id)}
                                disabled={removing === `${u.id}-${r.id}`}
                                className="rounded p-0.5 hover:bg-slate-200 disabled:opacity-50"
                                title="Remove role"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <select
                        value=""
                        onChange={(e) => {
                          const roleId = e.target.value;
                          if (roleId) handleAssignRole(u.id, roleId);
                          e.target.value = "";
                        }}
                        disabled={assigning === u.id}
                        className="rounded-lg border border-slate-300 py-1.5 pl-2 pr-6 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
                      >
                        <option value="">Add role…</option>
                        {roles
                          .filter((r) => !u.roles.some((ur) => ur.id === r.id))
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        {roles.filter((r) => !u.roles.some((ur) => ur.id === r.id)).length === 0 && (
                          <option value="" disabled>All roles assigned</option>
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && !loading && (
            <div className="py-12 text-center text-sm text-slate-500">No users found.</div>
          )}
          {total > 20 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">
                Page {page} of {Math.ceil(total / 20)} ({total} users)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
