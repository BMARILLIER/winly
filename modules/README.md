# Modules Architecture

Each module is a pure computation engine with no external dependencies (no DB, no API, no React).

## Domain Groups

### Core Scoring
Modules that score the user's profile and content:
- `audit/` — Profile audit questionnaire scoring
- `score/` — Winly Score (pillar-based)
- `creator-score/` — Creator Score (multi-factor)
- `action-plan/` — Action plan from score pillars

### Growth & Intelligence
Modules that analyze growth potential and market signals:
- `growth-engine/` — Growth score with 6 weighted factors
- `growth-simulator/` — Standalone growth simulation with scenarios
- `opportunity-detector/` — Growth opportunity detection (7 categories)
- `market-intelligence/` — Market benchmarks and format analysis
- `social-radar/` — Orchestrator combining trend-radar + market-intelligence
- `trend-radar/` — Trend scoring with momentum
- `radar/` — Content opportunity detection by niche/platform
- `predictor/` — Content performance prediction

### Content Tools
Modules that help create content:
- `content/` — Content idea generation
- `hooks/` — Hook generation by type
- `repurpose/` — Content repurposing to multiple formats
- `bio/` — Bio analysis and generation
- `coach/` — Strategy Q&A and recommendations

### Engagement & Progress
Modules that track engagement and gamification:
- `missions/` — Daily missions with XP and streaks
- `progress/` — Levels, achievements, XP tracking
- `calendar/` — Week-based date utilities
- `share/` — Score card themes and visual metadata

### Setup
- `onboarding/` — Onboarding step definitions

## Shared Types
Shared types (Niche, ContentFormat, Platform, AudienceTier) live in `/types/index.ts`.
Modules should import shared types from `@/types`.

## Conventions
- Each module has a single `index.ts` entry point
- Pure functions only — no side effects, no DB, no API
- Types are exported alongside functions
- Module-specific types stay in the module; shared types go to `@/types`
