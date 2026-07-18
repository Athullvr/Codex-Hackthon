# Incremental Codex Build Prompt for **Paraathi**

This document contains a structured, multi-phase prompt designed to build the **Paraathi** Next.js 14 application incrementally. You can copy these sections phase-by-phase into Codex (or your preferred LLM model) to commit code in clean intervals, making your Git history and codebase structure look extremely professional and presentable for judges.

---

# MASTER PROMPT: BUILD "PARAATHI" (AI CIVIC ISSUE REPORTER)

Build a complete Next.js 14 (App Router, TypeScript) web app called **Paraathi** (meaning "Complaint" in Malayalam) — an AI civic issue reporter. This is a solo hackathon build, designed to run fully client-side (no database, using in-memory state). It uses OpenAI APIs for classification and draft generation, with geolocation and static ward centroid mapping.

## 🎨 Design System (Aesthetics)
The visual theme must match a premium, high-fidelity dark technology design (colors, spacing, layout feel):
*   **Background**: Immersive deep slate/obsidian (`#090d16` or similar dark blue-gray).
*   **Card Containers**: Glassmorphism (`rgba(15, 23, 42, 0.65)` with `backdrop-blur-md` and a clean 1px border of `border-slate-800`).
*   **Accent Colors**: Glowing Teal/Emerald (`#06b6d4` to `#10b981`) and Electric Blue (`#3b82f6`).
*   **Typography**: Clean sans-serif (Inter, Outfit, or Geist) with high hierarchy and legibility.
*   **Interactive Elements**: Smooth hover micro-animations (e.g. scales, border-glows) and pulse loading indicators.

---

## 🛠️ Implementation Checklist (Git Commits / Intervals)

We will build the application in **5 distinct phases**. Perform the work incrementally, ensuring that the app builds and runs cleanly after each phase before proceeding.

```markdown
- [ ] Phase 1: Environment Setup & Kochi Wards Utility
- [ ] Phase 2: Classification API Route (/api/classify)
- [ ] Phase 3: Complaint Draft API Route (/api/draft)
- [ ] Phase 4: Geolocation Engine & Demo Fallbacks
- [ ] Phase 5: High-Fidelity Responsive Frontend UI & Verification
```

---

### 📍 Phase 1: Environment Setup & Kochi Wards Utility

#### Action Items:
1.  **Environment Files**:
    *   Create `.env.example`:
        ```env
        OPENAI_API_KEY=your-openai-api-key-here
        ```
    *   Create `.env.local` with a placeholder `OPENAI_API_KEY=` line.

