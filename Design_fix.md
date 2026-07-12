# TransitOps — Design System Unification Prompt (for Kiro IDE)

Paste this into Kiro as your instruction set. It fixes the light/dark theme clash identified in the design audit by unifying the entire app under one consistent, professional Dark Theme, replacing the gold/amber brand accent with a restrained indigo, and standardizing typography, spacing, radius, and shadows across every file.

**Decision made:** Unify under Dark Theme (not Light), because the CRUD pages (Vehicle Registry, Driver Management, Trip Management, Maintenance, Fuel/Expense, Analytics) are already fully built dark — converting the shell (Sidebar, Header, Dashboard, Login) to match is far less rework than converting everything else to light. If you'd rather unify under Light Theme instead, say so and I'll flip this prompt.

---

## STEP 0 — New Design Tokens (add to `index.css` at the top, inside `:root`)

Replace any existing `:root` color/spacing/radius/shadow variables with this single source of truth:

```css
:root {
  /* Backgrounds */
  --bg-app: #0F172A;
  --bg-surface: linear-gradient(180deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.88));
  --bg-surface-solid: #1E293B;
  --bg-toolbar: rgba(15, 23, 42, 0.72);
  --bg-input: rgba(15, 23, 42, 0.82);

  /* Borders */
  --border-subtle: rgba(148, 163, 184, 0.16);
  --border-default: rgba(148, 163, 184, 0.24);
  --border-focus: rgba(99, 102, 241, 0.6);

  /* Text */
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-muted: #94A3B8;

  /* Brand accent — Indigo (replaces gold/amber as primary brand color) */
  --brand-primary: #6366F1;
  --brand-primary-hover: #818CF8;
  --brand-primary-text-on: #FFFFFF;
  --brand-shadow: 0 8px 24px rgba(99, 102, 241, 0.28);

  /* Status colors — keep existing semantic mapping, just standardized */
  --status-available-text: #86EFAC;
  --status-available-bg: rgba(34, 197, 94, 0.12);
  --status-available-border: rgba(34, 197, 94, 0.24);

  --status-ontrip-text: #7DD3FC;
  --status-ontrip-bg: rgba(56, 189, 248, 0.12);
  --status-ontrip-border: rgba(56, 189, 248, 0.24);

  --status-pending-text: #FCD34D;
  --status-pending-bg: rgba(245, 158, 11, 0.13);
  --status-pending-border: rgba(245, 158, 11, 0.28);

  --status-blocked-text: #FCA5A5;
  --status-blocked-bg: rgba(239, 68, 68, 0.12);
  --status-blocked-border: rgba(239, 68, 68, 0.24);

  --status-draft-text: #CBD5E1;
  --status-draft-bg: rgba(148, 163, 184, 0.12);
  --status-draft-border: rgba(148, 163, 184, 0.18);

  /* Spacing (8px scale, single source — remove all other spacing overrides) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Layout */
  --header-height: 64px;
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 80px;

  /* Radius (single scale — remove all other radius values in the codebase) */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 999px;

  /* Shadows (single scale) */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.28);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.32);

  /* Typography — standard weights only, no custom 950/920/850/750/650 */
  --font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

Then find and delete every other hardcoded color/radius/shadow/spacing value elsewhere in `index.css` and replace it with the matching variable above.

---

## STEP 1 — `index.css`: remove the forced dark-overlay hack, make dark the real default

Currently `index.css` uses `!important` to force `bg-white`/`bg-slate-50`/`text-slate-800` etc. into dark values — that's the root cause of the clash (inline styles and local `<style>` blocks bypass it). Instead:

1. Delete the `!important` override block (the lines targeting `.bg-white`, `.bg-surface-container`, `.bg-slate-50`, `.bg-slate-100`, `.text-slate-800`, `.text-on-surface`).
2. Set real defaults on `body`/`#root`:
```css
body, #root {
  background: var(--bg-app);
  color: var(--text-primary);
  font-family: var(--font-family);
}
```
3. Every card/panel class (`.card`, `.transit-panel`, `.driver-card`, and equivalents) should read background from `var(--bg-surface)`, border `1px solid var(--border-default)`, border-radius `var(--radius-lg)`, box-shadow `var(--shadow-md)` — no more separate light-mode versions of these classes.

---

## STEP 2 — `Sidebar.jsx`: remove the hardcoded light background

Find the inline style block with `background: '#ffffff'` and replace it with:
```js
style={{
  background: 'var(--bg-surface-solid)',
  borderRight: '1px solid var(--border-subtle)',
  boxShadow: 'var(--shadow-sm)',
  width: 'var(--sidebar-width)',
}}
```
Update the collapsed-state width to `var(--sidebar-width-collapsed)`. Active nav item indicator should use `var(--brand-primary)` instead of gold.

---

## STEP 3 — `Header.jsx`: remove the hardcoded light background + blur

