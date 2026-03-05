# 🚀 Mockup Studio Pro: Feature & Roadmap Planning (V2.0+)

This document outlines the strategic roadmap for enhancing **Mockup Studio Pro**, categorized by implementation complexity. These features are designed to improve UX, expand creative possibilities, and ensure top-tier professional output.

---

## 🟢 Level 1: Core Enhancements (Small/Quick Wins)
*Focus: Improving existing workflows and minor UI polish.*

- [ ] **Drag & Drop Reordering:** Allow users to swap image positions between Desktop/Mobile/Tablet slots directly on the sidebar.
- [ ] **Preset Aspect Ratios:** Add standard export sizes for social media (X Header, LinkedIn Post, Instagram Story).
- [ ] **Quick Theme Toggle:** A single button to switch all device frames between "Dark Mode" (Space Gray) and "Light Mode" (Silver/White) simultaneously.
- [ ] **Copy to Clipboard (Base64):** Add an option to copy the image data as a Base64 string for quick embedding in documentation.
- [ ] **File Name Customization:** Allow users to set a custom prefix for exported files instead of the default `mockup-`.

---

## 🟡 Level 2: Creative Extensions (Medium Complexity)
*Focus: Adding more visual depth and user flexibility.*

- [ ] **Custom Watermarks:** Allow users to upload their own PNG logo as a watermark instead of just text.
- [ ] **Advanced Gradient Builder:** Instead of 12 presets, provide a 2-point gradient picker (Linear/Radial) with angle control.
- [ ] **Text Overlay System:** Add a simple "Heading" and "Sub-heading" layer on the stage for creating quick landing page hero graphics.
- [ ] **Device Shadows (Advanced):** Add controls for shadow blur, spread, and color (to create 'glow' effects).
- [ ] **Multi-Tab Session Memory:** Use `localStorage` to save the user's current settings (layout, colors, text) so they don't lose progress on refresh.

---

## 🔴 Level 3: Advanced Innovation (High Complexity)
*Focus: Competitive features that push the tool into professional design territory.*

- [ ] **3D Perspective Warping:** Implement a feature to "skew" or "warp" the device frames for an isometric/3D perspective look.
- [ ] **Video/GIF Mockups:** Support for `.mp4` or `.gif` uploads with a specialized renderer (requires a transition to canvas-based video processing).
- [ ] **Batch Processing:** Upload a folder of screenshots and auto-generate mockups for all of them using the current preset.
- [ ] **SVG Export:** Experimental support for exporting the layout as an SVG (vector) file for infinite scalability.

---

## 📱 Responsive Code Strategy & UX
*Goal: Ensure the studio itself is as responsive as the mockups it creates.*

### 🛠️ Technical Implementation:
1. **Dynamic Stage Scaling:** 
   - Use a CSS `container-type: inline-size` approach for the stage area.
   - Implement a "Mobile Editor" view where the sidebar becomes a bottom-sheet (Swipe up to customize).
2. **Viewport-Aware Layouts:** 
   - Automatically adjust the 'Phone Scale' based on the device width.
   - Use `vh` and `vw` units more aggressively in the layout logic to prevent stage clipping on smaller monitors.
3. **Touch Interaction Support:** 
   - Optimize all range sliders and toggles for touch targets (minimum 44x44px).
   - Add pinch-to-zoom support for the stage area on mobile/tablet devices.

---

## 📝 Planned Tech Stack Updates
- **State Management:** Move from a flat object to a structured `Proxy`-based state for automatic UI reactivity.
- **Rendering:** Evaluate `dom-to-image-more` as a secondary high-speed alternative to `html2canvas` for ultra-res exports.

---
*Drafted by Abhay (AI Assistant) using Kimi-K2.5 Reasoning.*
