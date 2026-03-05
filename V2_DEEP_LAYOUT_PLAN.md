# 🚀 Mockup Studio Pro: Phase 2 - Advanced Layouts & Image Precision

## 1. The Layout Gallery Expansion (Modern & Professional)

### 🎨 1.1 Category: Bento & Grid (Marketing Standard)
*   **Bento-3 (Large Browser + 2 Mobile):** Main browser centered-left, with two mobile phones stacked vertically on the right.
*   **Bento-4 (The Feature Matrix):** Four cards in a 2x2 grid, each showing a different perspective of the same image (auto-zoomed to different quadrants).

### 🎨 1.2 Category: Professional Perspective (High-End)
*   **The Overlap Duo:** Browser slightly tilted with a Phone overlapping the bottom-right corner, sharing a deep cohesive shadow.
*   **The Triple Stack:** Three devices (Browser, Tablet, Phone) stacked with decreasing Z-depth, creating a 3D "layered" effect.

### 🎨 1.3 Category: Minimalist & Clean
*   **The Centered Solo (Minimal):** No browser bar, no address bar—just the raw image within a high-end device frame and a soft glow.
*   **The Scrolling Showcase:** A very tall browser frame that implies a full-length landing page, with a "fade-to-transparent" bottom.

---

## 2. Real-Time Image Precision (Interactive Control)

### 🖱️ 2.1 Feature: Direct Drag-to-Pan
*   **Mechanism:** Users can click and hold on any image within a frame to "pan" it.
*   **Implementation:** Track `mouseDown` inside the frame. Update CSS `object-position` or `transform: translate()` based on `mouseMove` delta.
*   **Precision:** No more "automatic" bad crops. The user decides exactly what the "hero" of the shot is.

### 🔍 2.2 Feature: Device-Level Zoom
*   **Mechanism:** Each device slot gets its own "Content Zoom" slider.
*   **Utility:** Zoom into a specific UI element (e.g., a chart or a button) within the screenshot without losing the overall mockup context.

---

## 3. The "Small Details" Audit (Professional Polish)

*   **Corner Roundness Sync:** Automatically match the screenshot's `border-radius` to the device frame's bezel for a native look.
*   **Aspect Ratio Preservation:** Logic to ensure that even if an image is small, it doesn't look stretched or pixelated.
*   **Smart Background Colors:** A "Color Picker from Image" feature—detect the dominant color from the uploaded screenshot and suggest a matching background gradient.

---

## 4. Technical Strategy (Model Choice: Kimi-K2.5 / MiniMax)

1.  **State Management:** Expand the `Proxy` state to include `slots[desktop|mobile|tablet].pos` and `slots.zoom`.
2.  **CSS Engine:** Use `object-position: X% Y%` for the panning—it’s the most performant way to move images within containers and is fully supported by `html2canvas`.
3.  **Interaction Logic:** Implement a robust event listener system that distinguishes between "dragging the image" and "dragging the stage."

---
*Drafted by Abhay (AI Assistant) using Kimi-K2.5 Deep Reasoning & MiniMax Context Analysis.*
