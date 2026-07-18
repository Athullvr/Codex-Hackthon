"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import { KOCHI_WARDS, nearestWard } from "@/lib/wards";

type Classification = { issueType: string; severity: "low" | "medium" | "high"; department: "Engineering" | "Health" | "Revenue" };
type Draft = { subject: string; descriptionEnglish: string; descriptionMalayalam: string };
type Coordinates = { lat: number; lng: number };
type Screen = "capture" | "loading" | "result";

const FALLBACK: Coordinates = { lat: 9.9689, lng: 76.3183 };
const DEMO: Classification & Draft & { ward: string } = {
  issueType: "Broken Streetlight", severity: "medium", department: "Engineering", ward: "Kaloor South-65",
  subject: "Malfunctioning streetlights on Kaloor-Kadavanthra road",
  descriptionEnglish: "The streetlights along Kaloor-Kadavanthra road have been out of service for the past three nights, making the stretch dark and unsafe for drivers. Please repair them immediately.",
  descriptionMalayalam: "കലൂർ-കടവന്ത്ര റോഡിലെ തെരുവ് വിളക്കുകൾ കഴിഞ്ഞ മൂന്ന് ദിവസമായി പ്രവർത്തിക്കുന്നില്ല. ഇത് രാത്രിയാത്രക്കാർക്ക് ബുദ്ധിമുട്ടും സുരക്ഷാഭീഷണിയും ഉണ്ടാക്കുന്നു. ഈ പ്രശ്നം അടിയന്തരമായി പരിഹരിക്കണമെന്ന് അഭ്യർത്ഥിക്കുന്നു.",
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
}

