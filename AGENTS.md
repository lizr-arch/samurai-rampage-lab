# AGENTS.md

This repository is optimized for AI-assisted development. Keep tasks small, package-scoped, and easy to verify.

## Read First

Before editing, read:

1. `README.md`
2. `docs/01-architecture.md`
3. `docs/02-module-boundaries.md`
4. `docs/05-ai-dev-protocol.md`
5. `docs/06-file-size-policy.md`

If the task touches `apps/demo-web`, also read:

1. `docs/20_game_frame_v0_1.md`
2. `docs/features/README.md`

## Current Repo Shape

Workspace packages:

- `packages/contracts`: stable battle contracts, ids, grid, stats, battle command/report/state/event types
- `packages/battle-core`: battle runner, loop, scheduler, runtime state, event emission
- `packages/battle-rules`: targeting, movement, damage, death, weapon range, formation bonus
- `packages/content`: schema, validation, loader, content JSON
- `packages/scenarios`: sample commands and reproducible scenarios
- `packages/replay`: replay timeline, snapshot, player helpers
- `packages/devtools`: report summary, event formatting, inspector and diff helpers
- `apps/demo-web`: Vite + TypeScript + PixiJS demo UI, game frame, dev harness, battle prep and deployment mode logic

Top-level commands:

- `pnpm dev`: run `demo-web`
- `pnpm build`: build all workspace packages
- `pnpm test`: run vitest
- `pnpm check:file-size`: enforce file size budget

## Package Selection Rule

Pick the target package before editing. Valid targets:

- `contracts`
- `battle-core`
- `battle-rules`
- `content`
- `replay`
- `scenarios`
- `devtools`
- `demo-web`

Do not modify more than one package unless the task clearly requires a cross-package change. Docs may be updated alongside the main change when needed.

## Boundary Rules

1. `packages/contracts` is the bottom layer. Do not import implementation packages into it.
2. `packages/battle-core` may depend on `contracts` and `battle-rules` only. It must not import PixiJS, React, DOM, browser globals, or app code.
3. `packages/battle-rules` may depend on `contracts` only. Do not import UI code, demo-web code, or Pixi objects.
4. `packages/content` is for schema, validation, loader, and small JSON content files. Do not hide gameplay logic in JSON if the rule is still evolving.
5. `apps/demo-web` may consume workspace packages, but it must not reimplement battle resolution rules in UI code.

## Current Implementation Guidance

1. `battle-core/src/battle-loop.ts` currently orchestrates generic steps: target selection, movement, range check, attack, damage, death, and winner detection.
2. Do not add gameplay-specific branches like `if skill.id === ...` or ad hoc weapon exceptions inside `battle-loop.ts`.
3. New combat behavior belongs in a dedicated rule module under `packages/battle-rules/src/<domain>/`, then wired into core generically.
4. All combat randomness must be deterministic and seed-based. Do not use `Math.random()` in battle simulation.
5. If a feature is UI-only and does not affect battle resolution, keep it in `apps/demo-web`.

## Demo-Web Rules

`apps/demo-web` now contains both rendering code and testable state logic.

Use these folders intentionally:

- `src/app`: stateful app logic such as `battle-prep`, `deployment-mode`, `formation-controls`, app assembly
- `src/game-ui`: visible battlefield and HUD modules
- `src/dev-ui`: developer harness UI
- `src/pixi`: Pixi stage and replay rendering
- `src/mock`: mock units, scenarios, and battle events

Rules for `demo-web` work:

1. If logic can be tested without DOM or Pixi, keep it in `src/app` or another pure module.
2. Do not bury state transitions inside DOM-building files when they can be expressed as pure functions.
3. `docs/20_game_frame_v0_1.md` defines what belongs in the formal game frame versus the dev harness. Respect that split.
4. If you add or change visible `demo-web` behavior, update `docs/features/` when the change affects the documented feature baseline.

## Testing Rules

Existing test buckets:

- `tests/architecture`: package boundaries and file size enforcement
- `tests/integration`: determinism, replay consistency, content validation
- `tests/demo-web`: pure `demo-web` state and behavior logic
- `packages/**/*.test.ts`: package-local focused tests such as `battle-rules` damage tests

When adding behavior:

1. New gameplay behavior requires one focused implementation change and one focused test or scenario.
2. `battle-rules` changes should usually add a package-local test or an integration scenario.
3. Pure `demo-web` logic changes should usually add a `tests/demo-web/*.test.ts` test.
4. Visual-only `demo-web` changes still require a clear manual verification path.

## File Size Rules

Default limits:

- implementation `.ts`: 350 warning, 500 hard limit
- test `.test.ts`: 400 warning, 600 hard limit
- type-only files: 500 warning, 700 hard limit
- JSON content: 300 warning, 800 hard limit

Do not keep adding logic to a file already above the warning threshold. Split by domain before expanding.

## Task Shape

Good:

```text
Implement spear reach logic in packages/battle-rules/src/weapon.
Add one focused test for reach behavior.
Do not touch apps/demo-web.
```

```text
Adjust deployment stale/current status handling in apps/demo-web/src/app/deployment-mode.ts.
Add one test in tests/demo-web/deployment-mode.test.ts.
Do not touch battle-core.
```

Bad:

```text
Implement the whole skill system.
```

```text
Refactor gameplay, UI, content, and replay together.
```

## Completion Report

Every completed task must report:

- changed files
- commands run
- manual verification steps
- known gaps