2.  **Kochi Wards Database (`lib/wards.ts`)**:
    Create a library file containing all Kochi Municipal Corporation wards mapped to approximate geographic centroids (using standard ranges for West Kochi, Willingdon Island, Central, North, and East Ernakulam), along with a Haversine formula to compute the nearest ward.

    *   **File Path**: `lib/wards.ts`
    *   **Code Implementation**:
        ```typescript
        export interface Ward {
          name: string;
          lat: number;
          lng: number;
        }

        export const KOCHI_WARDS: Ward[] = [
          // West Kochi / Mattanchery / Fort Kochi / Edakochi (approx 9.93 to 9.97 lat, 76.24 to 76.27 lng)
          { name: "Fortkochi-1", lat: 9.9692, lng: 76.2443 },
          { name: "Kalvathy-2", lat: 9.9678, lng: 76.2472 },
          { name: "Earaveli-3", lat: 9.9634, lng: 76.2498 },
          { name: "Karippalam-4", lat: 9.9612, lng: 76.2512 },
          { name: "Mattanchery-5", lat: 9.9592, lng: 76.2554 },
          { name: "Kochangadi-6", lat: 9.9548, lng: 76.2531 },
          { name: "Cheralayi-7", lat: 9.9568, lng: 76.2578 },
          { name: "Panayappilly-8", lat: 9.9512, lng: 76.2562 },
          { name: "Chakkamadom-9", lat: 9.9482, lng: 76.2541 },
          { name: "Karuvelippady-10", lat: 9.9448, lng: 76.2575 },
          { name: "Thoppumpady-11", lat: 9.9388, lng: 76.2598 },
          { name: "Tharebhagam-12", lat: 9.9338, lng: 76.2581 },
          { name: "Kadebhagam-13", lat: 9.9298, lng: 76.2595 },
          { name: "Thazhuppu-14", lat: 9.9248, lng: 76.2572 },
          { name: "Eadakochi North-15", lat: 9.9198, lng: 76.2622 },
          { name: "Edakochi South-16", lat: 9.9088, lng: 76.2682 },
          { name: "Perumbadappu-17", lat: 9.9018, lng: 76.2752 },
          { name: "Konam-18", lat: 9.9412, lng: 76.2482 },
          { name: "Nambyapuram-20", lat: 9.9322, lng: 76.2452 },
          { name: "Pullardesam-21", lat: 9.9272, lng: 76.2442 },
          { name: "Mundamvelly-22", lat: 9.9362, lng: 76.2422 },
          { name: "Manasserry-23", lat: 9.9432, lng: 76.2392 },
          { name: "Moolamkuzhy-24", lat: 9.9522, lng: 76.2382 },
          { name: "Chullickal-25", lat: 9.9472, lng: 76.2492 },
          { name: "Nazreth-26", lat: 9.9488, lng: 76.2625 },
          { name: "Fortkochi Veli-27", lat: 9.9622, lng: 76.2412 },
          { name: "Amaravathy-28", lat: 9.9652, lng: 76.2428 },

          // Willingdon Island (approx 9.94 to 9.96 lat, 76.26 to 76.28 lng)
          { name: "Island North-29", lat: 9.9612, lng: 76.2698 },
          { name: "Island South-30", lat: 9.9432, lng: 76.2782 },

          // Central / North Ernakulam (approx 9.97 to 10.03 lat, 76.27 to 76.30 lng)
          { name: "Kacheripady-19", lat: 9.9832, lng: 76.2798 },
          { name: "Vaduthala West-31", lat: 10.0152, lng: 76.2722 },
          { name: "Vaduthala East-32", lat: 10.0192, lng: 76.2792 },
          { name: "Elamakkara North-33", lat: 10.0242, lng: 76.2912 },
          { name: "Puthukkalavattam-34", lat: 10.0158, lng: 76.2952 },
          { name: "Ponekkara-35", lat: 10.0298, lng: 76.2998 },
          { name: "Kunnumpuram-36", lat: 10.0272, lng: 76.3052 },
          { name: "Edappally-37", lat: 10.0212, lng: 76.3092 },
          { name: "Dhevankulangara-38", lat: 10.0112, lng: 76.2992 },
          { name: "Karukappilli-39", lat: 10.0022, lng: 76.2932 },
          { name: "Mamangalam-40", lat: 10.0162, lng: 76.3012 },
          { name: "Ernakulam North-67", lat: 9.9922, lng: 76.2792 },
          { name: "Ayyappankavu-68", lat: 9.9982, lng: 76.2772 },
          { name: "Thrikkanarvattom-69", lat: 9.9912, lng: 76.2872 },
          { name: "Kaloor North-70", lat: 10.0032, lng: 76.2882 },
          { name: "Elamakkara South-71", lat: 10.0092, lng: 76.2912 },
          { name: "Pottakuzhy-72", lat: 10.0012, lng: 76.2842 },
          { name: "Pachalam-73", lat: 10.0072, lng: 76.2742 },

          // Central / South Ernakulam (approx 9.93 to 9.97 lat, 76.28 to 76.31 lng)
          { name: "Ernakulam South-62", lat: 9.9632, lng: 76.2882 },
          { name: "Gandhi Nagar-63", lat: 9.9712, lng: 76.2932 },
          { name: "Kathrikadavu-64", lat: 9.9752, lng: 76.2982 },
          { name: "Kaloor South-65", lat: 9.9862, lng: 76.2912 },
          { name: "Ernakulam Central II-66", lat: 9.9792, lng: 76.2812 },
          { name: "Ernakulam Central", lat: 9.9762, lng: 76.2782 },
          { name: "Girinagar-55", lat: 9.9652, lng: 76.2992 },
          { name: "Panampilli Nagar-56", lat: 9.9592, lng: 76.2952 },
          { name: "Kadavanthra-57", lat: 9.9672, lng: 76.3012 },
          { name: "Konthuruthy-58", lat: 9.9482, lng: 76.3022 },
          { name: "Thevara-59", lat: 9.9382, lng: 76.2982 },
          { name: "Perumanur-60", lat: 9.9532, lng: 76.2882 },
          { name: "Ravipuram-61", lat: 9.9592, lng: 76.2832 },
          { name: "Elamkulam-54", lat: 9.9682, lng: 76.3122 },

          // East Ernakulam / Palarivattam / Vyttila (approx 9.95 to 10.00 lat, 76.30 to 76.34 lng)
          { name: "Padivattam-41", lat: 10.0062, lng: 76.3142 },
          { name: "Vennala-42", lat: 10.0012, lng: 76.3262 },
          { name: "Palarivattam-43", lat: 9.9962, lng: 76.3112 },
          { name: "Karanakkodam-44", lat: 9.9862, lng: 76.3142 },
          { name: "Thammanam-45", lat: 9.9892, lng: 76.3212 },
          { name: "Chakkaraparambu-46", lat: 9.9812, lng: 76.3272 },
          { name: "Chalikkavattam-47", lat: 9.9832, lng: 76.3352 },
          { name: "Ponnurunni East-48", lat: 9.9752, lng: 76.3192 },
          { name: "Vyttila-49", lat: 9.9689, lng: 76.3183 }, // Default Demo Centroid
          { name: "Chambakkara-50", lat: 9.9582, lng: 76.3232 },
          { name: "Poonithura-51", lat: 9.9492, lng: 76.3282 },
          { name: "Vyttila Janatha-52", lat: 9.9612, lng: 76.3142 },
          { name: "Ponnurunni-53", lat: 9.9692, lng: 76.3092 },
          { name: "Thattazham-74", lat: 9.9432, lng: 76.3382 }
        ];

        export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
          const R = 6371; // Earth's radius in kilometers
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        }

        export function nearestWard(lat: number, lng: number): Ward {
          let minDistance = Infinity;
          let closestWard = KOCHI_WARDS[0];

          for (const ward of KOCHI_WARDS) {
            const dist = getDistance(lat, lng, ward.lat, ward.lng);
            if (dist < minDistance) {
              minDistance = dist;
              closestWard = ward;
            }
          }

          return closestWard;
        }
        ```

