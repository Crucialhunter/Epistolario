# Header System: Stitch Variants

## Purpose
This document defines a shared header system for the Stitch comparison variants of the letter reader and the legajo view. It is intentionally scoped to:
- institutional top bar
- top navigation
- high-level screen context
- responsive behavior for that zone only

It does **not** attempt to unify metadata bands, tabs, document cards, reader bodies, or internal archive layouts yet.

## 1. Shared Ground
Both Stitch design documents already agree on several fundamentals:
- a dark institutional frame should sit above the document surfaces
- archival gold should signal emphasis, not dominate the composition
- typography should combine a serif marker of authority with a sans interface layer
- the header should feel like archive infrastructure, not generic SaaS chrome
- the top zone should clearly separate platform identity from document-specific content

## 2. Relevant Differences
### What the letter design does better
- stronger contrast and greater authority in the header band
- richer visual framing through darker support tones
- a more premium, composed feeling overall
- clearer separation between institutional chrome and reading surface

### What the legajo design does better
- clearer structural navigation language
- better sense of archive-level information architecture
- more explicit relationship between the top bar and section-level navigation
- more straightforward responsive adaptation of navigation items

### Main contradiction
- the letter header is visually stronger but less structurally informative
- the legajo header is structurally clearer but more utilitarian and visually flatter

## 3. Unification Decision
The shared system should lean slightly toward the **letter** design for:
- contrast
- depth
- elegance
- controlled richness

It should borrow from the **legajo** design for:
- navigation clarity
- active-state logic
- section context labeling
- responsive stacking behavior

## 4. Header Architecture
The shared system uses two layers.

### Layer A: Institutional Bar
Purpose:
- brand and archive identity
- top-level navigation
- variant/system badge

Characteristics:
- deep charcoal to dark wood gradient
- pale parchment text with muted secondary navigation
- gold accent reserved for active or highlighted items
- compact height, but with enough presence to feel architectural

### Layer B: Context Bar
Purpose:
- explain which screen the user is inside
- keep screen-specific context separate from the main navigation
- provide lightweight status and comparison framing

Characteristics:
- slightly lighter dark support surface
- subtle lower border in parchment-stone
- uppercase micro-label for section type
- serif heading or compact title when needed
- room for a small variant badge or supporting note

## 5. Color System For Header
- **Institutional Charcoal:** `#1A1A18`
  Primary top bar ground, taken mainly from the letter design.

- **Dark Wood Support:** `#2A241E`
  Secondary dark tone for gradient depth and contextual support, taken from the letter design.

- **Parchment Text:** `#F1E9D0`
  Primary light text on dark header surfaces.

- **Muted Parchment:** `#D4CAB7`
  Secondary navigation text and passive interface copy.

- **Archive Accent Gold:** `#C5A059`
  Active state, emphasis, current screen marker.

- **Archive Stone Divider:** `#D1CEBD`
  Fine divider lines and low-contrast framing.

## 6. Typography And Hierarchy
- **Brand / identity:** serif, medium-bold, compact tracking
- **Primary navigation:** sans, uppercase, tracked, medium weight
- **Context eyebrow:** sans, uppercase, tracked, gold
- **Context title:** serif for more important context, sans if purely utilitarian
- **Support labels / badges:** sans, uppercase, small size

The typographic hierarchy comes more from the **letter** design in tone, and more from the **legajo** design in navigation logic.

## 7. Navigation Rules
- top navigation remains short and institutional
- active item uses gold text and/or a subtle underline cue
- inactive items stay muted parchment
- hover should brighten text and tighten contrast, not animate aggressively
- focus must be clearly visible with a gold-tinted outline

Recommended primary set for the comparison variants:
- Archivo
- Legajos
- Recorridos
- Relatos
- Sobre el proyecto

This is closer to the letter design’s richer header presence, but disciplined by the legajo design’s clearer active-state behavior.

## 8. Responsive Behavior
### Mobile
- brand stays on the first row
- variant badge stays visible but compact
- navigation wraps below rather than compressing into unreadable text
- context row stacks into a simple two-line block
- preserve contrast and hierarchy instead of trying to mimic desktop density

### Desktop
- brand, nav, and badge can live on one row
- context bar may use left/right distribution
- keep generous horizontal padding so the bar feels editorial, not cramped

## 9. Relationship Between Institutional Header And Screen Context
- the institutional bar belongs to the archive platform
- the context bar belongs to the current screen variant
- page-specific tabs remain outside this system for now
- metadata, preview controls, and reader controls remain outside this system for now

This keeps the header reusable across carta and legajo without prematurely forcing the rest of the layouts into one pattern.

## 10. Source Balance
### Mostly from carta
- darker and richer contrast model
- gold accent behavior
- stronger sense of authority
- more premium presence

### Mostly from legajo
- navigation structure
- contextual framing logic
- more explicit section-level clarity
- easier responsive organization

## 11. Implementation Scope
Apply this shared header only to:
- the Stitch carta variant
- the Stitch legajo variant

Do not apply yet to:
- main production routes
- page-internal tabs
- metadata bands
- cards
- preview surfaces
- section layouts
