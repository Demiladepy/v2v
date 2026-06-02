# AGENTS BEST PRACTICES

Welcome, AI Agents! When working on the V2V (Voice-to-Value) Autonomous Merchant Protocol, you MUST adhere to the following strict guidelines and best practices to ensure high quality, consistency, and premium aesthetics.

## 🎨 1. UI & Styling Rules (Token-Based System)
- **No Hardcoded Colors**: NEVER use raw Tailwind color classes (e.g., `bg-blue-600`, `text-slate-500`) or hex codes (e.g., `#F8FAFC`).
- **CSS Variables**: ALWAYS use the project's CSS variable tokens defined in `app/globals.css`.
  - **Backgrounds**: `var(--background)`, `var(--secondary)`
  - **Surfaces**: `var(--card)`, `var(--popover)`
  - **Brand**: `var(--brand)`, `var(--brand-light)`, `var(--brand-dark)`
  - **Status**: `var(--success)`, `var(--warning)`, `var(--destructive)`, `var(--info)`
  - **Text**: `var(--foreground)`, `var(--muted-foreground)`, `var(--secondary-foreground)`
  - **Borders**: `var(--border)`, `var(--input)`
- **Usage**: Apply these variables via standard Tailwind utility classes (e.g., `bg-brand`, `bg-brand-light`, `text-muted-foreground`, `border-border`). Avoid using the `[var(--...)]` bracket syntax if a standard utility exists in `@theme`.
- **Shadcn/UI**: We use Shadcn UI components. Ensure components are consistently styled using our Tailwind and CSS variable configuration.
- **Premium Aesthetics**: The app must look premium, modern, and dynamic. Implement smooth hover effects, micro-animations, and glassmorphism where appropriate to "WOW" the user.
- **Responsive Design**: The app is a Progressive Web App (PWA). Mobile-first responsiveness is mandatory.

## ⚙️ 2. Technical Stack
- **Framework**: Next.js / React.
- **Styling**: Tailwind CSS & Vanilla CSS (via CSS variables for theming).
- **Backend/API**: Next.js App Router (Server Actions / API routes).

## 🤖 3. General Agent Workflow
- Always refer to your assigned specific role file (e.g., `docs/eyitayo.md`, `docs/demilade.md`) to know your scope.
- Do NOT implement features outside your team member's domain without explicitly being instructed.
- When generating code, ensure clean architecture, reusability of components, and clear comments.
- Prioritize low latency: For any code running in the critical path (especially the audio and ML pipeline), write highly optimized and performant code. Overall latency target is <2.4s.

## ⚡ 4. Parallel Agent Development (CRITICAL)
- **Shared Types:** Since multiple agents are working simultaneously, ALWAYS import and use the TypeScript interfaces defined in `types/index.ts`. Do not invent new shapes for LLM responses or ledger entries.
- **Environment Variables:** Reference `.env.example` for the standardized variable names. Never commit actual keys.
- **Mocking:** If you are waiting on another agent's API route, write a temporary mock function that returns the exact type from `types/index.ts` so you don't stay blocked.

## 📍 5. Registry & Navigation
- **Path Consistency**: Ensure all navigation links match the established Next.js App Router routing structure.
- **State Scoping**: Always ensure data is strictly scoped to the authenticated merchant session and simulated database ledger rules.

## 📝 6. Change Logging Policy
- **Timeline log**: Whenever you make changes, YOU MUST ALWAYS append a brief, timestamped summary of your changes to `docs/timeline-changes.md`.
- **Format**: Keep them short, sequential, and permanent. Do NOT overwrite other lines in the file.

## 🚢 7. Commit & Push Strategy
When the user says **"commit"**:
1. **Build first**: Always run the project build (`npm run build`) before committing. If it fails, surface the error and stop — do not commit broken code.
2. **Audit uncommitted files**: Run `git status` and review everything untracked/modified.
3. **Respect gitignore**: Never force-add files that are gitignored. In particular, do NOT commit `*.m.md` files (like `docs/res.m.md`) or anything under `dev-utils/` unless explicitly asked.
4. **Group commits atomically**: Don't dump everything into one commit. Split by logical concern — one commit per feature/flow/fix. (e.g., Database schema → separate commit from UI).
5. **Commit message style**: Follow scope prefixes (`feat(ui):`, `fix:`, `chore:`, `style:`, `refactor:`). Short first line, no trailing period. Body only when the "why" is non-obvious.
6. **Push to main last**: After all atomic commits land locally, push to `main` in a single `git push`.
7. **Never** `--no-verify`, `--force`, `--amend` published commits, or skip hooks.
