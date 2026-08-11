# DESIGN_SYSTEM_v2.md
## Prism — Visual Language & Component Spec (Wireframe-Aligned)

> **Concept:** "See your money clearly" — Clean, light, professional fintech aesthetic.
> **Philosophy:** White space, purple accents, calm hierarchy. Every element earns its place.
> **Reference:** Wireframes dated 2026-08-11 (Pages 01–11)

---

## 1. Design Principles (Wireframe-Derived)

1. **Light First, Dark Accents** — White background default. Dark cards used sparingly for hero financial elements (account cards).
2. **Purple is the Prism** — Violet/purple is the singular brand accent. Charts are monochromatic purple. No rainbow charts.
3. **Numbers Right, Labels Left** — Financial data follows strict alignment. Amounts always right-aligned with tabular figures.
4. **Calm Density** — Dashboard is information-rich but never cluttered. Generous padding (24px cards), clear section headers.
5. **Semantic Color States** — Green for income/positive, red for expense/negative, amber for warning, purple for brand.
6. **Status as Pills** — Transaction status, account types, and category tags use small rounded pills.
7. **Mobile-First Stacks, Desktop Grids** — Single column on mobile, 2-3 column grid on desktop (≥1024px).

---

## 2. Color Palette (Light Mode Default)

### Neutral Scale (Backgrounds, Surfaces, Text)
```
--prism-white:        #FFFFFF   (Primary background)
--prism-surface:      #F8FAFC   (Page background, subtle contrast)
--prism-elevated:     #F1F5F9   (Hover states, secondary surfaces)
--prism-border:       #E2E8F0   (Dividers, card borders)
--prism-border-strong: #CBD5E1  (Focus states, active borders)
--prism-text:         #0F172A   (Primary text, headings)
--prism-text-secondary: #475569 (Body text, descriptions)
--prism-text-muted:   #94A3B8   (Timestamps, placeholders, disabled)
```

### Prism Spectrum (Brand Accents)
```
--prism-violet-50:    #F5F3FF   (Light backgrounds, tags)
--prism-violet-100:   #EDE9FE   (Hover states, subtle fills)
--prism-violet-200:   #DDD6FE   (Borders, light accents)
--prism-violet-400:   #A78BFA   (Secondary accent, icons)
--prism-violet-500:   #8B5CF6   (Primary brand, buttons, active)
--prism-violet-600:   #7C3AED   (Primary hover, emphasis)
--prism-violet-700:   #6D28D9   (Deep accent)
--prism-violet-900:   #4C1D95   (Dark mode fallback)
```

### Semantic Colors (Data & States)
```
--prism-success:      #10B981   (Income, under budget, positive delta)
--prism-success-bg:   #ECFDF5   (Success pill background)
--prism-success-text: #065F46   (Success text)
--prism-warning:      #F59E0B   (80% budget, amber alert)
--prism-warning-bg:   #FFFBEB   (Warning pill background)
--prism-warning-text: #92400E   (Warning text)
--prism-danger:       #EF4444   (Over budget, expense, critical)
--prism-danger-bg:    #FEF2F2   (Danger pill background)
--prism-danger-text:  #991B1B   (Danger text)
--prism-info:         #3B82F6   (Links, info banners)
--prism-info-bg:      #EFF6FF   (Info pill background)
```

### Dark Accent Cards (Used Sparingly)
```
--prism-dark-card:    #1E293B   (Hero account cards, premium feel)
--prism-dark-text:    #F8FAFC   (Text on dark cards)
--prism-dark-muted:   #94A3B8   (Secondary text on dark cards)
```

### Chart Palette (Monochromatic Purple)
```
chart-1: #7C3AED   (Primary segment)
chart-2: #A78BFA   (Secondary)
chart-3: #C4B5FD   (Tertiary)
chart-4: #DDD6FE   (Quaternary)
chart-5: #EDE9FE   (Lightest)
chart-6: #F5F3FF   (Background fill)
```
**Rule:** Never use green/red/amber in charts. Purple monochromatic only. Status colors are for text/numbers, not chart fills.

