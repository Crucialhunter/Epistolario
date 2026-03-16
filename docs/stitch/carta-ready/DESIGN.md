# Design System: EPISTOLARIO - CARTA
**Project ID:** 14451550773222330795
**Screen ID:** 449fd281a02640b388fc6fbe51ed61b6
**Screen Title:** Lector de Carta - Estructura Refinada V3
**Stitch Label:** READY

## 1. Visual Theme & Atmosphere
This screen defines a sober, museum-like document reader with a warm archival atmosphere rather than a modern app-shell feel. The overall mood is scholarly, tactile, and composed: dark archive framing around pale parchment reading surfaces, restrained gold accents, and a strong sense of curated documentary authority.

The screen is dense in content, but it avoids feeling cramped by separating the experience into clear editorial bands:
- a dark institutional header
- a centered title and summary block
- a documentary metadata band
- the main split reader
- a lower research layer with secondary context

For our app, this should be interpreted as an overlay design language for the **letter reader only**, not as a mandate to restyle the whole platform. The value of this screen is in how it composes manuscript, transcription, metadata, and research context into one coherent scholarly surface.

## 2. Color Palette & Roles
- **Archive Charcoal (#1A1A18)**  
  Used for the main header and dark institutional framing. This is the strongest authority color in the system.

- **Dark Wood Brown (#2A241E)**  
  Used for the manuscript frame and darker support surfaces. It gives the viewer a crafted, object-like presence.

- **Parchment Base (#F5F2E8)**  
  The primary reading surface. This replaces stark white with a warmer archival paper tone.

- **Parchment Warm Gold (#F1E9D0)**  
  Used in the transcription panel and warm reading gradients. It suggests aged paper without becoming decorative.

- **Parchment Cool (#EDE9DE)**  
  Secondary neutral paper tone for subtle surface variation.

- **Parchment Border (#D1CEBD)**  
  Used for fine rules, dividers, metadata separators, and low-contrast structure.

- **Archive Accent Gold (#C5A059)**  
  Used for active controls, emphasis states, section lines, chips, and selected toggle states. This is the key highlight color and should stay sparse.

- **Archive Text Ink (#2C2C2A)**  
  Main text color on paper surfaces. Deep but not pure black.

- **Canvas Ground (#E2DDD0)**  
  Outer page background outside the main canvas. Helps the central reader feel object-like.

## 3. Typography Rules
- **Display Serif:** Libre Baskerville  
  Used for the main document title, major reader headings, and quotation-like moments. The serif introduces historical gravity and editorial character.

- **Interface Sans:** Inter  
  Used for navigation, labels, metadata lines, controls, chips, and supporting copy. This keeps the system contemporary and legible.

- **Hierarchy pattern:**  
  Serif for meaning and documentary prominence. Sans for navigation and system scaffolding.

- **Letter spacing:**  
  Small uppercase labels use strong tracking to feel archival and classificatory. Body text remains calm and readable.

- **Body rhythm:**  
  The transcription uses generous leading and slightly enlarged serif text. This is not a dense diplomatic edition layout; it is a premium reading view optimized for legibility.

## 4. Component Stylings
### Buttons and Controls
- Reader controls are compact, icon-led, and quietly framed.
- The active mode toggle uses a **pill-shaped gold fill** against a neutral soft surround.
- Control chrome should feel precise and archival, not playful.

### Cards and Containers
- Main surfaces use **subtly rounded corners**, typically modest rather than soft consumer-style rounding.
- The central canvas uses a strong outer shadow, while internal panels rely on lighter, quieter elevation.
- Metadata and research blocks use light borders and paper-toned fills rather than obvious card styling.

### Manuscript Surface
- The manuscript sits inside a **dark wood-like frame** with deep inset shadowing.
- The image itself is slightly treated with sepia and contrast adjustments to reinforce an archival object feel.
- This treatment should only appear when `ImageEnhanced` exists in our app. It must degrade gracefully to textual mode.

### Tags and Chips
- Chips are rectangular-to-pill micro-labels with muted paper fills and fine borders.
- They feel catalog-like, not dashboard-like.

### Metadata Rows
- Metadata is organized in structured lines with soft separators.
- Labels are small uppercase sans text; values are darker and bolder.
- This is closer to a finding-aid or cabinet card than to an admin table.

## 5. Layout Principles
- The page is built around a **central maximum-width canvas** placed on a slightly darker outer ground.
- Information is staged in clear horizontal bands before the main reader begins.
- The core reading experience is a **two-column split**:
  - manuscript left
  - transcription right
- The lower research layer is a **three-column scholarly appendix**:
  - documentary context
  - people and places plus quote
  - related documents

Spacing is generous but not airy-minimal. The visual goal is controlled abundance: a serious archival interface with strong order.

## 6. Depth & Elevation
- The outer canvas uses a **noticeable museum-board shadow** to feel like a curated object on a table.
- Internal surfaces rely on **whisper-soft shadows** and border lines.
- The manuscript frame is the deepest object on the page and should remain the visual anchor when present.

## 7. Interaction Language
- Hover states are restrained and mostly color-based.
- Accent gold signals active or selected states.
- Visual emphasis should come from hierarchy and material contrast, not animation.

## 8. Integration Guidance For Our App
This screen should be integrated **incrementally** into the current letter reader, not used to replace the whole application shell.

### Keep from our existing app
- current routing
- current data loaders
- current reader logic for `CorpusBase`
- current fallback behavior when no `ImageEnhanced` exists

### Apply from this Stitch screen
- the archival palette for the reader surface
- the split manuscript / transcription composition
- the tighter metadata hierarchy
- the lower documentary context layout
- the distinction between institutional chrome and reading surfaces

### Do not apply globally yet
- full top navigation redesign
- footer redesign across the whole site
- global search/header assumptions
- any dependence on visual manuscript availability

### Expected component mapping
- current reader page shell -> high-level page composition only
- manuscript area -> enhanced `ManuscriptViewer` wrapper
- transcription panel -> new reader article surface
- metadata section -> compact reader documentary card
- lower context blocks -> reusable secondary reader modules

## 9. Implementation Constraints For Component Generation
- Generate components into a parallel safe area first.
- Keep naming traceable to this Stitch source.
- Prefer extracting reusable reader-only sections rather than generating a monolithic page replacement.
- Treat `ImageEnhanced` as optional. The design must still read well with text-only letters.

## 10. Prompting Notes For Future Stitch Work
When extending this design, describe it as:

“A sober archival editorial interface for a digital historical epistolary. Dark institutional framing, warm parchment reading surfaces, serif-led document hierarchy, restrained gold accents, museum-grade manuscript presentation, and a scholarly lower context layer. The manuscript remains the protagonist when available, but the layout must still work elegantly in text-only mode.”