Replace:
```js
background: 'rgba(255, 255, 255, 0.85)'
```
with:
```js
background: 'var(--bg-toolbar)',
backdropFilter: 'blur(12px)',
borderBottom: '1px solid var(--border-subtle)',
```
Set header height to `var(--header-height)` (drop the old `72px` value so it matches the Tailwind config's `64px` instead of conflicting with it). The calendar/notification badge background should use `var(--bg-input)` instead of `#f8fafc`.

---

## STEP 4 — `Dashboard.jsx`: remove local light-mode style rules

Find the local `<style>` block defining `.db-trip-row`, `.db-alert`, `.db-hero` with `#ffffff` backgrounds and replace each with:
```css
.db-trip-row, .db-alert, .db-hero {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}
```
KPI card values: keep large/bold, but standardize to `font-size: 36px; font-weight: 700;` (currently `950` — not a real weight, drop it to `700`, the heaviest real Inter weight most browsers render distinctly).

---

## STEP 5 — `Login.jsx`: bring the auth screen into the same dark system

Replace the `.auth-visual-panel` background (`#f1f5f9`) and the form panel background (`#ffffff`) with:
```css
.auth-visual-panel {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
}
.auth-form-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}
```
Replace the brand gradient text/logo color (currently gold-based) with:
```css
background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-hover) 100%);
-webkit-background-clip: text;
color: transparent;
```

---

## STEP 6 — Buttons: replace gold gradient with solid indigo

`.transit-btn-primary` / `.btn-primary`:
```css
background: var(--brand-primary);
color: var(--brand-primary-text-on);
border: none;
border-radius: var(--radius-md);
box-shadow: var(--brand-shadow);
font-size: 13px;
font-weight: 600;
transition: background 0.15s ease;
}
.transit-btn-primary:hover {
  background: var(--brand-primary-hover);
}
```
`.transit-btn` (secondary):
```css
background: var(--bg-toolbar);
border: 1px solid var(--border-default);
color: var(--text-secondary);
border-radius: var(--radius-md);
font-size: 13px;
font-weight: 600;
}
.transit-btn:hover {
  background: rgba(30, 41, 59, 0.85);
  border-color: var(--border-focus);
  color: var(--text-primary);
}
```
Row-action buttons (`.row-actions button`): `background: var(--bg-toolbar); color: var(--text-muted); border-radius: var(--radius-sm); width: 32px; height: 32px;`

---

## STEP 7 — Cards & Panels: one shared style, no hover color-shift to gold

```css
.transit-panel, .card, .driver-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.transit-panel:hover, .card:hover, .driver-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-focus);
}
```

---

## STEP 8 — Status Badges: keep the color logic, standardize the shape

The existing 5-state status mapping (Available/On Trip/Pending/Blocked/Draft) is good — keep it as-is, just make every badge consistent:
```css
.badge, .vehicle-badge, .driver-badge {
  height: 28px;
  padding: 0 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 700; /* was 900 — not a real weight */
  display: inline-flex;
  align-items: center;
}
```
Apply `--status-*-text/bg/border` variables per state as already defined in Step 0.

---

## STEP 9 — Form Inputs: indigo focus ring instead of amber

```css
input, select, textarea {
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  font-size: 14px;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.14);
  outline: none;
}
```

---

## STEP 10 — Typography cleanup (site-wide find/replace)

Replace every non-standard `font-weight` value with the nearest real one:
| Old (non-standard) | New (standard) |
|---|---|
| 950, 920 | 700 |
| 850 | 600 |
| 750 | 600 |
| 650 | 500 |

Apply consistently:
- **Page titles**: 28px / 700
- **Section headers**: 18–20px / 600
- **KPI values**: 36px / 700
- **Table headers**: 11px / 600, uppercase, letter-spacing 0.06em
- **Table body**: 14px / 400 (500 for emphasized cells)
- **Buttons**: 13px / 600
- **Nav links**: 13px / 500 (600 when active)

---

## STEP 11 — Tailwind config cleanup

In the `tailwind.config` block (currently in `index.html`), delete the large auto-generated Material color palette (`on-secondary-fixed`, `surface-tint`, `tertiary-fixed-dim`, etc. — none of these match what's actually used in the CSS) and replace `theme.extend.colors` with just:
```js
colors: {
  'bg-app': '#0F172A',
  'bg-surface': '#1E293B',
  'brand-primary': '#6366F1',
  'brand-primary-hover': '#818CF8',
  'text-primary': '#F8FAFC',
  'text-secondary': '#CBD5E1',
  'text-muted': '#94A3B8',
  'status-available': '#86EFAC',
  'status-ontrip': '#7DD3FC',
  'status-pending': '#FCD34D',
  'status-blocked': '#FCA5A5',
  'status-draft': '#CBD5E1',
}
```
Fix the duplicated/conflicting values: set `spacing.header_height` to `64px` (matches Step 3, currently conflicts with the `72px` used in Header.jsx) and `spacing.sidebar_width` to `240px` (matches Step 2, currently conflicts with the `280px` used in Sidebar.jsx).

---

## RESULT
Every screen — Login, Dashboard, Vehicle Registry, Driver Management, Trip Management, Maintenance, Fuel/Expense, Analytics, Settings — shares one dark surface system, one indigo brand accent, one type scale, one spacing/radius/shadow scale, and the same 5-state status badge logic throughout. No more light-shell-vs-dark-pages clash.
