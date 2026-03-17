"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Mock order — in production comes from configurator state / query params
const ORDER = {
  address: "14 Acacia Street, Paddington QLD 4064",
  council: "Brisbane City Council",
  spec: { width: 5, depth: 4, height: 2.7, roofStyle: "Flat roof", material: "Steel frame", frameColor: "Slate", roofColor: "Colorbond® Steel", area: 20 },
  pricing: { materials: 6240, freight: 340, engineering: 420, permit: 0, install: 3800, platformFee: 390 },
};

const KIT_ITEMS = [
  { label: "Materials & fabrication", amount: ORDER.pricing.materials },
  { label: "Freight (Brisbane metro)",  amount: ORDER.pricing.freight },
  { label: "Engineering certification", amount: ORDER.pricing.engineering },
  { label: "Council permit",            amount: ORDER.pricing.permit, free: true },
];

const BUILD_EXTRAS = [
  { label: "Matched builder (labour)", amount: ORDER.pricing.install },
  { label: "Platform fee",             amount: ORDER.pricing.platformFee },
];

const MILESTONES = [
  { id: 1, pct: 20, label: "Order confirmed",            desc: "Released to kick off fabrication and engineering." },
  { id: 2, pct: 30, label: "Materials delivered to site", desc: "Released on verified delivery confirmation." },
  { id: 3, pct: 25, label: "Slab / footings complete",    desc: "Released on builder photo submission + approval." },
  { id: 4, pct: 20, label: "Frame erected & roof on",     desc: "Released on structural completion sign-off." },
  { id: 5, pct: 5,  label: "Final inspection passed",     desc: "Final balance on council sign-off." },
];

