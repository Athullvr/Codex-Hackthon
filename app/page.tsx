"use client";

import { useState } from "react";

const chips = [
  { label: "Roads & Lights", detail: "18 resolved today", icon: "↗", style: "chip-green", position: "chip-one" },
  { label: "Sanitation & Health", detail: "94% on schedule", icon: "✦", style: "chip-rose", position: "chip-two" },
  { label: "Revenue & Taxes", detail: "12 updates waiting", icon: "₹", style: "chip-amber", position: "chip-three" },
  { label: "Water & Leakage", detail: "Response in 2.4 hrs", icon: "≈", style: "chip-blue", position: "chip-four" },
];

const dockTabs = ["Dashboard", "Elements", "Wards", "Visit Portal"];

export default function Home() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <main className="min-h-screen overflow-hidden bg-[#fafaf6] text-[#111111]">
      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 pb-6 pt-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2.5" aria-label="MyKochi home">
            <span className="grid size-9 place-items-center rounded-xl bg-[#111111] text-lg font-bold text-[#fafaf6]">M</span>
            <span className="text-lg font-semibold tracking-tight">MyKochi</span>
          </a>
          <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm text-[#4a4a4a] md:flex">
            <a className="transition-colors hover:text-black" href="#complaints">Complaints</a>
            <a className="transition-colors hover:text-black" href="#wards">Wards Lookup</a>
            <a className="transition-colors hover:text-black" href="#analytics">Analytics</a>
            <a className="transition-colors hover:text-black" href="#contact">Contact</a>
          </nav>
          <a href="#report" className="rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#222222]">Report issue</a>
        </header>

        <section id="home" className="relative flex flex-1 items-center justify-center py-20 sm:py-24 lg:py-16">
          <div className="hero-glow absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <div className="relative z-10 max-w-4xl text-center">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#70706d]">Kochi Municipal Corporation</p>
            <h1 className="font-serif text-[2.8rem] font-normal leading-[1.04] tracking-[-0.045em] text-[#111111] sm:text-6xl lg:text-7xl">
              The first civic intelligence platform that actually resolves your local issues.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#595956] sm:text-lg">
              MyKochi integrates citizens with Kochi Municipal Corporation departments — enabling rapid complaint routing, real-time ward tracking, and transparent triage resolution.
            </p>
            <div id="report" className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="/" className="inline-flex items-center gap-2 rounded-md bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#222222]">
                Report an Issue <span aria-hidden>→</span>
              </a>
              <a href="#complaints" className="text-sm font-semibold text-[#4a4a4a] underline decoration-[#b6b6b1] underline-offset-4 transition-colors hover:text-black">
                Track complaint status
              </a>
            </div>
          </div>

          <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            {chips.map((chip) => (
              <div key={chip.label} className={`status-chip ${chip.style} ${chip.position}`}>
                <span className="grid size-8 place-items-center rounded-full bg-white/70 text-base font-semibold">{chip.icon}</span>
                <span><strong>{chip.label}</strong><small>{chip.detail}</small></span>
              </div>
            ))}
            <div className="chip-note chip-five"><span className="dot" /> Live ward signals</div>
          </div>
        </section>

        <section id="analytics" className="relative z-20 mx-auto w-full max-w-6xl rounded-2xl border border-[#deded8] bg-white/80 p-3 shadow-[0_22px_70px_rgba(28,28,20,0.10)] backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-5 rounded-xl bg-[#f7f7f2] p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777773]">MyKochi live overview</p><p className="mt-1 text-sm text-[#5f5f5a]">Citywide service signals, refreshed in real time.</p></div>
              <div className="flex rounded-lg border border-[#e0e0d9] bg-white p-1" role="tablist" aria-label="Portal views">
                {dockTabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${activeTab === tab ? "bg-[#111111] text-white shadow-sm" : "text-[#686864] hover:bg-[#f4f4ee]"}`}>{tab}</button>)}
              </div>
            </div>
            <div className="grid divide-y divide-[#e1e1da] border-t border-[#e1e1da] pt-1 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              <Metric value="1,482" label="Total reports filed" />
              <Metric value="94.2%" label="Resolution rate" />
              <Metric value="2.4 Hours" label="Average triage time" />
              <div className="px-2 py-5 sm:px-5"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#7a7a74]">Active departments</p><div className="mt-3 flex flex-wrap gap-1.5"><span className="dept-pill">Engineering</span><span className="dept-pill">Health</span><span className="dept-pill">Revenue</span></div></div>
            </div>
          </div>
        </section>
        <div id="complaints" className="sr-only">Complaints</div><div id="wards" className="sr-only">Wards Lookup</div><div id="contact" className="sr-only">Contact</div>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="px-2 py-5 sm:px-5"><p className="font-serif text-3xl tracking-[-0.04em] text-[#181817]">{value}</p><p className="mt-1 text-sm text-[#696965]">{label}</p></div>;
}
