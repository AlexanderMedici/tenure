# TENURE Quiet Luxury Design System

## Color tokens
- Backgrounds: `--bg-sand`, `--bg-stone`, `--bg-paper`
- Text: `--text-charcoal`, `--text-muted`
- Lines: `--line-soft`, `--line-strong`
- Accent: `--accent-gold`, `--accent-gold-dark`
- Surfaces: `--surface-1`, `--surface-2`, `--surface-3`

## Typography pairing recommendations
- Primary sans: Space Grotesk (clean, architectural)
- Accent serif: Spectral (editorial, refined)
- Usage:
  - Headings in serif, body in sans
  - Uppercase microcopy with wide tracking for labels

## Spacing + layout rules
- Desktop grid: 12 columns, 24px gutters, max content width 1200–1280px
- Mobile: single column, 16–20px side padding, sections stack with 24–40px vertical rhythm
- Vertical rhythm: 8pt system; primary steps 16 / 24 / 32 / 48 / 64 / 80
- White space is a feature: avoid dense blocks, prefer breathing room

## Component styling guidance
- Cards: soft shadow, large radius, paper surface, thin border (`.tenure-card`)
- Tabs: subtle underline with gold on active, quiet text (`.tenure-tab`)
- Table/list rows: light divider, generous padding (`.tenure-row`)
- Status pills: muted stone fill, uppercase tracking (`.tenure-pill`)
- Buttons: charcoal primary, outlined secondary, uppercase labels (`.tenure-btn`)
- Inputs: clean borders, gold focus ring (`.tenure-input`)
- Empty states: dashed border, centered tone, minimal iconography (`.tenure-empty`)

## Notes
- No gradients, no bright colors
- Prefer matte surfaces, soft borders, restrained highlight