const TRUST = [
  { icon: "🛡️", label: "Milestone payment protection",  sub: "Funds held in escrow — released only when each stage is verified." },
  { icon: "📋", label: "Permit-ready engineering",       sub: "Certified structural drawings included in every order." },
  { icon: "🔁", label: "Full refund if non-compliant",   sub: "If engineering finds a council issue your deposit is returned in full." },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [orderType,         setOrderType]         = useState<"kit"|"build">("build");
  const [step,              setStep]              = useState<1|2|3>(1);
  const [agreedTerms,       setAgreedTerms]       = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // useState(() => ...) runs the initialiser exactly once and is the correct
  // pattern for impure one-time values. useRef(Math.random()) still triggers
  // the react-hooks/purity lint rule because the argument is evaluated during
  // render before useRef receives it.
  const [orderNumber] = useState(() => `SP28-${Math.floor(10000 + Math.random() * 90000)}`);

  const kitTotal   = KIT_ITEMS.reduce((s, i) => s + i.amount, 0);
  const buildTotal = kitTotal + BUILD_EXTRAS.reduce((s, i) => s + i.amount, 0);
  const total      = orderType === "kit" ? kitTotal : buildTotal;
  const depositAmt = Math.round(total * 0.2);

  const handlePay = () => {
    setPaymentProcessing(true);
    setTimeout(() => { setPaymentProcessing(false); setStep(3); }, 2200);
  };

  // ── Confirmed screen ───────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#060C1A] text-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap');
          body{font-family:'Inter',sans-serif}.font-display{font-family:'Sora',sans-serif}
          @keyframes scaleIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          .anim-scale{animation:scaleIn .5s cubic-bezier(.34,1.56,.64,1) forwards}
          .anim-fade-1{animation:fadeUp .5s .2s ease forwards;opacity:0}
          .anim-fade-2{animation:fadeUp .5s .35s ease forwards;opacity:0}
          .anim-fade-3{animation:fadeUp .5s .5s ease forwards;opacity:0}
        `}</style>
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-28 text-center">
          {/* Success ring */}
          <div className="anim-scale w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-7 shadow-lg shadow-emerald-500/20">
            <svg className="w-9 h-9 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>

          <h1 className="anim-fade-1 font-display text-4xl font-bold text-white mb-3">Order confirmed!</h1>
          <p className="anim-fade-2 text-slate-400 mb-2">
            Deposit of <strong className="text-white">${depositAmt.toLocaleString()}</strong> received.
          </p>
          <p className="anim-fade-2 text-slate-400 mb-10">
            Order ref: <strong className="text-blue-400">#{orderNumber}</strong> — we will email next steps within 2 hours.
          </p>

          <div className="anim-fade-3 bg-[#0F172A] border border-white/8 rounded-2xl p-6 text-left mb-8">
            <p className="font-display text-sm font-bold text-white mb-4">What happens next</p>
            <div className="space-y-3.5">
              {[
                "Engineering drawings prepared (2–3 business days)",
                "Materials ordered from our supplier network",
                "Builder matched and introduced to you",
                "Build scheduled — track every stage in your dashboard",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="anim-fade-3 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/order"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all shadow-lg shadow-blue-500/25">
              Track my order
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </Link>
            <Link href="/"
              className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/10 text-white font-medium px-7 py-3.5 rounded-full text-sm transition-all">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060C1A] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        body{font-family:'Inter',sans-serif}.font-display{font-family:'Sora',sans-serif}
        .grid-bg{background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:60px 60px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .anim-fade-up{animation:fadeUp .55s ease forwards}
        .anim-fade-up-1{animation:fadeUp .55s .1s ease forwards;opacity:0}
        .anim-fade-up-2{animation:fadeUp .55s .2s ease forwards;opacity:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin .75s linear infinite}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .anim-fade-in{animation:fadeIn .35s ease forwards}
        .input-field{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 16px;font-size:14px;color:white;width:100%;transition:all .2s;outline:none}
        .input-field::placeholder{color:#475569}
        .input-field:focus{border-color:#3B82F6;box-shadow:0 0 0 3px rgba(59,130,246,.2)}
        .milestone-line{background:rgba(255,255,255,.08)}
      `}</style>

      <Navbar />

      <main className="pt-24 pb-20 grid-bg min-h-screen">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">

          {/* Step breadcrumb */}
          <div className="anim-fade-up flex flex-wrap items-center gap-1.5 mb-8">
            {["Address","Compliance","Design","Checkout"].map((s,i)=>(
              <span key={s} className="flex items-center gap-1.5 text-xs">
                <span className={`rounded-full px-3 py-1 font-semibold ${i===3?"bg-blue-500 text-white":"bg-white/8 text-slate-500"}`}>{s}</span>
                {i<3&&<svg className="w-3 h-3 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>}
              </span>
            ))}
          </div>

          <div className="anim-fade-up-1 mb-10">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight mb-2">
              {step === 1 ? "Review your order" : "Secure payment"}
            </h1>
            <p className="text-slate-400 text-base">
              {step === 1 ? "Choose your build type, review pricing, then proceed to payment." : `Paying ${20}% deposit today — balance released on verified milestones.`}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Order type selector */}
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id:"kit",   label:"Kit only",    sub:"Materials + engineering cert", price:kitTotal,   badge:"DIY-friendly",  badgeStyle:"bg-slate-700 text-slate-300 border-slate-600" },
                    { id:"build", label:"Full build",  sub:"Kit + matched local builder",  price:buildTotal,  badge:"Most popular",  badgeStyle:"bg-blue-500/20 text-blue-400 border-blue-500/30" },
                  ].map(opt=>(
                    <button key={opt.id} onClick={()=>setOrderType(opt.id as "kit"|"build")}
                      className={`relative border-2 rounded-2xl p-5 text-left transition-all duration-200 ${
                        orderType===opt.id
                          ?"border-blue-500 bg-blue-500/8 shadow-lg shadow-blue-500/10"
                          :"border-white/8 bg-white/3 hover:border-white/16"
                      }`}>
                      <span className={`absolute top-3.5 right-3.5 text-xs font-semibold border rounded-full px-2.5 py-0.5 ${opt.badgeStyle}`}>
                        {opt.badge}
                      </span>
                      <div className={`w-9 h-9 rounded-xl mb-4 flex items-center justify-center ${orderType===opt.id?"bg-blue-500/15 text-blue-400":"bg-white/6 text-slate-400"}`}>
                        {opt.id==="kit"
                          ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>
                          : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"/></svg>
                        }
                      </div>
                      <p className="font-display text-base font-bold text-white mb-0.5">{opt.label}</p>
                      <p className="text-xs text-slate-500 mb-3">{opt.sub}</p>
                      <p className="font-display text-2xl font-bold text-white">${opt.price.toLocaleString()}</p>
                      <p className="text-xs text-slate-600">inc. GST</p>
                      {orderType===opt.id && (
                        <div className="absolute bottom-4 right-4 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Design summary */}
              <div className="bg-[#0F172A] border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-white">Design summary</p>
                  <Link href="/configure" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</Link>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm font-semibold text-white mb-0.5">{ORDER.address}</p>
                  <p className="text-xs text-slate-500 mb-4">{ORDER.council}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { label:"Size",    value:`${ORDER.spec.width}m × ${ORDER.spec.depth}m` },
                      { label:"Height",  value:`${ORDER.spec.height}m posts` },
                      { label:"Area",    value:`${ORDER.spec.area} m²` },
                      { label:"Roof",    value:ORDER.spec.roofStyle },
                      { label:"Frame",   value:ORDER.spec.material },
                      { label:"Colour",  value:ORDER.spec.frameColor },
                    ].map(d=>(
                      <div key={d.label} className="bg-white/4 border border-white/6 rounded-xl px-3 py-2.5">
                        <p className="text-xs text-slate-500 mb-0.5">{d.label}</p>
                        <p className="text-sm font-semibold text-white">{d.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="bg-[#0F172A] border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/8">
                  <p className="font-display text-sm font-bold text-white">Pricing breakdown</p>
                </div>
                <div className="divide-y divide-white/5">
                  {KIT_ITEMS.map(item=>(
                    <div key={item.label} className="px-5 py-3.5 flex items-center justify-between">
                      <span className="text-sm text-slate-300">{item.label}</span>
                      {item.free
                        ? <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">Exempt — $0</span>
                        : <span className="text-sm font-semibold text-white">${item.amount.toLocaleString()}</span>
                      }
                    </div>
                  ))}
                  {orderType==="build" && BUILD_EXTRAS.map(item=>(
                    <div key={item.label} className="px-5 py-3.5 flex items-center justify-between">
                      <span className="text-sm text-slate-300">{item.label}</span>
                      <span className="text-sm font-semibold text-white">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="px-5 py-4 flex items-center justify-between bg-white/3">
                    <span className="font-display text-base font-bold text-white">Total (inc. GST)</span>
                    <span className="font-display text-xl font-bold text-white">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Milestone payments */}
              {orderType==="build" && (
                <div className="bg-[#0F172A] border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/8">
                    <p className="font-display text-sm font-bold text-white">Protected milestone payments</p>
                    <p className="text-xs text-slate-500 mt-0.5">Funds held in escrow — released only when each stage is independently verified.</p>
                  </div>
                  <div className="px-5 py-4">
                    {MILESTONES.map((m,i)=>{
                      const amt = Math.round(total * m.pct / 100);
                      return (
                        <div key={m.id} className="flex gap-4 pb-4">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-xs font-bold text-blue-400">{m.id}</div>
                            {i < MILESTONES.length-1 && <div className="milestone-line w-0.5 flex-1 mt-1.5"/>}
                          </div>
                          <div className="pb-1 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-white">{m.label}</p>
                              <span className="font-display text-sm font-bold text-blue-400 flex-shrink-0">{m.pct}% · ${amt.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment form */}
              {step === 2 && (
                <div className="anim-fade-in bg-[#0F172A] border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/8">
                    <p className="font-display text-sm font-bold text-white">Payment details</p>
                    <p className="text-xs text-slate-500 mt-0.5">Paying deposit of <strong className="text-white">${depositAmt.toLocaleString()}</strong> today (20%)</p>
                  </div>
                  <div className="px-5 py-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Cardholder name</label>
                      <input type="text" placeholder="Jane Smith" className="input-field"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Card number</label>
                      <div className="relative">
                        <input type="text" placeholder="•••• •••• •••• ••••" className="input-field pr-20"/>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                          <div className="w-8 h-5 rounded bg-white/8 border border-white/10 flex items-center justify-center">
                            <span className="text-[8px] font-black text-blue-400">VISA</span>
                          </div>
                          <div className="w-8 h-5 rounded bg-white/8 border border-white/10 flex items-center justify-center">
                            <span className="text-[7px] font-black text-slate-400">MC</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Expiry</label>
                        <input type="text" placeholder="MM / YY" className="input-field"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">CVC</label>
                        <input type="text" placeholder="•••" className="input-field"/>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={agreedTerms}
                        onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setAgreedTerms(e.target.checked)}
                        className="mt-0.5 accent-blue-500 w-4 h-4 flex-shrink-0"/>
                      <span className="text-xs text-slate-400 leading-relaxed">
                        I agree to the{" "}
                        <a href="#" className="text-blue-400 hover:underline">terms and conditions</a>
                        {" "}and understand that my deposit is protected and refundable if engineering reveals a compliance issue.
                      </span>
                    </label>

                    <button onClick={handlePay} disabled={!agreedTerms||paymentProcessing}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 disabled:opacity-30 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-full text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 mt-2">
                      {paymentProcessing ? (
                        <>
                          <svg className="spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 3a9 9 0 0 1 9 9"/></svg>
                          Processing payment…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
                          Pay deposit — ${depositAmt.toLocaleString()}
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pt-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
                      256-bit SSL encryption · Powered by Stripe
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN — sticky summary ──────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-4">

                {/* Total card */}
                <div className="bg-[#0F172A] border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"/>
                    <p className="text-xs text-slate-500">Council compliant · Permit exempt</p>
                  </div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{orderType==="kit"?"Kit only":"Full build"}</p>
                  <p className="font-display text-4xl font-bold text-white mb-5">${total.toLocaleString()}</p>

                  <div className="border-t border-white/8 pt-4 mb-5 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Deposit today (20%)</span>
                      <span className="font-semibold text-white">${depositAmt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Balance on milestones</span>
                      <span className="font-semibold text-white">${(total-depositAmt).toLocaleString()}</span>
                    </div>
                  </div>

                  {step===1 && (
                    <button onClick={()=>setStep(2)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-full text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                      Proceed to payment
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                    </button>
                  )}
                  {step===2 && (
                    <button onClick={()=>setStep(1)}
                      className="w-full bg-white/8 hover:bg-white/12 border border-white/10 text-white font-medium py-3.5 rounded-full text-sm transition-all">
                      ← Back to review
                    </button>
                  )}
                </div>

                {/* Trust signals */}
                <div className="bg-[#0F172A] border border-white/8 rounded-2xl p-5 space-y-4">
                  {TRUST.map(t=>(
                    <div key={t.label} className="flex items-start gap-3">
                      <span className="text-lg leading-none mt-0.5">{t.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-white mb-0.5">{t.label}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{t.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-center text-slate-600 px-2">
                  Questions?{" "}
                  <a href="tel:1800000000" className="text-blue-400 hover:underline">1800 000 000</a>
                  {" "}or{" "}
                  <a href="#" className="text-blue-400 hover:underline">live chat</a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}