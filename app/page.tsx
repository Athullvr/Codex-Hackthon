"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import { KOCHI_WARDS, nearestWard } from "@/lib/wards";

type Classification = { issueType: string; severity: "low" | "medium" | "high"; department: "Engineering" | "Health" | "Revenue" };
type Draft = { subject: string; descriptionEnglish: string; descriptionMalayalam: string };
type Coordinates = { lat: number; lng: number };
type Stage = "capture" | "loading" | "result";

const VYTTILA: Coordinates = { lat: 9.9689, lng: 76.3183 };
const DEMO: Classification & Draft & { ward: string } = {
  issueType: "Broken Streetlight", severity: "medium", department: "Engineering", ward: "Kaloor South-65",
  subject: "Malfunctioning streetlights on Kaloor-Kadavanthra road",
  descriptionEnglish: "The streetlights along Kaloor-Kadavanthra road have been out of service for the past three nights, making the stretch dark and unsafe for drivers. Please repair them immediately.",
  descriptionMalayalam: "കലൂർ-കടവന്ത്ര റോഡിലെ തെരുവ് വിളക്കുകൾ കഴിഞ്ഞ മൂന്ന് ദിവസമായി പ്രവർത്തിക്കുന്നില്ല. ഇത് രാത്രിയാത്രക്കാർക്ക് ബുദ്ധിമുട്ടും സുരക്ഷാഭീഷണിയും ഉണ്ടാക്കുന്നു. ഈ പ്രശ്നം അടിയന്തരമായി പരിഹരിക്കണമെന്ന് അഭ്യർത്ഥിക്കുന്നു.",
};

const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });

