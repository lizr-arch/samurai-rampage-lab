# 06 File Size Policy

## Limits

| File type | Warning | Hard limit |
|---|---:|---:|
| Implementation `.ts` | 350 lines | 500 lines |
| Test `.test.ts` | 400 lines | 600 lines |
| Type-only files | 500 lines | 700 lines |
| JSON content | 300 lines | 800 lines |
| Generated files | exempt | exempt |

## Rules

- Do not add new logic to a file already above the warning threshold.
- Split before expanding.
- 1000+ line source files are forbidden except generated artifacts.
- A large file is not a style issue; it is an AI reliability issue.

## Split Patterns

Bad:

```text
skill-system.ts
```

Good:

```text
skill/
  trigger.ts
  condition.ts
  effect.ts
  registry.ts
  rules/haste-on-kill.ts
```
