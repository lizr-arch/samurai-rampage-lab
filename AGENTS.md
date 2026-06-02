# AGENTS.md

This repository is optimized for AI-assisted development.

## Core Rules

1. Pick the target package before editing:
   - `contracts`
   - `battle-core`
   - `battle-rules`
   - `content`
   - `replay`
   - `scenarios`
   - `devtools`
   - `demo-web`

2. Do not modify more than one package unless the task explicitly requires a cross-package change.

3. `packages/battle-core` must not import PixiJS, React, DOM, or app code.

4. `packages/battle-rules` must not import UI or app code.

5. New gameplay behavior requires:
   - one focused implementation change;
   - one focused test or scenario;
   - a clear manual verification path.

6. Do not add gameplay-specific `if skill.id === ...` branches inside `battle-loop.ts`.
   Add a rule module under `packages/battle-rules/src/<domain>/` instead.

7. All randomness must be deterministic and seed-based.
   Do not use `Math.random()` in battle simulation.

8. File size policy:
   - 350 lines: warning threshold for AI-generated implementation files.
   - 500 lines: hard limit for source files.
   - 1000+ lines: forbidden except generated artifacts.

9. Every completed task must report:
   - changed files;
   - commands run;
   - manual verification steps;
   - known gaps.

## Good Task Shape

Good:

```text
Implement bow range behavior in packages/battle-rules/src/weapon.
Add one test for archer attacking from distance.
Do not touch demo-web.
```

Bad:

```text
Implement the whole combat system.
```
