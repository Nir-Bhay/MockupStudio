# 🎨 Mockup Studio Pro: V2.0 Layout Expansion & Image Control Planning

## 1. Core Vision: Modern SaaS Aesthetic
The goal is to move from 4 basic presets to a **Professional Layout Gallery** that mimics high-end SaaS marketing (like Arc, Raycast, or Framer). Every layout must feel "premium" and "editorial" by default.

---

## 2. New Modern Layout Gallery (Target: 12+ Presets)

### 🟢 Category A: The "Bento" & Modular (2026 Trend)
*   **The Bento Grid:** A sophisticated multi-card layout with 1 large browser and 2-3 small mobile/tablet cards tucked into corners.
*   **The Feature Highlight:** A large centered browser with "floating" UI elements (small cropped snippets of the same image) to highlight specific features.
*   **The Diagonal Flow:** Devices arranged in a descending diagonal line (Tablet Top-Left -> Browser Center -> Phone Bottom-Right).

### 🔵 Category B: Perspective & Depth (The "Pro" Look)
*   **The Isometric Stack:** 3 Browsers stacked vertically with 3D rotation, creating a "software evolution" or "version history" look.
*   **The Floating Duo:** A Browser and a Phone floating at different Z-depths with overlapping shadows.
*   **The Mirror Reflection:** A single centered device with a long, fading vertical reflection below it.

### 🔴 Category C: Dynamic & Scrolling
*   **The Infinite Scroll:** A very tall browser frame that shows a long-form landing page, partially cut off to imply "scrollability."
*   **The Side-by-Side Comparison:** Two identical browser frames for "Before/After" or "Light/Dark" mode showcases.

---

## 3. Advanced Image Control: "Real-Time Precision"

### 🛠️ Problem: Automatic Cropping Sucks
Currently, images are centered and cropped (`object-fit: cover`). This often cuts off important UI elements like navigation or call-to-action buttons.

### 🚀 Solution: Interactive Image Manipulation
1.  **Direct Drag-to-Pan:** Users can click and drag the image *inside* the device frame to adjust the focal point in real-time.
2.  **Manual Scaling (Zoom-in-Device):** A slider for each device to zoom in on a specific part of the screenshot (e.g., zoom 150% and pan to the header).
3.  **Visual Crop Indicators:** When dragging, show a dimmed version of the "overflow" image so users know exactly what's being cut off.
4.  **One-Click "Smart Fit":** 
    *   *Fit Width:* Ensures the full width of the screenshot is visible.
    *   *Fit Height:* Ensures the full height is visible (great for long landing pages).

---

## 4. Small Details, Big Impact (User-Centric)

*   **Corner Roundness Sync:** Option to sync the roundness of the screenshot *inside* the device to the device frame itself.
*   **Browser URL History:** A dropdown of common SaaS-looking URLs (e.g., `app.yourproject.com`, `docs.io`).
*   **Frame "Bezel" Control:** Change the thickness of the device bezels to match different hardware styles (iPhone 16 vs Minimalist).

---

## 5. Technical Implementation Strategy (Using Kimi-K2.5/MiniMax)

### 🧱 Phase 1: State Expansion
Update the `Proxy` state to include `imagePos` (X/Y coordinates) and `imageScale` for each device slot.

### 🎨 Phase 2: CSS Transformation Engine
Use `object-position` and `transform: scale()` on the `<img>` tags inside the frames. This is performance-light and works perfectly with `html2canvas`.

### 🖱️ Phase 3: Interaction Layer
Implement `mousedown`, `mousemove`, and `mouseup` listeners on the device frames to enable the "Drag-to-Pan" feature.

---
*Planning drafted by Abhay (AI Assistant) using Kimi-K2.5 Deep Reasoning.*
*Reference: 2026 SaaS Design Trends & User Feedback Patterns.*
