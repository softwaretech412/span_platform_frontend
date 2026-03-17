"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  Platform: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Configurator", href: "/configurator" },
    { label: "Admin", href: "/admin" },
    { label: "Builder", href: "/builder" },
  ],
  Account: [
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0A0F1E] border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center shadow-md">
                <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                  <path d="M3 10l7-7 7 7v8H13v-5H7v5H3z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Span<span className="text-[#60A5FA]">28</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              Design, validate, and price your structure in one place with a modern 3D workflow.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="text-white text-sm font-semibold mb-4">{section}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">© 2026 Span28 Pty Ltd. All rights reserved.</p>
          <p className="text-slate-500 text-xs">Made in Australia</p>
        </div>
      </div>
    </footer>
  );
}
