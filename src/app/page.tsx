"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const STEPS = [
  { number: "01", title: "Enter your address", body: "Instant council compliance rules, setbacks, permeability, and site coverage calculated for your block.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>) },
  { number: "02", title: "Design in real-time 3D", body: "Adjust dimensions and roof options with a live 3D model that updates instantly.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>) },
  { number: "03", title: "Get pricing instantly", body: "See kit and full-build pricing while you design, with clear cost visibility.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272"/></svg>) },
  { number: "04", title: "Proceed with confidence", body: "Move from design to checkout with a consistent flow and tracked progress.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>) },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function HomePage() {
  const { ref: stepsRef, inView: stepsInView } = useInView(0.1);

  return (
    <div className="min-h-screen bg-[#060C1A] text-white overflow-x-hidden">
      <Navbar />

      <section className="relative min-h-screen grid-bg flex items-center pt-16 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-36 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="anim-fade-up-1 font-display text-5xl lg:text-6xl xl:text-[68px] font-bold leading-[1.05] tracking-tight mb-6">
              Design your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#93C5FD]">perfect patio</span>
              <br />
              in minutes.
            </h1>
            <p className="anim-fade-up-2 text-slate-400 text-lg leading-relaxed max-w-lg mb-10">
              Modern 3D workflow with clear design controls, instant updates, and a smooth path to order.
            </p>
            <div className="anim-fade-up flex flex-col sm:flex-row gap-4">
              <Link href="/configurator" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-bold px-8 py-4 rounded-full text-sm">
                Open Configurator
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/10 text-white font-medium px-7 py-4 rounded-full text-sm transition-all">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 lg:py-32 bg-[#060C1A] grid-bg" ref={stepsRef}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className={`max-w-xl mb-16 transition-all duration-700 ${stepsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight">From address to finished design in four steps.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <div key={step.number} className={`step-card bg-[#0F172A] border border-white/8 rounded-2xl p-6 transition-all duration-700 ${stepsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: `${i * 100 + 200}ms` }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">{step.icon}</div>
                  <span className="font-display text-4xl font-bold text-white/8">{step.number}</span>
                </div>
                <h3 className="font-display text-base font-semibold text-white mb-2 leading-snug">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
