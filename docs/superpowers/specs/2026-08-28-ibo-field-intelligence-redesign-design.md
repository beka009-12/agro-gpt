# ibo Field Intelligence Frontend Redesign

Date: 2026-08-28  
Status: Approved design  
Branch: `codex/taste-ai-site-redesign`  
Base: `main` at `abd782d`

## 1. Objective

Redesign the complete user-facing frontend of ibo while preserving the green brand, logo, routes, localization, API contracts, SEO structure, and business behavior.

The result must feel like a professional multilingual agronomy product rather than a generic AI landing page. The visual language is named **Field Intelligence**: the precision of plant diagnostics combined with the material world of fields, leaves, crops, and greenhouse work.

## 2. Scope

Included:

- Home page.
- About page.
- Chat workspace.
- Login, registration, forgot-password, and reset-password flows.
- Profile and location sheet.
- Shared navigation, footer, language controls, form controls, states, and motion.
- Light and dark themes driven by semantic tokens.
- Responsive, accessibility, performance, and browser QA.

Excluded:

- Backend changes.
- API contract or generated OpenAPI type changes.
- Route slug changes.
- Authentication field names or step order changes.
- New diagnosis, map, analytics, billing, or account capabilities.
- Copy or legal-policy rewrites beyond clarity and consistency edits required by the UI.

## 3. Existing State Audit

### Brand tokens

- Green accent with warm cream surfaces.
- Plus Jakarta Sans for most content and Manrope in the header.
- Soft cards, frequent rounded containers, green-tinted shadows, and decorative gradients.
- The ibo leaf logo and lowercase wordmark are established assets.

### Information architecture

- `/`: marketing landing.
- `/about`: product and mission information.
- `/chat`: authenticated AI agronomy workspace.
- `/login`, `/register`, `/forgot-password`, `/reset-password`: authentication.
- Profile and location management are presented through a sheet.
- RU, KY, and EN use shared dictionaries.

### Strengths to preserve

- Clear green brand recognition.
- Working mobile chat viewport adaptations.
- Server Components for marketing content.
- React Hook Form and Zod validation.
- Existing keyboard support and profile-sheet focus management.
- Existing JSON-LD, sitemap, robots, and localized metadata.
- Current disease-name normalization on `main`.

### Patterns to retire

- Repeated equal-card layouts.
- Excessive decorative pills, numbered cards, gradients, and status dots.
- Large empty sections with weak visual rhythm.
- Separate header palette that does not match the rest of the product.
- Hardcoded component colors instead of semantic tokens.
- Hand-authored interface icons outside the brand logo.
- Decorative weather chip and generic AI visual treatment.
- Light-only styling.
- `window` scroll listeners used only to restyle navigation.

### Existing dial reading

- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 4`
- `VISUAL_DENSITY: 4`

## 4. Design Direction

Reading this as: a redesign-overhaul of a multilingual AI agronomy service for farmers and agronomists, with a trust-first nature-tech language, leaning toward a custom Tailwind v4 design system, botanical photography, and restrained Motion.

Approved dials:

- `DESIGN_VARIANCE: 7`
- `MOTION_INTENSITY: 5`
- `VISUAL_DENSITY: 5`

### Approaches considered

1. **Field Intelligence**, selected. Combines plant material, diagnostic precision, and a practical product workspace.
2. **Clinical Green**, rejected. Trustworthy but too sterile and weakly connected to the lived environment of agriculture.
3. **Editorial Agro**, rejected. More expressive for marketing but less suitable for daily chat and account work.

## 5. Visual System

### Color

The brand uses one green accent family. Status colors are semantic and never used decoratively.

Core light tokens:

- Deep forest: `#123B2A`.
- Brand green: `#238A52`.
- Main surface: `#F4F7F3`.
- Primary text: `#17231C`.
- Border: `#D7E1D8`.

Dark tokens will be calibrated from the same forest family, using near-black green surfaces rather than pure black. Both themes must preserve WCAG AA contrast and equal interaction hierarchy.

### Typography

- Display and marketing headings: Manrope.
- Interface and body copy: Onest.
- Numeric diagnostic metadata: IBM Plex Mono.
- Fonts load through `next/font` with Cyrillic support and stable fallback metrics.
- Body copy starts at 16px on mobile, with a 1.5 to 1.7 line height and controlled line length.

### Shape and elevation

- Cards and large sheets: 16px radius.
- Inputs and compact controls: 12px radius.
- Full pills: only compact tags, language choices, and round avatar actions.
- Shadows indicate real elevation only. Borders and spacing are the default grouping tools.
- Spacing follows a 4px base and an 8px layout rhythm.