async function resolveLocation(file: File): Promise<Coordinates> {
  try {
    return await new Promise<Coordinates>((resolve, reject) => navigator.geolocation?.getCurrentPosition((point) => resolve({ lat: point.coords.latitude, lng: point.coords.longitude }), reject, { timeout: 3000, maximumAge: 300000 }));
  } catch {
    try { const exifr = await import("exifr"); const gps = await exifr.gps(file); if (gps?.latitude && gps?.longitude) return { lat: gps.latitude, lng: gps.longitude }; } catch { /* Vyttila is the reliable demo fallback. */ }
    return VYTTILA;
  }
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("capture"); 
  const [file, setFile] = useState<File | null>(null); 
  const [preview, setPreview] = useState<string | null>(null); 
  const [manglish, setManglish] = useState("");
  const [coords, setCoords] = useState<Coordinates>(VYTTILA); 
  const [classification, setClassification] = useState<Classification | null>(null); 
  const [draft, setDraft] = useState<Draft | null>(null); 
  const [ward, setWard] = useState(""); 
  const [error, setError] = useState(""); 
  const [activeTab, setActiveTab] = useState("Dashboard");
  const wards = useMemo(() => [...KOCHI_WARDS].sort((a, b) => a.name.localeCompare(b.name)), []);
  const verified = Boolean(classification?.department && ward && draft?.subject.trim() && draft?.descriptionEnglish.trim() && draft?.descriptionMalayalam.trim());
  useEffect(() => { if (new URLSearchParams(window.location.search).get("demo") === "true") runDemo(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function chooseFile(selected: File | null) { 
    if (!selected) return;
    setError(""); setFile(selected); setPreview(await toDataUrl(selected));
    resolveLocation(selected).then((loc) => { setCoords(loc); setWard(nearestWard(loc.lat, loc.lng).name); });
  }

  async function analyze() { 
    if (!preview || !file) return; 
    setStage("loading"); setError(""); 
    try { 
      const classifyResponse = await fetch("/api/classify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: preview }) }); 
      const classified = await classifyResponse.json(); 
      if (!classifyResponse.ok) throw new Error(classified.error || "Analysis failed."); 
      const draftResponse = await fetch("/api/draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...classified, location: `${ward || nearestWard(coords.lat, coords.lng).name}, Kochi` }) }); 
      const generated = await draftResponse.json(); 
      if (!draftResponse.ok) throw new Error(generated.error || "Drafting failed."); 
      setClassification(classified); setDraft(generated); setStage("result"); 
    } catch (caught) { 
      setError(caught instanceof Error ? caught.message : "We could not analyze this issue."); setStage("capture"); 
    } 
  }

  async function analyzeText() {
    if (!manglish.trim()) return;
    setStage("loading"); setError("");
    try {
      const response = await fetch("/api/manglish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: manglish, location: ward || "Vyttila, Kochi" }) });
      const generated = await response.json();
      if (!response.ok) throw new Error(generated.error || "Analysis failed.");
      setClassification({ issueType: generated.issueType, severity: generated.severity as any, department: generated.department as any });
      setDraft({ subject: generated.subject, descriptionEnglish: generated.descriptionEnglish, descriptionMalayalam: generated.descriptionMalayalam });
      setStage("result");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not analyze this text."); setStage("capture");
    }
  }

  function runDemo() { setFile(null); setPreview(null); setManglish(""); setCoords(VYTTILA); setWard(DEMO.ward); setClassification(DEMO); setDraft(DEMO); setError(""); setStage("result"); }
  function reset() { setStage("capture"); setFile(null); setPreview(null); setManglish(""); setClassification(null); setDraft(null); setWard(""); setError(""); }

  return <main className="min-h-screen overflow-hidden bg-[#fafaf6] text-[#111111]"><div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 pb-6 pt-5 sm:px-8 lg:px-12">
    <header className="flex items-center justify-between"><a href="#home" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#111111] text-lg font-bold text-[#fafaf6]">M</span><span className="text-lg font-semibold tracking-tight">MyKochi</span></a><nav className="hidden items-center gap-7 text-sm text-[#4a4a4a] md:flex"><a href="#report">Complaints</a><a href="#ward">Wards Lookup</a><a href="#analytics">Analytics</a><a href="#contact">Contact</a></nav><button onClick={() => document.getElementById("report")?.scrollIntoView()} className="rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#222222]">Report issue</button></header>
    <section id="home" className="relative flex flex-1 items-center justify-center py-14 sm:py-18 lg:py-12"><div className="hero-glow absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full" /><div className="relative z-10 w-full text-center"><p className="mb-4 text-xs font-semibold uppercase tracking-[.22em] text-[#70706d]">Kochi Municipal Corporation</p><h1 className="mx-auto max-w-4xl font-serif text-4xl leading-[1.04] tracking-[-.045em] sm:text-6xl">Civic intelligence that actually resolves local issues.</h1>
      <section id="report" className={`mykochi-card mx-auto mt-8 w-full text-left ${stage === "result" ? "max-w-5xl" : "max-w-xl"}`}>
        
        {stage === "capture" && <div className="p-5 sm:p-6"><p className="font-serif text-2xl">Start a civic report</p><p className="mt-1 text-sm leading-6 text-[#666661]">To report a civic problem, drop a photo here or describe it below.</p>
        
        <label className="upload-zone mt-5 block cursor-pointer" onDragOver={(e: DragEvent<HTMLLabelElement>) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files[0] ?? null); }}><input className="sr-only" type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => { chooseFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />{preview ? <img src={preview} alt="Selected civic issue" className="mx-auto max-h-48 rounded-xl object-cover" /> : <div className="py-9 text-center"><span className="text-2xl">⌁</span><p className="mt-2 text-sm font-semibold">Drop a photo of the issue</p><p className="mt-1 text-xs text-[#777771]">JPEG, PNG, or HEIC — click to browse</p></div>}</label>
        {file && <p className="mt-3 truncate text-xs text-[#5e5e58]">Selected: {file.name}</p>}

        <div className="my-5 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-widest text-[#9e9e97]"><span className="h-px flex-1 bg-[#e0e0d8]"></span>OR<span className="h-px flex-1 bg-[#e0e0d8]"></span></div>
        <label className="form-label">Describe the issue in Manglish<textarea className="form-field mt-2 min-h-24 bg-white/50" placeholder="e.g. ivide roadil oru valiya pothole und, aalkar veezhunnu..." value={manglish} onChange={(e) => { setManglish(e.target.value); setFile(null); setPreview(null); }} /></label>

        {error && <div className="error-alert mt-4"><span>{error}</span><button onClick={() => manglish ? analyzeText() : analyze()} disabled={!file && !manglish}>Retry</button></div>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={!file && !manglish} onClick={() => file ? analyze() : analyzeText()} className="dark-action disabled:cursor-not-allowed disabled:opacity-40">Analyze Issue <span>→</span></button><button onClick={runDemo} className="outline-action">Run Cached Demo</button></div></div>}
        
        {stage === "loading" && <div className="p-8 text-center"><div className="loader mx-auto" /><p className="mt-5 font-serif text-2xl">Preparing your report</p><div className="mt-6 space-y-3 text-left text-sm text-[#65655f]"><p>✓ Analyzing context and generating details...</p><p className="animate-pulse font-semibold text-[#137333]">◌ Triaging department via AI...</p><p className="text-[#999991]">○ Drafting formal English & Malayalam complaints...</p></div></div>}
        
        {stage === "result" && classification && draft && <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="font-serif text-2xl">Your civic report</p><p className="mt-1 text-sm text-[#666661]">Review, edit, and send it to MyKochi.</p></div><button onClick={reset} className="text-xs font-semibold text-[#5b5b55] underline underline-offset-4">Start over</button></div><div className="mt-6 grid gap-6 lg:grid-cols-[.78fr_1.22fr]"><div className="space-y-4">{preview ? <img src={preview} alt="Reported issue" className="h-36 w-full rounded-xl object-cover" /> : <div className="grid h-28 place-items-center rounded-xl bg-[#f1f1eb] text-sm text-[#777771]">No image provided</div>}<div><p className="text-xs font-semibold uppercase tracking-[.13em] text-[#7a7a74]">Detected issue</p><p className="mt-1 font-serif text-xl">{classification.issueType}</p><div className="mt-3 flex flex-wrap gap-2"><span className={`severity severity-${classification.severity}`}>{classification.severity} severity</span><span className="department-badge">{classification.department}</span></div></div><label className="form-label" htmlFor="ward">Ward selector<select id="ward" value={ward} onChange={(e) => setWard(e.target.value)} className="form-field mt-2">{wards.map((item) => <option key={item.name}>{item.name}</option>)}</select></label></div><div className="space-y-4"><label className="form-label">Subject line<input className="form-field mt-2" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} /></label><label className="form-label">English complaint<textarea className="form-field mt-2 min-h-28" value={draft.descriptionEnglish} onChange={(e) => setDraft({ ...draft, descriptionEnglish: e.target.value })} /></label><label className="form-label">Malayalam complaint<textarea className="form-field mt-2 min-h-28 leading-7" value={draft.descriptionMalayalam} onChange={(e) => setDraft({ ...draft, descriptionMalayalam: e.target.value })} /></label></div></div><div className={`validation-alert ${verified ? "validation-ready" : "validation-warning"}`}><span>{verified ? "✓" : "!"}</span><p>{verified ? "Verified & Ready — all complaint fields are complete." : "Complete all complaint fields before submitting."}</p></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><a className="dark-action flex-1" href="https://mykochi.lsgkerala.gov.in/index/complaint" target="_blank" rel="noreferrer">Open in MyKochi <span>↗</span></a><button onClick={reset} className="outline-action sm:w-auto">Start Over</button></div></div>}
      
      </section></div></section>
    <Analytics activeTab={activeTab} setActiveTab={setActiveTab} /></div><span id="contact" className="sr-only">Contact</span></main>;
}

function Analytics({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) { const tabs = ["Dashboard", "Elements", "Wards", "Visit Portal"]; return <section id="analytics" className="relative z-20 mx-auto w-full max-w-6xl rounded-2xl border border-[#deded8] bg-white/80 p-3 shadow-[0_22px_70px_rgba(28,28,20,.1)] backdrop-blur-xl sm:p-4"><div className="rounded-xl bg-[#f7f7f2] p-4 sm:p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#777773]">MyKochi live overview</p><p className="mt-1 text-sm text-[#5f5f5a]">Citywide service signals, refreshed in real time.</p></div><div className="flex rounded-lg border border-[#e0e0d9] bg-white p-1">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${activeTab === tab ? "bg-[#111111] text-white" : "text-[#686864] hover:bg-[#f4f4ee]"}`}>{tab}</button>)}</div></div><div className="mt-4 grid divide-y divide-[#e1e1da] border-t border-[#e1e1da] pt-1 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"><Metric value="1,482" label="Total reports filed" /><Metric value="94.2%" label="Resolution rate" /><Metric value="2.4 Hours" label="Average triage time" /><div className="px-2 py-5 sm:px-5"><p className="text-xs font-semibold uppercase tracking-[.13em] text-[#7a7a74]">Active departments</p><div className="mt-3 flex flex-wrap gap-1.5"><span className="dept-pill">Engineering</span><span className="dept-pill">Health</span><span className="dept-pill">Revenue</span></div></div></div></div></section>; }
function Metric({ value, label }: { value: string; label: string }) { return <div className="px-2 py-5 sm:px-5"><p className="font-serif text-3xl tracking-[-.04em]">{value}</p><p className="mt-1 text-sm text-[#696965]">{label}</p></div>; }
