<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Overview & Stack
- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript.
- **Styling**: Tailwind CSS v4 via PostCSS (`@import "tailwindcss"` in `app/globals.css`, no `tailwind.config.js`).
- **UI System**: shadcn/ui (`radix-ui`, `lucide-react`) in `components/ui/`.

## Essential Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Typecheck**: `npx tsc --noEmit`
- **Verification**: `npx tsc --noEmit && npm run lint`

## Architecture & Conventions
- **Path Alias**: `@/*` maps to root `./*` (e.g. `@/components/ui/button`, `@/lib/utils`).
- **Component Organization**:
  - `app/`: Next.js App Router routes and page layouts.
  - `components/ui/`: Reusable shadcn UI primitives.
  - `components/`: Feature-specific dashboard components.
  - `lib/utils.ts`: Contains `cn()` helper (`clsx` + `tailwind-merge`).
