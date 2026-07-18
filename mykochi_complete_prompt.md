# Codex Integration Prompt: Merge MyKochi Theme with Paraathi AI Engine

This prompt is designed to instruct Codex (or any advanced LLM) to take the current **MyKochi** layout (with the warm cream canvas, serif typography, floating chips, and bottom analytics) and merge it with the functional **Paraathi** AI civic reporting engine (geolocation, file upload, Vision/completion APIs, and bilingual drafts).

---

# MASTER INSTRUCTION FOR CODEX: MERGE MYKOCHI DESIGN WITH PARAATHI AI

Modify `app/page.tsx` and ensure `app/globals.css` integrates the full, state-driven AI civic reporting workflow from Paraathi while maintaining the premium warm-cream design language, floating chips, navbar, and bottom analytics panel.

### 🎨 Visual Theme Constraints to Maintain:
*   **Colors**: Keep the warm cream canvas background (`#fafaf6`), charcoal text (`#111111`), and clean borders (`border-[#deded8]`).
*   **Typography**: Serif font utilities (`font-serif`) for headers and sans-serif for labels and options.
*   **Background Elements**: Keep the floating department status chips (.status-chip) drifting around the background.
*   **Docked Panel**: Keep the bottom analytics card overview (Metric counters and active departments).

---

## 🔄 Dynamic State-Driven Hero Widget
Instead of a static description and static buttons in the center of the hero section, replace them with a dynamic card container (`max-w-xl w-full mx-auto mt-9 bg-white/60 border border-[#e1e1da] rounded-2xl p-6 backdrop-blur-md shadow-sm`) that cycles through **three workflow screens** based on state:

### 1. State 1: Capture Screen (Default)
*   **Instruction Text**: *"To report a civic problem, drop a photo here or browse your device."*
*   **Drop Zone**: A clean dashed border uploader area. If a photo is selected, show a thumbnail preview instead of the upload instructions.
*   **Action Buttons**:
    *   **"Analyze Issue"**: Gradient dark button (disabled if no file is selected) that triggers the AI classification pipeline.
    *   **"Run Cached Demo"**: Solid outline button that instantly populates the UI with mock offline details (bypassing APIs and GPS for immediate demos).

### 2. State 2: Loading Screen
*   **Spinner**: A circular, dual-colored spinning loader.
*   **Status Logs**: Show the current processing phase:
    1.  *✓ Reading location & metadata details...*
    2.  *◌ Analyzing issue and triaging department via AI...* (animated pulsing teal text)
    3.  *○ Drafting formal English & Malayalam complaints...*

### 3. State 3: Result Card Screen
*   **Grid layout (2 columns on desktop)**:
    *   *Column 1 (Metadata)*:
        *   **Thumbnail**: The uploaded issue photo.
        *   **Triaged Badges**: Glowing pill-shaped badges for *Severity* (colored green/yellow/red) and detected *Department* (Engineering / Health / Revenue).
        *   **Ward Selector**: A search/dropdown element loaded with all 74 Kochi Wards. It should pre-select the closest ward (computed from the user's location via the Haversine formula in `lib/wards.ts`), but remain fully editable.
    *   *Column 2 (Editable Bilingual Draft)*:
        *   **Subject Line**: Text field containing the AI-generated subject.
        *   **English Complaint**: Textarea showing the detailed description.
        *   **Malayalam Complaint**: Textarea showing the Malayalam translation.
*   **Bilingual Validation Alert**: A box at the bottom checking that all fields are non-empty. Shows a green "✓ Verified & Ready" alert or a warning if fields are cleared.
*   **Drawer Actions**:
    *   **"Open in MyKochi"**: Standout dark button that launches `https://mykochi.lsgkerala.gov.in/index/complaint` in a new tab.
    *   **"Start Over"**: Reset button to go back to the Capture Screen.

---

## 🛰️ Geolocation & Fallback Integration
Implement the client-side location retrieval within `app/page.tsx`:
1.  On file selection, call `navigator.geolocation.getCurrentPosition` with a 3-second timeout constraint.
2.  If geolocation fails, is denied, or times out, fallback to Vyttila: `9.9689, 76.3183`.
3.  Use the `exifr` package to parse EXIF metadata coordinates from the file if browser permission is blocked.
4.  Run `nearestWard(lat, lng)` from `lib/wards.ts` to map coordinates to the closest ward name and update the React state.

## 🤖 API Fetch Logic
Ensure the "Analyze" button performs serial fetches:
1.  **POST `/api/classify`**: Send base64 payload. Receives `{ issueType, severity, department }`.
2.  **POST `/api/draft`**: Send triaged context + nearest ward name. Receives `{ subject, descriptionEnglish, descriptionMalayalam }`.
3.  Gracefully catch errors and display a clear error alert inside the uploader container with a "Retry" option.