---

## 3. Typography

### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-display` | 36px / 2.25rem | 700 | 1.1 | Hero balance amounts |
| `text-h1` | 24px / 1.5rem | 600 | 1.3 | Page titles |
| `text-h2` | 20px / 1.25rem | 600 | 1.4 | Section headers ("Budget Health") |
| `text-h3` | 16px / 1rem | 600 | 1.5 | Card titles, table headers |
| `text-body` | 14px / 0.875rem | 400 | 1.6 | Body text, descriptions |
| `text-small` | 13px / 0.8125rem | 500 | 1.5 | Labels, metadata, timestamps |
| `text-xs` | 12px / 0.75rem | 500 | 1.4 | Badges, pills, fine print |
| `text-mono` | 14px / 0.875rem | 600 | 1.2 | Amounts, account numbers |

### Amount Display Rules
```css
.amount {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  text-align: right;
}
.income { color: var(--prism-success); }
.expense { color: var(--prism-danger); }
.neutral { color: var(--prism-text); }
```

---

## 4. Spacing Scale

Based on 4px grid:
```
--space-1:  4px    --space-5:  24px   --space-9:  48px
--space-2:  8px    --space-6:  32px   --space-10: 64px
--space-3:  12px   --space-7:  40px
--space-4:  16px   --space-8:  44px
```

**Card padding:** 24px (`--space-5`)
**Section gap:** 24px (`--space-5`)
**Inner element gap:** 16px (`--space-4`)
**Tight gap:** 8px (`--space-2`)

---

## 5. Component Specifications (Wireframe-Exact)

### 5.1 SurfaceCard (Standard Card)
```
Background:    var(--prism-white)
Border:        1px solid var(--prism-border)
Border-radius: 16px
Padding:       24px
Shadow:        0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)
Hover:         Shadow deepens slightly, border darkens to --prism-border-strong
```

### 5.2 DarkHeroCard (Account Card)
```
Background:    linear-gradient(135deg, #1E293B 0%, #0F172A 100%)
Border-radius: 16px
Padding:       24px
Text:          var(--prism-dark-text)
Muted text:    var(--prism-dark-muted)
Shadow:        0 8px 24px rgba(30, 41, 59, 0.3)
```
Used for: Primary account display on Dashboard (HDFC Savings card in wireframe).

### 5.3 PrismButton
**Variants:**
| Variant | Background | Text | Border | Height | Usage |
|---------|-----------|------|--------|--------|-------|
| Primary | `--prism-violet-600` | White | None | 40px | Main CTAs ("Add Account") |
| Secondary | `--prism-violet-50` | `--prism-violet-700` | None | 40px | Secondary actions |
| Outline | Transparent | `--prism-violet-600` | 1px `--prism-violet-600` | 40px | Ghost actions |
| Danger | `--prism-danger-bg` | `--prism-danger-text` | 1px `--prism-danger` | 40px | Destructive |
| Text | Transparent | `--prism-violet-600` | None | 32px | Inline links |

**Structure:**
```
Border-radius: 10px
Padding:       0 16px (standard), 0 12px (compact)
Font:          text-small, weight 600
Icon:          16px, left of text, 8px gap
Disabled:      opacity 0.5, cursor not-allowed
Loading:       Spinner replaces text
```

### 5.4 AmountInput
```
Background:    var(--prism-white)
Border:        1px solid var(--prism-border)
Border-radius: 12px
Height:        56px
Padding:       0 16px
Prefix:        "₹" in --prism-text-muted, 20px, left
Input:         Right-aligned, text-h2, --font-mono
Focus:         Border → --prism-violet-500, ring-2 ring-violet-100
```

### 5.5 ProgressBar (Budget)
```
Height:        8px
Border-radius: 4px (full)
Background:    var(--prism-elevated)
Fill:          var(--prism-violet-500) (<80%)
               var(--prism-warning) (80-99%)
               var(--prism-danger) (100%+)
Animation:     width transition 500ms ease-out on mount
```

