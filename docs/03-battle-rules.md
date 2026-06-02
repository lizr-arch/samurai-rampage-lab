# 03 Battle Rules

## MVP 规则

- 战斗按固定 tick 推进。
- 每个单位寻找最近敌人。
- 不在射程内则向目标移动一格。
- 在射程内且冷却结束则攻击。
- 伤害 = `max(1, attacker.atk - floor(defender.def * 0.5))`。
- HP <= 0 时死亡。
- 一方全灭时战斗结束。
- 超过最大时长则判定 draw。

## 未来 Battle Phase

后续技能系统建议引入：

```ts
export type BattlePhase =
  | 'battle_start'
  | 'tick_start'
  | 'before_move'
  | 'after_move'
  | 'before_attack'
  | 'on_attack'
  | 'on_damage'
  | 'after_damage'
  | 'on_kill'
  | 'tick_end'
  | 'battle_end';
```

所有技能、羁绊、武器特效挂到 phase 上，不要污染 `battle-loop.ts`。
