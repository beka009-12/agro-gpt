# Disease Intelligence Section Implementation Plan

> **For Codex:** Execute this plan inline in the current `codex/taste-ai-site-redesign` branch. The user explicitly requested no subagents.

**Goal:** Add a modern post-Hero landing section that presents real top-disease data, an interactive diagnosis map, and on-demand disease reference details.

**Architecture:** Fetch and validate the ranked diseases and GeoJSON on the server, then pass normalized data into one client interaction shell. Keep the heavy map library client-only and lazy-loaded. Fetch disease details through a small same-origin Route Handler only after the user selects a disease, so the backend URL remains server-side and the first page render stays compact.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS, Zod, Leaflet, Leaflet.markercluster, Bun test.

**Spec:** Approved in-chat design from 2026-08-30: section immediately after Hero; desktop list-left/map-right; mobile list then map; details on click; honest loading, empty, and error states.

---

### Task 1: Define and test the backend boundary

**Files:**
- Modify: `src/lib/disease-ranking.ts`
- Create: `src/lib/disease-intelligence.ts`
- Create: `src/lib/disease-intelligence.test.ts`

1. Add failing tests for malformed GeoJSON, invalid coordinates, symptom filtering, combined disease labels, and disease-detail title cleanup.
2. Export the existing disease-name normalization policy so ranking and map data cannot diverge.
3. Add typed Zod schemas and pure normalization functions for map points and disease details.
4. Run `bun test src/lib/disease-intelligence.test.ts src/lib/disease-ranking.test.ts` and confirm green.

### Task 2: Add server data access and lazy detail proxy

**Files:**
- Create: `src/lib/disease-data.ts`
- Create: `app/api/diseases/[disease-name]/route.ts`

1. Fetch `/top-diseases/` and `/disease-map/?limit=1000` independently through `apiFetch` with a five-minute revalidation policy.
2. Parse every response at runtime and return partial data when only one endpoint fails.
3. Validate the dynamic disease name, URL-encode it, fetch details, normalize the response, and return safe JSON errors.

### Task 3: Build the responsive section and map

**Files:**
- Create: `src/components/landing/disease-intelligence.tsx`
- Create: `src/components/landing/disease-intelligence-interactive.tsx`
- Create: `src/components/landing/disease-map.tsx`
- Modify: `app/globals.css`
- Modify: `package.json`
- Modify: `bun.lock`

1. Add Leaflet and marker-cluster dependencies with their TypeScript types.
2. Render a restrained white section with a two-column desktop composition and stacked mobile flow.
3. Show ranked disease rows with proportional bars and clear observed/fallback labels.
4. Load Leaflet only in the browser, cluster markers, use custom green marker visuals, and show an explicit empty overlay when no coordinates exist.
5. On list or marker selection, fetch details once, cache them locally, and render a compact loading/error/empty/content panel with retry and close controls.

### Task 4: Localize and place the section

**Files:**
- Modify: `src/i18n/ru.json`
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/ky.json`
- Modify: `app/page.tsx`

1. Add matching Russian, English, and Kyrgyz strings for headings, states, controls, and source metadata.
2. Insert the new section immediately after `Hero` and before `Audience`.

### Task 5: Verify behavior and finish the branch

**Files:**
- Verify all changed files

1. Run `bun test`, `bunx tsc --noEmit`, `bun run lint`, and `bun run build`.
2. Inspect the landing page at desktop and mobile widths, test selection, detail loading, close/retry behavior, and the current empty-map state.
3. Review the diff for unrelated changes and commit with `feat: add disease intelligence section`.