async function findLocation(file: File): Promise<Coordinates> {
  const live = new Promise<Coordinates>((resolve, reject) => navigator.geolocation?.getCurrentPosition(
    (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }), reject, { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 },
  ));
  try { return await live; } catch {
    try { const exifr = await import("exifr"); const gps = await exifr.gps(file); if (gps?.latitude && gps?.longitude) return { lat: gps.latitude, lng: gps.longitude }; } catch { /* Demo fallback is intentional. */ }
    return FALLBACK;
  }
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("capture");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coordinates>(FALLBACK);
  const [classification, setClassification] = useState<Classification | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [ward, setWard] = useState("");
  const [error, setError] = useState("");

  const verified = Boolean(classification?.department && ward && draft?.subject.trim() && draft?.descriptionEnglish.trim() && draft?.descriptionMalayalam.trim());
  const sortedWards = useMemo(() => [...KOCHI_WARDS].sort((a, b) => a.name.localeCompare(b.name)), []);

  useEffect(() => { if (new URLSearchParams(window.location.search).get("demo") === "true") runDemo(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function selectFile(selected: File | null) {
    if (!selected?.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError(""); setFile(selected); setPreview(await fileToDataUrl(selected));
    const position = await findLocation(selected); setCoords(position); setWard(nearestWard(position.lat, position.lng).name);
  }

  async function analyze() {
    if (!file || !preview) return;
    setScreen("loading"); setError("");
    try {
      const classifiedResponse = await fetch("/api/classify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: preview }) });
      const classified = await classifiedResponse.json(); if (!classifiedResponse.ok) throw new Error(classified.error);
      const draftResponse = await fetch("/api/draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...classified, location: `${nearestWard(coords.lat, coords.lng).name}, Kochi` }) });
      const generatedDraft = await draftResponse.json(); if (!draftResponse.ok) throw new Error(generatedDraft.error);
      setClassification(classified); setDraft(generatedDraft); setWard((current) => current || nearestWard(coords.lat, coords.lng).name); setScreen("result");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Analysis failed. Please try again."); setScreen("capture"); }
  }

  function runDemo() { setClassification(DEMO); setDraft(DEMO); setWard(DEMO.ward); setCoords(FALLBACK); setPreview(null); setFile(null); setError(""); setScreen("result"); }
  function reset() { setScreen("capture"); setFile(null); setPreview(null); setClassification(null); setDraft(null); setWard(""); setError(""); }

  if (screen === "loading") return <main className="app-shell flex min-h-screen items-center justify-center p-6"><section className="glass-card w-full max-w-lg p-8 text-center"><div className="spinner mx-auto mb-7" /><p className="eyebrow">Paraathi intelligence</p><h1 className="mt-2 text-2xl font-semibold text-white">Preparing your complaint</h1><div className="mt-8 space-y-4 text-left text-sm text-slate-300"><p>✓ Reading image metadata & location details...</p><p className="animate-pulse text-cyan-300">◌ Analyzing issue and triaging department via AI...</p><p className="text-slate-500">○ Drafting formal English & Malayalam complaints...</p></div></section></main>;

  if (screen === "result" && classification && draft) return <main className="app-shell min-h-screen px-4 py-8 sm:p-8"><div className="mx-auto max-w-5xl"><header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">AI civic issue reporter</p><h1 className="text-3xl font-semibold text-white">Complaint workspace</h1></div><button onClick={reset} className="button-secondary">← Start Over</button></header><div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]"><section className="space-y-6"><article className="glass-card p-6"><p className="eyebrow">Triage complete</p><h2 className="mt-2 text-xl font-semibold text-white">{classification.issueType}</h2><div className="mt-5 flex flex-wrap gap-3"><span className={`badge severity-${classification.severity}`}>{classification.severity} severity</span><span className="badge badge-department">{classification.department}</span></div></article><article className="glass-card p-6"><label className="label" htmlFor="ward">Kochi Municipal Corporation ward</label><select id="ward" value={ward} onChange={(event) => setWard(event.target.value)} className="field mt-2">{sortedWards.map((item) => <option key={item.name}>{item.name}</option>)}</select><p className="mt-3 text-xs text-slate-400">Nearest ward is preselected from your location. You can correct it before submitting.</p></article><article className={`verification ${verified ? "verified" : "incomplete"}`}><span>{verified ? "✓" : "!"}</span><div><strong>{verified ? "Complaint Verified & Ready" : "Complete the required fields"}</strong><p>{verified ? "Department, ward, subject, and both language drafts are present." : "All five fields must be filled before submission."}</p></div></article></section><section className="glass-card p-6"><p className="eyebrow">Editable bilingual draft</p><div className="mt-5 space-y-5"><label className="label">Subject<input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} className="field mt-2" /></label><label className="label">English complaint<textarea value={draft.descriptionEnglish} onChange={(event) => setDraft({ ...draft, descriptionEnglish: event.target.value })} className="field mt-2 min-h-32" /></label><label className="label">Malayalam complaint<textarea value={draft.descriptionMalayalam} onChange={(event) => setDraft({ ...draft, descriptionMalayalam: event.target.value })} className="field mt-2 min-h-32 leading-7" /></label></div><a className="button-primary mt-6 flex w-full justify-center" href="https://mykochi.lsgkerala.gov.in/index/complaint" target="_blank" rel="noreferrer">Open in MyKochi ↗</a></section></div></div></main>;

  return <main className="app-shell min-h-screen px-4 py-10 sm:p-10"><div className="mx-auto max-w-3xl"><header className="mb-10 text-center"><div className="brand-mark mx-auto mb-5">P</div><p className="eyebrow">Kochi civic intelligence</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Report it. <span className="gradient-text">Resolve it.</span></h1><p className="mx-auto mt-4 max-w-xl text-slate-400">Paraathi turns a photo into a clear, bilingual civic complaint — ready for MyKochi.</p></header><section className="glass-card p-5 sm:p-8"><label className="drop-zone block cursor-pointer" onDragOver={(event: DragEvent<HTMLLabelElement>) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files[0] ?? null); }}><input type="file" accept="image/*" className="sr-only" onChange={(event: ChangeEvent<HTMLInputElement>) => selectFile(event.target.files?.[0] ?? null)} />{preview ? <img src={preview} alt="Selected civic issue" className="mx-auto max-h-64 rounded-xl object-cover" /> : <div className="py-12 text-center"><div className="mb-4 text-4xl">⌁</div><p className="font-medium text-white">Drop an issue photo here</p><p className="mt-1 text-sm text-slate-400">or click to browse from your device</p></div>}</label>{file && <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-900/70 px-4 py-3 text-sm"><span className="truncate text-slate-300">{file.name}</span><span className="ml-4 text-emerald-400">Ready</span></div>}{error && <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}<div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={analyze} disabled={!file} className="button-primary disabled:cursor-not-allowed disabled:opacity-40">Analyze Issue →</button><button onClick={runDemo} className="button-secondary">Run Cached Demo</button></div></section><p className="mt-5 text-center text-xs text-slate-500">Your photo is only sent to AI when you choose Analyze Issue. Cached Demo stays fully offline.</p></div></main>;
}