### Icons

- Phosphor Icons is the single interface icon family.
- Standard stroke weight is defined globally.
- Existing brand logo remains unchanged.
- No emoji or hand-authored SVG paths are used as structural controls.

### Signature element

The **diagnostic lens** connects marketing and product surfaces. It uses real plant photography with a restrained focus region and contextual diagnosis information. It is not a fake screenshot and does not add decorative crosshairs that carry no meaning.

## 6. Application Architecture

### Marketing Shell

Used by the home and about pages. Provides the public header, footer, page container, theme behavior, and marketing content rhythm.

### Product Shell

Used by chat and profile surfaces. Provides the adaptive navigation rail, app header, main workspace, safe-area behavior, and product density.

### Auth Shell

Used by all authentication routes. Provides consistent navigation back to ibo, a shared photographic panel on desktop, the form stage, and a single-column mobile fallback.

### Component layers

Foundation:

- Semantic CSS tokens.
- Typography and spacing scales.
- Motion tokens.
- Layer and z-index tokens.

Primitives:

- Button.
- IconButton.
- Input.
- PasswordInput.
- Select.
- Sheet.
- Skeleton.
- StatusMessage.

Shells:

- MarketingShell.
- ProductShell.
- AuthShell.

Feature components:

- DiagnosisLens.
- ChatComposer.
- MessageItem.
- ProfileSheet.
- AuthFlow.

Server Components remain the default. Components using state, forms, browser APIs, or Motion are isolated client leaves.

## 7. Screen Design

### Home

- The hero fits the initial viewport at desktop sizes.
- Left side: one concise value proposition, supporting copy under 20 words, and one primary chat CTA with one secondary about CTA.
- Right side: a real botanical image and the diagnostic-lens composition.
- Trust or partner logos are omitted until real partner assets exist.
- Audience, capability, process, safety, and final CTA sections use distinct layout families.
- Equal three-card feature rows, decorative numbering, weather chips, scroll cues, and empty bento cells are not used.
- Below-fold images are lazy-loaded and have reserved dimensions.

### About

- Uses the same design tokens with a calmer editorial rhythm.
- Product, benefits, and mission content remain intact.
- Real agricultural imagery supplies material and context.
- The page avoids repeating the home-page section compositions.

### Chat

Desktop:

- Adaptive 280px navigation rail.
- Main conversation measure is capped at 880px.
- Composer remains visible without covering content.
- Profile is opened from a dedicated sheet.

Mobile:

- Compact app header.
- Overlay navigation drawer with escape and scrim dismissal.
- Safe-area spacing for the composer and iOS browser chrome.
- No horizontal overflow or nested-scroll conflict.

Chat states:

- Empty state explains text and image input directly.
- Image preview appears before send and can be removed.
- Pending analysis uses a content-shaped loading state.
- AI answers reveal with a short fade and translate transition, not a decorative typewriter effect.
- AI output is identified as a preliminary recommendation.
- Network and server failures provide a retry action.
- Geolocation refusal is contextual and does not block chat.

### Authentication

- Desktop uses a split composition: context image and focused form area.
- Mobile uses one column and preserves the current step flow.
- Login and registration field names, field order, autocomplete values, and validation rules remain unchanged.
- Field errors appear below their controls and the first invalid field receives focus.
- Persistent errors remain inside the form. Toasts are reserved for short success or transient network feedback.

### Profile

- Opens as an accessible side sheet.
- Identity, language, profile data, and location are grouped clearly.
- Logout is visually and spatially separated from normal settings.
- Focus trap, Escape handling, scroll lock, and return focus are preserved or improved.

## 8. Data and State Flow

### Marketing pages

Server Components read localized dictionaries and render stable HTML. Marketing motion is isolated to small client wrappers for the hero and section reveals.

### Chat

A dedicated chat-session controller owns:

- Message state.
- Pending state.
- Current backend chat identifier.
- Image-file and object-URL lifecycle.
- Geolocation request and fallback.
- Submission, error normalization, and retry behavior.

Presentational chat components receive typed props and do not make their own network decisions. The existing `/api/chat/message` contract is unchanged.

### Authentication and profile

React Hook Form and Zod remain the validation foundation. API error bodies are normalized into:

- General message.
- Optional typed field errors.
- Optional recovery action.

The current profile provider remains the shared source for authenticated profile display. No authentication tokens move to client storage.

### Localization

All new visible strings are added to RU, KY, and EN dictionaries together. Hardcoded Russian fallback copy in components is removed.

## 9. Motion System

Motion communicates hierarchy, feedback, or spatial continuity. It is removed when it serves only decoration.

