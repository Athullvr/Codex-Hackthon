/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { KOCHI_WARDS } from "@/lib/wards";

type Classification = { issueType: string; severity: "low" | "medium" | "high"; department: "Engineering" | "Health" | "Revenue" };
type Draft = { subject: string; descriptionEnglish: string; descriptionMalayalam: string };
type Stage = "capture" | "loading" | "result";

export default function Home() {
  const [stage, setStage] = useState<Stage>("capture"); 
  const [manglish, setManglish] = useState("");
  const [classification, setClassification] = useState<Classification | null>(null); 
  const [draft, setDraft] = useState<Draft | null>(null); 
  const [ward, setWard] = useState(""); 
  const [error, setError] = useState(""); 
  const [activeTab, setActiveTab] = useState("Dashboard");
  
  const [isListening, setIsListening] = useState(false);
  const [supportSpeech, setSupportSpeech] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const wards = useMemo(() => [...KOCHI_WARDS].sort((a, b) => a.name.localeCompare(b.name)), []);
  const verified = Boolean(classification?.department && ward && draft?.subject.trim() && draft?.descriptionEnglish.trim() && draft?.descriptionMalayalam.trim());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (Speech) setSupportSpeech(true);
    }
  }, []);

  function toggleListening() {
    if (isListening) {
      if (recognition) recognition.stop();
      setIsListening(false);
    } else {
      const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechClass) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
      const rec = new SpeechClass();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-IN";
      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setManglish((prev) => prev ? prev + " " + transcript : transcript);
      };
      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      rec.onend = () => setIsListening(false);
      rec.start();
      setRecognition(rec);
    }
  }

  async function analyzeText() {
    if (!manglish.trim()) return;
    setStage("loading"); setError("");
    try {
      const response = await fetch("/api/manglish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: manglish, location: ward || "Vyttila, Kochi" }) });
      const generated = await response.json();
      if (!response.ok) throw new Error(generated.error || "Analysis failed.");
      setClassification({ issueType: generated.issueType, severity: generated.severity as Classification["severity"], department: generated.department as Classification["department"] });
      setDraft({ subject: generated.subject, descriptionEnglish: generated.descriptionEnglish, descriptionMalayalam: generated.descriptionMalayalam });
      setStage("result");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not analyze this text."); setStage("capture");
    }
  }

  function reset() { 
    setStage("capture"); 
    setManglish(""); 
    setClassification(null); 
    setDraft(null); 
    setWard(""); 
    setError(""); 
    if (recognition) recognition.stop();
    setIsListening(false);
  }

  return <main className="min-h-screen overflow-hidden bg-[#fafaf6] text-[#0c336b]"><div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 pb-6 pt-5 sm:px-8 lg:px-12">
    <header className="flex items-center justify-between"><a href="#home" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#0c336b] text-lg font-bold text-[#fafaf6]">M</span><span className="text-lg font-semibold tracking-tight">MyKochi</span></a><nav className="hidden items-center gap-7 text-sm text-[#4a4a4a] md:flex"><a href="#report">Complaints</a><a href="#ward">Wards Lookup</a><a href="#analytics">Analytics</a><a href="#contact">Contact</a></nav><button onClick={() => document.getElementById("report")?.scrollIntoView()} className="rounded-md bg-[#0c336b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f428a]">Report issue</button></header>
    <section id="home" className="relative flex flex-1 items-center justify-center py-14 sm:py-18 lg:py-12"><div className="hero-glow absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full" /><div className="relative z-10 w-full text-center"><p className="mb-4 text-xs font-semibold uppercase tracking-[.22em] text-[#70706d]">Kochi Municipal Corporation</p><h1 className="mx-auto max-w-4xl font-serif text-4xl leading-[1.04] tracking-[-.045em] sm:text-6xl">Civic intelligence that actually resolves local issues.</h1>
      <section id="report" className={`mykochi-card mx-auto mt-8 w-full text-left ${stage === "result" ? "max-w-5xl" : "max-w-xl"}`}>
        
        {stage === "capture" && <div className="p-5 sm:p-6"><p className="font-serif text-2xl">Start a civic report</p><p className="mt-1 text-sm leading-6 text-[#666661]">Describe the civic problem below, and AI will automatically triage it.</p>
        
        <label className="form-label mt-5 block">Describe the issue
          <textarea 
            className="form-field mt-2 min-h-32 bg-white/50 leading-relaxed pr-3" 
            placeholder={isListening ? "Listening... Speak now." : "e.g. There is a large pothole on the main road, or streetlights are malfunctioning..."}
            value={manglish} 
            onChange={(e) => setManglish(e.target.value)} 
            disabled={isListening}
          />
        </label>

        {supportSpeech && (
          <div className="mt-3">
            <button 
              type="button"
              onClick={toggleListening}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl border font-semibold text-sm transition-all ${isListening ? "animate-pulse border-red-500 bg-red-50 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.15)]" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              <span>{isListening ? "■ Stop Recording Voice" : "🎤 Tap to Speak (Voice Input)"}</span>
            </button>
          </div>
        )}

        {error && <div className="error-alert mt-4"><span>{error}</span><button onClick={analyzeText} disabled={!manglish}>Retry</button></div>}
        <div className="mt-5"><button disabled={!manglish || isListening} onClick={analyzeText} className="dark-action w-full disabled:cursor-not-allowed disabled:opacity-40">Analyze Issue <span>→</span></button></div></div>}
        
        {stage === "loading" && <div className="p-8 text-center"><div className="loader mx-auto" /><p className="mt-5 font-serif text-2xl">Preparing your report</p><div className="mt-6 space-y-3 text-left text-sm text-[#65655f]"><p>✓ Analyzing context and generating details...</p><p className="animate-pulse font-semibold text-[#137333]">◌ Triaging department via Groq AI...</p><p className="text-[#999991]">○ Drafting formal English & Malayalam complaints...</p></div></div>}
        
        {stage === "result" && classification && draft && <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="font-serif text-2xl">Your civic report</p><p className="mt-1 text-sm text-[#666661]">Review, edit, and send it to MyKochi.</p></div><button onClick={reset} className="text-xs font-semibold text-[#5b5b55] underline underline-offset-4">Start over</button></div><div className="mt-6 grid gap-6 lg:grid-cols-[.78fr_1.22fr]"><div className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[.13em] text-[#7a7a74]">Detected issue</p><p className="mt-1 font-serif text-xl">{classification.issueType}</p><div className="mt-3 flex flex-wrap gap-2"><span className={`severity severity-${classification.severity}`}>{classification.severity} severity</span><span className="department-badge">{classification.department}</span></div></div><label className="form-label" htmlFor="ward">Ward selector<select id="ward" value={ward} onChange={(e) => setWard(e.target.value)} className="form-field mt-2"><option value="">Select a ward</option>{wards.map((item) => <option key={item.name}>{item.name}</option>)}</select></label></div><div className="space-y-4"><label className="form-label">Subject line<input className="form-field mt-2" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} /></label><label className="form-label">English complaint<textarea className="form-field mt-2 min-h-28" value={draft.descriptionEnglish} onChange={(e) => setDraft({ ...draft, descriptionEnglish: e.target.value })} /></label><label className="form-label">Malayalam complaint<textarea className="form-field mt-2 min-h-28 leading-7" value={draft.descriptionMalayalam} onChange={(e) => setDraft({ ...draft, descriptionMalayalam: e.target.value })} /></label></div></div><div className={`validation-alert ${verified ? "validation-ready" : "validation-warning"}`}><span>{verified ? "✓" : "!"}</span><p>{verified ? "Verified & Ready — all complaint fields are complete." : "Complete all complaint fields before submitting."}</p></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><a className="dark-action flex-1" href="https://mykochi.lsgkerala.gov.in/index/complaint" target="_blank" rel="noreferrer">Open in MyKochi <span>↗</span></a><button onClick={reset} className="outline-action sm:w-auto">Start Over</button></div></div>}
      
      </section></div></section>
    <Analytics activeTab={activeTab} setActiveTab={setActiveTab} /></div><span id="contact" className="sr-only">Contact</span></main>;
}

function Analytics({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) { const tabs = ["Dashboard", "Elements", "Wards", "Visit Portal"]; return <section id="analytics" className="relative z-20 mx-auto w-full max-w-6xl rounded-2xl border border-[#deded8] bg-white/80 p-3 shadow-[0_22px_70px_rgba(28,28,20,.1)] backdrop-blur-xl sm:p-4"><div className="rounded-xl bg-[#f7f7f2] p-4 sm:p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#777773]">MyKochi live overview</p><p className="mt-1 text-sm text-[#5f5f5a]">Citywide service signals, refreshed in real time.</p></div><div className="flex rounded-lg border border-[#e0e0d9] bg-white p-1">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${activeTab === tab ? "bg-[#0c336b] text-white" : "text-[#686864] hover:bg-[#f4f4ee]"}`}>{tab}</button>)}</div></div><div className="mt-4 grid divide-y divide-[#e1e1da] border-t border-[#e1e1da] pt-1 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"><Metric value="1,482" label="Total reports filed" /><Metric value="94.2%" label="Resolution rate" /><Metric value="2.4 Hours" label="Average triage time" /><div className="px-2 py-5 sm:px-5"><p className="text-xs font-semibold uppercase tracking-[.13em] text-[#7a7a74]">Active departments</p><div className="mt-3 flex flex-wrap gap-1.5"><span className="dept-pill">Engineering</span><span className="dept-pill">Health</span><span className="dept-pill">Revenue</span></div></div></div></div></section>; }
function Metric({ value, label }: { value: string; label: string }) { return <div className="px-2 py-5 sm:px-5"><p className="font-serif text-3xl tracking-[-.04em]">{value}</p><p className="mt-1 text-sm text-[#696965]">{label}</p></div>; }
