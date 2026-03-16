# Design System: EPISTOLARIO- LEGAJO
**Project ID:** 18111140058027548168
**Screen ID:** a839986bf54b4470b4d296166b018205
**Screen Title:** Vista de Legajo - Refinamiento Métricas y Nav C
**Stitch Label:** READY

## 1. Visual Theme & Atmosphere
This screen defines the legajo view as an editorial archive spread rather than a utilitarian listing page. The mood is museum-like, documentary, and expansive: a dark institutional frame, warm ivory grounds, serif-led headings, and ochre accents that guide attention without becoming decorative.

The screen is composed in clear narrative bands:
- a dark institutional header
- a broad editorial hero with metrics and a primary visual
- a centered navigation tab strip
- the archive workspace itself: filters, list, preview
- lower modules reserved for narrative and interpretive expansion

For our app, this should be interpreted as the design language for the **legajo view and its archive workspace**, not as a mandate to restyle the entire platform at once. Its value is in how it turns a legajo into a curated documentary space with a strong list/preview rhythm.

## 2. Color Palette & Roles
- **Archive Charcoal (#1A1A1A)**  
  Used for the top institutional bar and dark framing surfaces. This is the strongest authority color in the system.

- **Archive Ivory (#F9F7F2)**  
  The primary page ground. It replaces stark white with a warmer archival paper tone.

- **Archive Stone (#E5E1D8)**  
  Used for borders, fine dividers, low-contrast rails, and gentle structural separation.

- **Archive Ochre (#B48E4B)**  
  The principal accent color. Used for active tabs, metric labels, section cues, and key emphasis states. It should remain sparse and intentional.

- **Archive Ink (#2D2D2D)**  
  Primary text tone on light surfaces. Deep and scholarly without using pure black.

- **Soft White (#FFFFFF)**  
  Used for list cards, preview panels, and high-contrast surfaces that sit on the ivory ground.

- **Neutral Zinc Support (#27272A to #3F3F46 family)**  
  Used inside darker modules such as the institutional search field and future narrative bands.

## 3. Typography Rules
- **Display Serif:** Georgia  
  Used for the legajo hero title, list item titles, preview titles, and major editorial headings. The serif gives documentary gravitas and historical character.

- **Interface Sans:** Inter  
  Used for navigation, labels, filters, metadata, search, buttons, and supporting copy. This keeps the screen contemporary and highly legible.

- **Hierarchy pattern:**  
  Serif for editorial authority and document naming. Sans for system scaffolding and archive controls.

- **Letter spacing:**  
  Small uppercase labels use wide tracking to feel classificatory and archival. Tabs and filter labels especially lean on this pattern.

- **Metric treatment:**  
  Numeric or summary values often use serif with stronger visual weight, while their labels remain uppercase sans in ochre.

## 4. Component Stylings
### Global Header
- A flat dark institutional bar with compact navigation and search.
- It should feel like archive infrastructure, not consumer app chrome.

### Hero / Editorial Spread
- The hero uses generous horizontal space with a two-column editorial spread:
  - contextual thesis and metrics on the left
  - primary archival image on the right
- The image is framed like an object plate, with subtle shadow and an inner border overlay.

### Navigation Tabs
- Tabs are centered, uppercase, and heavily tracked.
- The active tab is marked by a strong dark underline, not by filled pills or oversized buttons.
- This should read as scholarly sectioning rather than app navigation.

### Filters
- Filters live in a quiet left rail.
- Groups are divided by spacing and small ochre uppercase labels.
- Controls are simple checkboxes and should remain visually recessive.

### Letter List
- The list should feel like a stack of document slips.
- Active state uses a pale warm highlight with an ochre edge cue.
- Inactive rows stay on white with subtle border treatment.

### Preview Panel
- The preview is a clean white documentary panel with soft border treatment.
- The manuscript sits inside a quieter framed block than in the letter reader, because here it supports exploration rather than being the sole protagonist.

### Lower Narrative Modules
- Dark background modules can exist below the archive workspace to signal future interpretive layers.
- These should feel adjacent to the archive, not mixed into the core documentary workspace.

## 5. Layout Principles
- The legajo page is a staged editorial sequence rather than one continuous undifferentiated page.
- The hero is full-width within a centered max container and establishes context before interaction begins.
- The archive workspace is a three-part composition:
  - left rail for filtering
  - central list for document selection
  - right preview for visual/textual inspection
- The preview should remain sticky on desktop, reinforcing the list/preview rhythm.
- The layout is dense but controlled, with long vertical continuity and clear sectional borders.

## 6. Depth & Elevation
- Depth is subtle and mostly driven by border contrast and isolated object shadows.
- The hero visual receives the strongest shadow treatment.
- Cards and preview surfaces use restrained elevation; they should feel archival and composed, not dashboard-like.

## 7. Interaction Language
- Interaction cues are understated and mostly color- and border-based.
- Ochre is used to signal the active state or archive emphasis.
- Hover states should remain quiet and documentary.

## 8. Integration Guidance For Our App
This screen should be integrated **incrementally** into the current legajo view, not used to replace the whole application shell in one pass.

### Keep from our existing app
- current routing and page structure
- current `CorpusBase` loaders
- current list/filter logic
- current fallback behavior when a legajo has no `ImageEnhanced`

### Apply from this Stitch screen
- the editorial hero composition for the legajo
- the centered scholarly tab strip
- the calmer left rail / list / preview workspace
- the stronger metric framing
- the distinction between archive workspace and lower narrative territory

### Do not apply globally yet
- full global header redesign across the whole site
- final narrative modules for recorridos/relatos
- any assumption that all legajos have local visual assets
- any map/timeline/relational visualization treatment

### Expected component mapping
- current legajo page shell -> editorial hero + tab framing
- current explorer workspace -> filter rail + letter list + preview composition
- current preview panel -> richer archive preview container
- lower placeholders -> future narrative module wrappers

## 9. Implementation Constraints For Component Generation
- Generate components into a parallel safe area first.
- Keep naming traceable to this Stitch source.
- Prefer extracting reusable legajo-only sections rather than generating a full app replacement.
- Treat `ImageEnhanced` as optional. The archive view must remain compelling in text-first mode.

## 10. Prompting Notes For Future Stitch Work
When extending this design, describe it as:

"An editorial archive interface for a digital historical epistolary. Dark institutional framing, warm ivory paper grounds, serif-led legajo hierarchy, ochre archival accents, centered scholarly tabs, and a dense but controlled list-and-preview workspace. The page should feel like a curated finding aid with a premium museum sensibility, and it must still work when manuscript imagery is limited or absent."