- Fast feedback: 180ms.
- Normal state transition: 280ms.
- Slow composed transition: no more than 420ms.
- Only transform and opacity are animated.
- `motion/react` remains the only React animation import.
- `AnimatePresence` always declares its mode.
- Drawers and sheets preserve their spatial origin.
- Messages move no more than 8px during entry.
- Lists use 30ms to 50ms stagger, only when sequence improves comprehension.
- Large layout containers do not use Motion layout measurement.
- All motion honors `prefers-reduced-motion`.
- Low-end devices receive shorter or static variants.
- No infinite animation is shipped unless it communicates a real loading state.

## 10. Visual Assets

The redesign requires real images rather than CSS blobs or fake product screenshots.

Planned assets:

- Hero plant macro image, landscape or near-square crop.
- Supporting field or greenhouse image.
- About-page agronomy image.
- Diagnosis-detail crop used in the lens treatment.

Assets should be generated or selected at their intended aspect ratios, exported as WebP or AVIF, processed through `next/image`, and given meaningful alt text when informative. Decorative crops use empty alt text.

## 11. Accessibility and Interaction

- Normal text contrast is at least 4.5:1.
- Large text and functional glyphs meet at least 3:1.
- Interactive targets are at least 44px square.
- Keyboard order matches visual order.
- Focus rings are visible in both themes.
- Icon-only controls have localized accessible names.
- Color is not the only status indicator.
- Forms use visible labels, inline errors, and announced error regions.
- Sheets and image dialogs trap focus, close with Escape, and restore focus.
- Public and authentication route changes move screen-reader focus to the main heading. Chat state changes keep focus in the composer unless an error requires field focus.
- Dynamic text and long KY, RU, and EN strings must wrap without clipping.

## 12. Error, Loading, and Empty States

- Loading longer than 300ms shows a skeleton or contextual progress state.
- Empty states explain what the user can do next.
- Field errors remain attached to fields.
- Page or request failures include a clear recovery action.
- Toasts do not steal focus and use an accessible live region.
- Disabled states are semantic and visually distinct.
- No screen is designed only for its successful state.

## 13. SEO and Compatibility

- Existing routes, canonical assumptions, JSON-LD, sitemap, robots, and localized metadata remain valid.
- Heading hierarchy is sequential.
- Hero media reserves space and is prioritized for LCP.
- Below-fold media is lazy-loaded.
- No route or primary navigation label changes silently.
- The mobile chat viewport continues to support Safari safe areas and dynamic viewport units.

## 14. Testing and Acceptance

Automated checks:

- Existing and new Bun tests pass.
- TypeScript strict checking passes.
- ESLint passes without new warnings.
- Production Next.js build passes.

Component coverage:

- Form validation, submission, loading, field-error, and server-error states.
- Chat empty, pending, success, network-error, retry, image-preview, and geolocation-denied states.
- Sheet keyboard behavior and focus management.
- Localization keys exist for RU, KY, and EN.

Visual QA:

- 375px, 768px, 1024px, and 1440px widths.
- Mobile landscape where fixed chat controls are most at risk.
- Light and dark themes.
- Reduced-motion preference.
- Keyboard-only navigation.
- No horizontal overflow.
- No content hidden under fixed headers, drawers, or safe areas.

Performance targets:

- LCP under 2.5 seconds in the tested production build environment.
- INP under 200ms for core interactions.
- CLS below 0.1.

## 15. Implementation Boundaries

Implementation will be planned in stages so each stage is reviewable:

1. Semantic tokens, typography, icons, primitives, themes, and motion foundations.
2. Marketing shell, generated assets, home page, and about page.
3. Auth shell and all authentication routes.
4. Product shell, chat workspace, chat-state refactor, retry states, and responsive behavior.
5. Profile sheet, cross-route consistency, accessibility pass, visual QA, and performance verification.

No stage may alter backend behavior, generated API types, authentication storage, route slugs, or disease-ranking rules without a separate approved design change.

## 16. Pre-Flight Rules

The finished frontend must satisfy the following project-level rules:

- One green accent family across the product.
- One radius system and one icon family.
- No generic AI-purple treatment.
- No equal three-card feature row.
- No fake product screenshot.
- No decorative weather, version, section-number, status-dot, or scroll labels.
- No visible em-dash or en-dash characters in UI copy.
- No duplicate CTA intent on one page.
- No CTA label wrapping at desktop sizes.
- No decorative animation.
- No unmanaged scroll listener for presentation-only behavior.
- No hardcoded user-facing strings outside localization dictionaries.
- No light-only component styling.
- No delivery claim before tests, build, browser QA, and the design pre-flight checklist pass.
