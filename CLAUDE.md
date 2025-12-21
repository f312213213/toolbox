# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1 application using React 19.2, TypeScript, and Tailwind CSS 4. The project uses pnpm as the package manager and follows the Next.js App Router architecture. It integrates shadcn/ui components with the "radix-mira" style variant for the UI component library.

## Development Commands

```bash
# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture

### Project Structure

- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with font configuration (Geist, Outfit)
  - `page.tsx` - Homepage that renders ComponentExample
  - `globals.css` - Global styles and Tailwind configuration
  - Route-specific directories (e.g., `timezone/`) contain their own `page.tsx`

- `components/` - Reusable React components
  - `ui/` - shadcn/ui component library (13 components including alert-dialog, button, card, combobox, dropdown-menu, field, input, select, etc.)
  - `example.tsx` - Layout wrapper components (ExampleWrapper, Example) for demo pages
  - `component-example.tsx` - Demo showcasing UI components

- `lib/` - Utility functions
  - `utils.ts` - Contains the `cn()` utility for merging Tailwind classes with clsx and tailwind-merge

### Key Patterns

**Import Aliases**: Use `@/` prefix for absolute imports (defined in tsconfig.json):
- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/hooks` → `./hooks`

**Component Composition**: shadcn/ui components follow a compound component pattern with explicit sub-components (e.g., Card exports CardHeader, CardTitle, CardContent, CardFooter, CardAction).

**Styling**: Uses Tailwind CSS with the `cn()` utility from `@/lib/utils` to merge conditional classes. The design system uses CSS variables defined in `globals.css`.

**Fonts**: The app uses three Google Fonts (Geist Sans, Geist Mono, Outfit) loaded via next/font/google. Outfit is set as the primary sans font via CSS variable `--font-sans`.

**UI Components**: All UI components are client-side ("use client" directive) and use lucide-react for icons.

## shadcn/ui Configuration

The project uses shadcn/ui with the following settings (components.json):
- Style: radix-mira
- Base color: zinc
- Icon library: lucide-react
- CSS variables enabled
- Menu color: inverted
- Menu accent: bold

When adding new shadcn components, they should be installed to `components/ui/`.

## Styling Notes

- Dark mode is enabled by default (see `app/layout.tsx` with `className="dark"` on body)
- Tailwind CSS 4 is configured via PostCSS
- Global styles use CSS custom properties for theming
