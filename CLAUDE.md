# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Architecture

Next.js 16.1 app (App Router) with React 19, TypeScript, Tailwind CSS 4, and shadcn/ui (radix-mira style). Uses pnpm.

### Tools

Each tool lives in `app/<tool>/page.tsx` as a self-contained client component:
- `/timezone` — timezone converter with localStorage-persisted target zones
- `/base64` — Base64 encode/decode with Unicode support
- `/uri` — URI encode/decode with encodeURI vs encodeURIComponent toggle
- `/query` — query string parser/editor with editable key-value table
- `/schengen` — Schengen 90/180 visa calculator with localStorage-persisted trips

The homepage (`app/page.tsx`) is a server component that renders the tool grid.

### Styling

- **Dark mode only** — hardcoded via `className="dark"` on `<body>` in `app/layout.tsx`
- **Zero border-radius** — `--radius: 0` in globals.css. The design is intentionally sharp-cornered.
- **Color theme** — warm orange/red primary (oklch hue ~25), defined as CSS variables in `globals.css` under `:root` and `.dark`
- **All styling is Tailwind inline** — no custom CSS utility classes. Only keyframes, animation classes (`.animate-fade-up`, `.animate-scale-in`, `.stagger-*`, `.animate-fill`), and the `[data-stagger]` nth-child selector remain in globals.css because they can't be expressed as inline Tailwind.
- **Tool page layout** — each tool page uses `container mx-auto max-w-4xl px-6 py-14 space-y-8` with `data-stagger` attribute for entrance animations
- **`cn()` utility** — from `@/lib/utils`, merges Tailwind classes via clsx + tailwind-merge

### Fonts

Three Google Fonts loaded in `app/layout.tsx`: Outfit (`--font-sans`, primary), Geist Sans (`--font-geist-sans`), Geist Mono (`--font-geist-mono`).

### UI Components

shadcn/ui components live in `components/ui/`. All are client-side (`"use client"`). Icons from lucide-react.

Config in `components.json`: style `radix-mira`, base color `zinc`, menu color `inverted`, menu accent `bold`. Install new components with `pnpm dlx shadcn@latest add <component>`.

### Key Patterns

- **Import aliases**: `@/` maps to project root (e.g., `@/components/ui/button`)
- **Compound components**: shadcn/ui uses sub-component pattern (e.g., `Card`, `CardHeader`, `CardTitle`, `CardContent`)
- **Client state persistence**: Timezone targets and Schengen trips persist via localStorage
- **Accessibility**: `prefers-reduced-motion` is respected via media query in globals.css
