# 01 Architecture

## 核心思想

项目从第一天就按“规则模拟器 + 可视化回放器”设计。

```text
BattleCommand -> battle-core -> BattleReport -> replay/demo-web
```

## 包职责

| Package | Responsibility |
|---|---|
| `contracts` | 稳定类型合同：事件、命令、报告、内容类型、网格、ID |
| `battle-core` | 初始化状态、推进 tick、调度规则、生成报告 |
| `battle-rules` | 目标选择、移动、伤害、死亡、武器、技能、羁绊 |
| `content` | 内容数据、schema、校验、加载 |
| `replay` | 事件时间线、快照、回放辅助 |
| `scenarios` | 可复现实验场景 |
| `devtools` | 事件日志格式化、战报 diff、调试输出 |
| `demo-web` | PixiJS 可视化与调试 UI |

## 依赖方向

```text
contracts <- battle-rules <- battle-core <- apps/demo-web
contracts <- content      <- apps/demo-web
contracts <- replay       <- apps/demo-web
contracts <- scenarios    <- apps/demo-web
```

`contracts` 是底层合同，不应该依赖其他业务包。

## 不变量

- `core` 不知道 PixiJS。
- `view` 不写战斗规则。
- `data` 不写复杂逻辑。
- `rules` 不直接操作 UI。
- 每一场战斗可以通过 seed + command 复现。
