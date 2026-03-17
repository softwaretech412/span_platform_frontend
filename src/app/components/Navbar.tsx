"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Configurator", href: "/configurator" },
  { label: "Admin", href: "/admin" },
  { label: "Builder", href: "/builder" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0F172A]/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                <path d="M3 10l7-7 7 7v8H13v-5H7v5H3z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Span<span className="text-[#60A5FA]">28</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-white bg-white/10"
                    : "text-slate-300 hover:text-white hover:bg-white/8"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/configurator"
              className="hidden sm:flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              Start designing
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`w-5 h-0.5 bg-white transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-5 h-0.5 bg-white transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-0.5 bg-white transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute top-16 left-4 right-4 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-4 transition-all duration-300 ${
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
