# Codex Build Prompt for **MyKochi** Portal landing Page

This document contains a structured, high-fidelity prompt for Codex (or any advanced LLM model) to build a stunning, premium landing page called **MyKochi** inspired by your design reference photo.

---

# MASTER PROMPT: MYKOCHI PORTAL LANDING PAGE

Build a complete Next.js 14 (App Router, TypeScript) landing page for **MyKochi** — a modern, citizen-centric portal for Kochi Municipal Corporation. The page must adopt the high-fidelity, minimal, and premium aesthetic of the design reference image (warm cream canvas, clean serif headlines, floating status chips, and a docked analytic control panel).

## 🎨 Design Reference Specifications (Visual Style)
*   **Background Canvas**: Off-white/warm cream (`#fafaf6` or HSL `50, 20%, 98%`).
*   **Typography**:
    *   Main Headlines: Elegant serif font (e.g. `Georgia`, `Playfair Display`, or custom serif utility) with large sizes, fine weight tracking, and a deep charcoal color (`#111111`).
    *   Body text & labels: Sophisticated, clean sans-serif (e.g., `Inter` or standard system sans-serif) in muted dark-gray (`#4a4a4a`).
*   **Interactive Accent Elements (Floating Chips)**:
    *   Design small, pill-shaped status widgets that hover around the central content area, each featuring a distinct icon, soft background tint, and subtle border:
        *   **Roads & Lights** (Teal/Emerald tint: `bg-[#e6f4ea] text-[#137333] border border-[#ceead6]`)
        *   **Sanitation & Health** (Rose/Pink tint: `bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]`)
        *   **Revenue & Taxes** (Amber/Yellow tint: `bg-[#fef7e0] text-[#b06000] border border-[#feebc8]`)
        *   **Water & Leakage** (Lavender/Blue tint: `bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]`)
*   **Primary CTA Button**: Sharp, high-contrast, pill or block container (`bg-[#111111] hover:bg-[#222222] text-white text-sm font-semibold px-6 py-3 rounded-md transition-all flex items-center gap-2`).

---

## 🛠️ Landing Page Core Layout Structure

### 1. Header (Navbar)
*   Minimalist design with a bold, clean "MyKochi" branding mark (dark icon + label).
*   Right-aligned navigation links: *Complaints*, *Wards Lookup*, *Analytics*, *Contact*.

### 2. Main Hero Section
*   **Headline**: Large, centered serif headline: 
    *   *"The first civic intelligence platform that actually resolves your local issues."*
*   **Description**: Centered, balanced body paragraph:
    *   *"MyKochi integrates citizens with Kochi Municipal Corporation departments — enabling rapid complaint routing, real-time ward tracking, and transparent triage resolution."*
*   **CTA Action Bar**: A bold button labeled **"Report an Issue"** paired with a secondary text button **"Track Complaint status"**.
*   **Decorations**: 4 to 6 floating, animated status pill chips (representing departments, status updates, or solved issues) drifting smoothly around the hero content layout.

### 3. Docked Dashboard Panel (Bottom Footer/Dock)
*   At the bottom, place a floating glassmorphic dashboard container simulating live platform analytics:
    *   **Total Reports Filed**: `1,482`
    *   **Resolution Rate**: `94.2%`
    *   **Average Triage Time**: `2.4 Hours`
    *   **Active Departments**: `Engineering | Health | Revenue`
*   Incorporate tab options resembling the navigation dock: *Dashboard*, *Elements*, *Wards*, *Visit Portal*.

---

## 🚀 Technical Requirements (Next.js & Tailwind CSS)
*   Create a single page under `app/page.tsx` (using Next.js 14 client components).
*   Utilize standard Tailwind CSS utility classes.
*   Ensure full responsiveness (adapting clean flex grids for mobile layouts).
*   Add light CSS floating keyframes for the interactive status chips to give the landing page a premium, alive feel.