---

### 🤖 Phase 2: Classification API Route (`/api/classify`)

#### Action Items:
Create a Next.js App Router route at `app/api/classify/route.ts` that takes a base64-encoded image and calls OpenAI's Vision model to classify the issue.

*   **OpenAI SDK Integration**: Read the `OPENAI_API_KEY` from environment variables. Do not expose or hardcode the key anywhere.
*   **System Prompt**:
    ```
    You are a civic issue triage assistant for Kochi Municipal Corporation.
    Given a photo of a civic problem, identify:
    1. The issue type (e.g. pothole, garbage accumulation, broken streetlight, water leak, blocked drain, etc.)
    2. Severity: "low", "medium", or "high" — base this on visible safety risk, scale of the problem, and likely impact on residents. A pothole on a busy road or near a school is higher severity than a small crack. A large uncollected garbage pile is higher severity than a single item of litter.
    3. The responsible department, choosing exactly one of: "Engineering" (roads, streetlights, drains, infrastructure), "Health" (garbage, sanitation, public health hazards), "Revenue" (property-related, encroachment, other administrative issues)

    Respond only with valid JSON in this exact shape:
    { "issueType": string, "severity": "low"|"medium"|"high", "department": "Engineering"|"Health"|"Revenue" }
    ```
*   **Implementation Note**: Set standard Vision payloads using `gpt-4o`. If you parse the JSON response from OpenAI, enforce standard error boundaries in case of API failure.

---

### ✍️ Phase 3: Complaint Draft API Route (`/api/draft`)

#### Action Items:
Create a Next.js App Router route at `app/api/draft/route.ts` that drafts a formal complaint based on the classified issue context.

*   **Payload Inputs**: Accept the JSON output from `/api/classify` (issue type, severity, department) along with any parsed location text.
*   **System Prompt**:
    ```
    You are drafting a formal civic complaint for submission to Kochi Municipal Corporation's MyKochi portal. Given the issue type, severity, and department, write:
    1. A short subject line (under 10 words)
    2. A formal complaint description in English (2-3 sentences, clear and direct, stating the issue, location context, and requesting action)
    3. The same complaint translated into formal, natural Malayalam — not a literal word-for-word translation, but how a Malayalam-speaking resident would actually phrase a formal complaint to the corporation. Use respectful, standard formal register, not colloquial spoken Malayalam.

    Respond only with valid JSON in this exact shape:
    { "subject": string, "descriptionEnglish": string, "descriptionMalayalam": string }
    ```
