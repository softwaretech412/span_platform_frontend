"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        pathname === href
          ? "bg-teal-50 text-teal-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="text-xl">Span28</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/configurator" className={pathname === "/configurator" ? "bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-sm font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium"}>
            Configurator
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className={pathname === "/dashboard" ? "bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-sm font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium"}>
                Dashboard
              </Link>
              <Link href="/admin" className={pathname === "/admin" || pathname?.startsWith("/admin/") ? "bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-sm font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium"}>
                Admin
              </Link>
              <Link href="/builder" className={pathname === "/builder" ? "bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-sm font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium"}>
                Builder
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-slate-400">...</span>
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