### 5.6 CircularProgress (Savings Goals)
```
Size:          120px (mobile) / 160px (desktop)
Stroke width:  8px
Track color:   var(--prism-elevated)
Progress:      var(--prism-violet-500)
Center text:   "62%" text-h2, label text-xs below
Animation:     SVG stroke-dashoffset 800ms ease-out
```

### 5.7 TransactionRow
```
Layout:        Grid: [auto_1fr_auto_auto] (icon | details | account | amount)
Height:        64px
Padding:       12px 0
Border-bottom: 1px solid var(--prism-border)

Left:          40px circle icon (category emoji or icon, tinted background)
Center:        Title (text-body, weight 500) + Subtitle (text-small, muted)
Right:         Amount (text-body, mono, right-aligned, color-coded)

Hover:         Background var(--prism-surface)
Selected:      Left border 3px var(--prism-violet-500)
```

### 5.8 StatusPill
```
Height:        24px
Padding:       0 10px
Border-radius: 12px (full)
Font:          text-xs, weight 500

Types:
- Completed:   bg-success-bg, text-success-text
- Pending:     bg-warning-bg, text-warning-text
- Over Limit:  bg-danger-bg, text-danger-text
- NEFT/UPI:    bg-violet-50, text-violet-700
- Monthly:     bg-surface, text-muted
```

### 5.9 SectionHeader
```
Layout:        Flex row, space-between, align-center
Title:         text-h2, --prism-text
Subtitle:      text-small, --prism-text-muted (optional)
Action:        Text button or "..." menu (right side)
Margin-bottom: 16px
```

### 5.10 QuickAddFAB
```
Position:      Fixed, bottom-right, 24px from edges
Size:          56px circle
Background:    var(--prism-violet-600)
Icon:          Plus (Lucide), 24px, white
Shadow:        0 4px 16px rgba(124, 58, 237, 0.35)
Tap:           Scale 0.95, ripple
Keyboard:      "N" key opens QuickAddModal globally
```

### 5.11 EmptyState
```
Layout:        Centered, max-width 320px, padding 48px
Icon:          64px, --prism-violet-200, centered
Title:         text-h2, --prism-text, centered
Description:   text-body, --prism-text-muted, centered
Action:        Primary button, centered, 16px margin-top
```

---

## 6. Animation Tokens

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Page transition | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Route changes |
| Card hover | 150ms | ease-out | Interactive cards |
| Progress fill | 600ms | cubic-bezier(0.4, 0, 0.2, 1) | Budget bars, rings |
| Number count | 800ms | ease-out | Balance updates |
| Skeleton pulse | 1500ms | ease-in-out | Loading states |
| Modal slide-up | 250ms | cubic-bezier(0.16, 1, 0.3, 1) | Bottom sheets |
| Toast enter | 300ms | spring(1, 100, 10, 0) | Notifications |
| Chart draw | 800ms | ease-in-out | Initial chart render |

---

## 7. Layout Grid

### Desktop (≥1280px)
```
Sidebar:       240px fixed left
Main content:  calc(100% - 240px)
Max-width:     1440px centered
Padding:       32px
Gap:           24px
Grid:          12-column
```

### Tablet (768–1279px)
```
Sidebar:       64px icon-only collapsed
Main content:  calc(100% - 64px)
Padding:       24px
Grid:          8-column
```

### Mobile (<768px)
```
No sidebar
Bottom nav:    64px fixed
Padding:       16px
Grid:          Single column
```

---

## 8. Accessibility (WCAG 2.1 AA)

- **Contrast:** All text meets 4.5:1 minimum (tested on white background)
- **Touch targets:** 44×44px minimum
- **Focus:** 2px `--prism-violet-500` outline, offset 2px
- **Screen readers:** All icons have `aria-label`, charts have `aria-describedby`
- **Motion:** Respect `prefers-reduced-motion`
- **Font scaling:** Works at 200% zoom without horizontal scroll
