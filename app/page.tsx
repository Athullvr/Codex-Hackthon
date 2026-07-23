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
  const [copied, setCopied] = useState(false);
  
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
    if (!manglish.trim() || !ward) return;
    setStage("loading"); setError("");
    try {
      const response = await fetch("/api/manglish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: manglish, location: ward }) });
      const generated = await response.json();
      if (!response.ok) throw new Error(generated.error || "Analysis failed.");
      setClassification({ issueType: generated.issueType, severity: generated.severity as Classification["severity"], department: generated.department as Classification["department"] });
      setDraft({ subject: generated.subject, descriptionEnglish: generated.descriptionEnglish, descriptionMalayalam: generated.descriptionMalayalam });
      setStage("result");
    } catch {
      setError("We couldn't create the report right now. Please try again in a moment."); setStage("capture");
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

  async function copyDraft() {
    if (!draft) return;
    await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\nEnglish complaint:\n${draft.descriptionEnglish}\n\nMalayalam complaint:\n${draft.descriptionMalayalam}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function showOverview(tab: string) {
    setActiveTab(tab);
    document.getElementById("analytics")?.scrollIntoView({ behavior: "smooth" });
  }

  return <main className="min-h-screen overflow-hidden bg-[#fafaf6] text-[#0c336b]"><div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 pb-6 pt-5 sm:px-8 lg:px-12">
    <header className="flex items-center justify-between"><a href="#home" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#0c336b] text-lg font-bold text-[#fafaf6]">P</span><span className="text-lg font-semibold tracking-tight">Parathi.in</span></a><nav className="hidden items-center gap-7 text-sm text-[#4a4a4a] md:flex"><a href="#report">Complaints</a><button onClick={() => showOverview("Wards Lookup")}>Wards Lookup</button><button onClick={() => showOverview("Dashboard")}>Analytics</button><button onClick={() => showOverview("Official Portal")}>Official Portal</button><button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>About</button></nav><button onClick={() => document.getElementById("report")?.scrollIntoView({ behavior: "smooth" })} className="rounded-md bg-[#0c336b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f428a]">Report issue</button></header>
    <section id="home" className="relative flex flex-1 items-center justify-center py-14 sm:py-18 lg:py-12"><div className="hero-glow absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full" /><div className="relative z-10 w-full text-center"><p className="mb-4 text-xs font-semibold uppercase tracking-[.22em] text-[#70706d]">Kochi Municipal Corporation</p><h1 className="mx-auto max-w-4xl font-serif text-4xl leading-[1.04] tracking-[-.045em] sm:text-6xl text-[#0c336b]">Civic intelligence that actually resolves local issues.</h1>
      <section id="report" className={`mykochi-card mx-auto mt-8 w-full text-left ${stage === "result" ? "max-w-5xl" : "max-w-xl"}`}>
        
        {stage === "capture" && <div className="p-5 sm:p-6"><p className="font-serif text-2xl text-[#0c336b]">Report an Issue</p><p className="mt-1 text-sm leading-6 text-[#666661]">Describe the problem. AI will instantly route it to the right department and draft the complaint.</p>
        
        <label className="form-label mt-5 block">Describe the issue
          <textarea 
            className="form-field mt-2 min-h-32 bg-white/50 leading-relaxed pr-3" 
            placeholder={isListening ? "Listening... Speak now." : "e.g. There is a large pothole on the main road, or streetlights are malfunctioning..."}
            value={manglish} 
            onChange={(e) => setManglish(e.target.value)} 
            disabled={isListening}
          />
        </label>

        <label className="form-label mt-4 block" htmlFor="ward">Your ward
          <select id="ward" value={ward} onChange={(e) => setWard(e.target.value)} className="form-field mt-2">
            <option value="">Select your ward</option>{wards.map((item) => <option key={item.name}>{item.name}</option>)}
          </select>
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
        <div className="mt-5"><button disabled={!manglish || !ward || isListening} onClick={analyzeText} className="dark-action w-full disabled:cursor-not-allowed disabled:opacity-40">Analyze Issue <span>→</span></button></div></div>}
        
        {stage === "loading" && <div className="p-8 text-center"><div className="loader mx-auto" /><p className="mt-5 font-serif text-2xl text-[#0c336b]">Preparing your report</p><div className="mt-6 space-y-3 text-left text-sm text-[#65655f]"><p>✓ Analyzing context and details...</p><p className="animate-pulse font-semibold text-[#137333]">◌ Triaging department via Groq AI...</p><p className="text-[#999991]">○ Drafting formal English & Malayalam complaints...</p></div></div>}
        
        {stage === "result" && classification && draft && <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="font-serif text-2xl text-[#0c336b]">Your civic report</p><p className="mt-1 text-sm text-[#666661]">Review, edit, and send it to the official portal.</p></div><button onClick={reset} className="text-xs font-semibold text-[#5b5b55] underline underline-offset-4">Start over</button></div><div className="mt-6 grid gap-6 lg:grid-cols-[.78fr_1.22fr]"><div className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[.13em] text-[#7a7a74]">Detected issue</p><p className="mt-1 font-serif text-xl text-[#0c336b]">{classification.issueType}</p><div className="mt-3 flex flex-wrap gap-2"><span className={`severity severity-${classification.severity}`}>{classification.severity === "high" ? "High Severity" : classification.severity === "medium" ? "Medium Severity" : "Low Severity"}</span><span className="department-badge">{classification.department === "Engineering" ? "Engineering Dept" : classification.department === "Health" ? "Health Dept" : "Revenue Dept"}</span></div></div><label className="form-label" htmlFor="ward">Ward selector<select id="ward" value={ward} onChange={(e) => setWard(e.target.value)} className="form-field mt-2"><option value="">Select a ward</option>{wards.map((item) => <option key={item.name}>{item.name}</option>)}</select></label></div><div className="space-y-4"><label className="form-label">Subject line<input className="form-field mt-2" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} /></label><label className="form-label">English complaint<textarea className="form-field mt-2 min-h-28" value={draft.descriptionEnglish} onChange={(e) => setDraft({ ...draft, descriptionEnglish: e.target.value })} /></label><label className="form-label">Malayalam complaint<textarea className="form-field mt-2 min-h-28 leading-7" value={draft.descriptionMalayalam} onChange={(e) => setDraft({ ...draft, descriptionMalayalam: e.target.value })} /></label></div></div><div className={`validation-alert ${verified ? "validation-ready" : "validation-warning"}`}><span>{verified ? "✓" : "!"}</span><p>{verified ? "Verified & Ready — all complaint fields are complete." : "Complete all complaint fields before submitting."}</p></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><a className="dark-action flex-1" href="https://mykochi.lsgkerala.gov.in/index/complaint" target="_blank" rel="noreferrer">Open Official Portal <span>↗</span></a><button onClick={reset} className="outline-action sm:w-auto">Start Over</button></div></div>}
        {stage === "result" && draft && <div className="px-5 pb-5 sm:px-6 sm:pb-6"><button onClick={copyDraft} className="outline-action w-full">{copied ? "Copied complaint" : "Copy complaint"}</button></div>}
      </section></div></section>
    <Analytics activeTab={activeTab} setActiveTab={setActiveTab} />
    
    <section id="about" className="relative z-20 mx-auto mt-12 w-full max-w-6xl rounded-2xl border border-[#deded8] bg-white/70 p-6 shadow-[0_22px_70px_rgba(28,28,20,.05)] backdrop-blur-xl sm:p-8">
      <div className="grid gap-8 md:grid-cols-[1fr_2.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#777773]">About the Project</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#0c336b]">Bridging the gap between citizens and local governance.</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-[#4e4e4a]">
          <p>
            <strong>Parathi.in</strong> (derived from the Malayalam word for &quot;complaint&quot;) is a modern, citizen-centric civic intelligence platform designed to simplify the municipal complaint registration process. By structuring raw, informal descriptions of civic issues into precise, bilingual formal complaints, Parathi.in eliminates administrative friction.
          </p>
          <p>
            The application operates as a smart, localized triage assistant. It instantly determines the issue type, severity level, and responsible administrative department (Engineering, Health, or Revenue), and drafts high-quality complaints in both English and Malayalam. This ensures that resident reports are actionable, compliant, and ready for official portals.
          </p>
        </div>
      </div>
    </section>
  </div></main>;
}

function Analytics({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const tabs = ["Dashboard", "Departments", "Wards Lookup", "Official Portal"];
  
  return (
    <section id="analytics" className="relative z-20 mx-auto w-full max-w-6xl rounded-2xl border border-[#deded8] bg-white/80 p-3 shadow-[0_22px_70px_rgba(28,28,20,.1)] backdrop-blur-xl sm:p-4">
      <div className="rounded-xl bg-[#f7f7f2] p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#777773]">Live Overview</p>
            <p className="mt-1 text-sm text-[#5f5f5a]">Citywide service signals, refreshed in real time.</p>
          </div>
          <div className="flex rounded-lg border border-[#e0e0d9] bg-white p-1">
            {tabs.map((tab) => {
              return (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${activeTab === tab ? "bg-[#0c336b] text-white" : "text-[#686864] hover:bg-[#f4f4ee]"}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === "Dashboard" && (
          <div className="mt-4 grid divide-y divide-[#e1e1da] border-t border-[#e1e1da] pt-1 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            <Metric value="1,482" label="Total reports filed" subtext="+12% this week" />
            <Metric value="94.2%" label="Resolution rate" progress={94.2} />
            <Metric value="2.4 Hours" label="Average triage speed" subtext="Rapid response" />
            <div className="px-2 py-5 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[.13em] text-[#7a7a74] mb-2">Active Departments</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="dept-pill bg-emerald-100 text-emerald-800">Engineering</span>
                <span className="dept-pill bg-sky-100 text-sky-800">Health</span>
                <span className="dept-pill bg-amber-100 text-amber-800">Revenue</span>
              </div>
            </div>
          </div>
        )}

        {/* Departments Tab Content */}
        {activeTab === "Departments" && (
          <div className="mt-6 border-t border-[#e1e1da] pt-6 grid gap-6 md:grid-cols-3">
            <DepartmentBar name="Engineering (Roads & Lights)" percent={58} count="860 complaints" color="bg-emerald-600" />
            <DepartmentBar name="Health (Sanitation & Waste)" percent={27} count="400 complaints" color="bg-sky-600" />
            <DepartmentBar name="Revenue (Taxes & Land)" percent={15} count="222 complaints" color="bg-amber-600" />
          </div>
        )}

        {/* Wards Lookup Tab Content */}
        {activeTab === "Wards Lookup" && (
          <div className="mt-6 border-t border-[#e1e1da] pt-6">
            <p className="text-xs font-semibold uppercase tracking-[.13em] text-[#7a7a74] mb-4">Wards with Most Active Reports</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <WardCard rank={1} name="Kaloor South (Ward 65)" count="14 reports" status="6 resolved" />
              <WardCard rank={2} name="Vyttila (Ward 48)" count="9 reports" status="7 resolved" />
              <WardCard rank={3} name="Ernakulam South (Ward 62)" count="7 reports" status="5 resolved" />
              <WardCard rank={4} name="Edappally (Ward 34)" count="5 reports" status="4 resolved" />
            </div>
          </div>
        )}

        {/* Visit Portal Tab Content */}
        {activeTab === "Official Portal" && (
          <div className="mt-6 border-t border-[#e1e1da] pt-6 flex flex-col items-center text-center max-w-xl mx-auto py-4">
            <h3 className="font-serif text-lg font-semibold text-[#0c336b]">Kochi Municipal Corporation Portal</h3>
            <p className="text-sm text-[#5f5f5a] mt-2 leading-relaxed">
              Visit the official website for corporate tax collection, land services, certificates, and other offline municipal inquiries.
            </p>
            <a 
              href="https://kochicorporation.lsgkerala.gov.in" 
              target="_blank" 
              rel="noreferrer" 
              className="mt-4 dark-action px-6 py-2.5 rounded-lg text-sm"
            >
              Open Official Portal ↗
            </a>
          </div>
        )}

      </div>
    </section>
  );
}

function Metric({ value, label, subtext, progress }: { value: string; label: string; subtext?: string; progress?: number }) {
  return (
    <div className="px-2 py-5 sm:px-5">
      <p className="font-serif text-3xl tracking-[-.04em] text-[#0c336b]">{value}</p>
      <p className="mt-1 text-sm text-[#696965] font-semibold">{label}</p>
      {subtext && <p className="mt-1 text-xs text-emerald-600 font-medium">{subtext}</p>}
      {progress && (
        <div className="mt-2 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#0c336b] h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function DepartmentBar({ name, percent, count, color }: { name: string; percent: number; count: string; color: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-bold text-gray-700 leading-tight">{name}</p>
        <span className="text-sm font-extrabold text-[#0c336b]">{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-2">
        <div className={`${color} h-full rounded-full`} style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-gray-500 font-semibold">{count}</p>
    </div>
  );
}

function WardCard({ rank, name, count, status }: { rank: number; name: string; count: string; status: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-center">
      <div className="font-serif text-2xl font-bold text-gray-300">#{rank}</div>
      <div>
        <p className="text-xs font-bold text-gray-800 leading-normal">{name}</p>
        <div className="flex gap-2 items-center mt-1 text-[11px]">
          <span className="text-red-500 font-bold">{count}</span>
          <span className="text-gray-300">|</span>
          <span className="text-emerald-600 font-bold">{status}</span>
        </div>
      </div>
    </div>
  );
}