*   **Implementation Note**: Set the response header to `application/json` and parse the output JSON from OpenAI cleanly.

---

### 🛰️ Phase 4: Geolocation Engine & Demo Fallbacks

#### Action Items:
Implement a client-side geolocation module on the front-end that handles edge cases robustly (e.g. offline use, train wifi, denied permissions).

1.  **Live Geolocation**:
    *   Call `navigator.geolocation.getCurrentPosition` upon image upload.
    *   Implement a `timeout` of 3000ms. If it exceeds this threshold or fails, fall back to the Vyttila coordinate (`9.9689, 76.3183`).
2.  **EXIF Fallback**:
    *   Use the `exifr` package to attempt reading coordinate metadata from uploaded files (optional EXIF fallback).
3.  **Static Cached Demo Mode**:
    *   Add a visual button labeled **"Run Cached Demo"** or trigger it via url query string (`?demo=true`).
    *   If active, mock the entire API response process locally without hitting `/api/classify` or `/api/draft`.
    *   *Cached Output Example*:
        *   `issueType`: "Broken Streetlight"
        *   `severity`: "medium"
        *   `department`: "Engineering"
        *   `ward`: "Kaloor South-65"
        *   `subject`: "Malfunctioning streetlights on Kaloor-Kadavanthra road"
        *   `descriptionEnglish`: "The streetlights along Kaloor-Kadavanthra road have been out of service for the past three nights, making the stretch dark and unsafe for drivers. Please repair them immediately."
        *   `descriptionMalayalam`: "കലൂർ-കടവന്ത്ര റോഡിലെ തെരുവ് വിളക്കുകൾ കഴിഞ്ഞ മൂന്ന് ദിവസമായി പ്രകാശിക്കുന്നില്ല. ഇത് രാത്രി യാത്രക്കാർക്ക് വലിയ ബുദ്ധിമുട്ടും സുരക്ഷാ ഭീശനിയും ഉണ്ടാക്കുന്നുണ്ട്. ഈ പ്രശ്നം അടിയന്തരമായി പരിഹരിക്കാൻ നടപടി ഉണ്ടാകണമെന്ന് അഭ്യർത്ഥിക്കുന്നു."

---

### 📱 Phase 5: High-Fidelity UI Interface & Verification Flow

#### Action Items:
Re-design `app/page.tsx` into a single-page flow with three visual layouts, incorporating a premium glassmorphic dark interface.

1.  **Capture Screen**:
    *   A drop-zone overlay with glowing neon dashed borders.
    *   File upload input (`accept="image/*"`).
    *   A primary gradient-button: **"Analyze Issue"** (disabled if no image is selected).
    *   A secondary neon-outlined button: **"Run Cached Demo"** (triggers instantaneous mockup validation).
2.  **Loading Screen**:
    *   An elegant overlay card containing a spinning circular loader and step-by-step progress prompts:
        *   *Reading image metadata & location details...*
        *   *Analyzing issue and triaging department via AI...*
        *   *Drafting formal English & Malayalam complaints...*
3.  **Result Screen**:
    *   **Triaged Info Panel**: Display details with custom badges:
        *   *Severity*: "low" (Green), "medium" (Orange), "high" (Red)
        *   *Department*: Label displaying "Engineering", "Health", or "Revenue"
    *   **Location Ward Section**:
        *   Show a dropdown list of all 74 Kochi Wards.
        *   Pre-select the calculated nearest ward based on coordinates, but allow the user to change it via selection.
    *   **Editable Complaint Draft Areas**:
        *   Subject (Text Input)
        *   English Complaint Detail (Text Area)
        *   Malayalam Complaint Detail (Text Area)
    *   **Bilingual Verification Alert**:
        *   A box at the bottom indicating validation status. All five fields (department, ward, subject, and descriptions in both languages) must be checked. If any is empty, show a warning. Otherwise, show a "Complaint Verified & Ready" green badge.
    *   **Actions Drawer**:
        *   **"Open in MyKochi"**: Opens `https://mykochi.lsgkerala.gov.in/index/complaint` in a new tab. Make it a prominent green button.
        *   **"Start Over"**: Triggers client-side state reset.
