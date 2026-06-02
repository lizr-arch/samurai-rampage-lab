# Samurai Rampage Lab

一个面向 **大模型开发** 的 2D 编阵自动战斗工程骨架。

它不是一次性 Demo，而是一个可以逐步长成复杂项目的规则模拟器架构：

- `packages/contracts`：稳定类型合同。
- `packages/battle-core`：战斗执行器，只负责推进模拟。
- `packages/battle-rules`：移动、索敌、伤害、死亡、武器、技能、羁绊等规则。
- `packages/content`：内容数据和 schema 校验。
- `packages/replay`：战斗事件回放时间线。
- `packages/scenarios`：可复现实验场景。
- `packages/devtools`：战报、事件日志、调试输出。
- `apps/demo-web`：Vite + TypeScript + PixiJS 的最小可视化 Demo。

## 设计目标

1. **快速看到 Demo**：打开网页即可看 5v5 自动战斗回放。
2. **后期少重构**：核心逻辑、规则、数据、表现层从第一天分离。
3. **限制 AI 造大文件**：源文件默认 350 行预警，500 行硬上限。
4. **适合复杂项目演进**：通过 battle event、rule phase、scenario、content schema 扩展。
5. **适合纯 AI 开发**：任务按 package 切片，每个机制有测试和人工验证路径。

## 快速开始

```bash
pnpm install
pnpm dev
```

打开 Vite 输出的本地地址。

运行测试：

```bash
pnpm test
```

检查文件大小：

```bash
pnpm check:file-size
```

## 推荐开发方式

每次只让大模型做一个小任务，例如：

```text
本次只修改 packages/battle-rules/src/weapon。
新增 spear 的前排穿刺攻击规则。
不允许修改 apps/demo-web。
新增一个 focused test。
任何实现文件不得超过 350 行。
完成后输出 changed files / test command / manual verification / known gaps。
```

不要这样要求：

```text
帮我完整实现技能系统。
```

## 架构边界

```text
apps/demo-web
  -> 可以依赖 contracts / battle-core / content / replay / scenarios / devtools

battle-core
  -> 可以依赖 contracts / battle-rules
  -> 不允许依赖 PixiJS / React / DOM

battle-rules
  -> 只依赖 contracts
  -> 新规则应该在 battle-rules/<domain>/ 下新增文件

content
  -> 只负责数据、schema、loader、validation

contracts
  -> 稳定合同，不依赖业务实现包
```

## 第一版 Demo 已包含

- 5v5 示例场景。
- tick-based 自动战斗。
- 最近敌人索敌。
- 移动、攻击、受伤、死亡、结束事件。
- BattleReport。
- PixiJS 简单回放。
- Debug panel。
- 架构测试：禁止 core 导入 UI，禁止超大文件。

## 下一步推荐路线

1. 稳定 `BattleEvent` / `BattleReport` 合同。
2. 加入武器差异：刀、枪、弓、铁炮、扇、槌。
3. 加入 `BattlePhase` + `BattleRule` 注册表。
4. 加入 Battle Lab：单步、倍速、导出 replay、导入 replay。
5. 加入更多场景和内容数据。

## AI 必读

开发前先读：

- `AGENTS.md`
- `docs/01-architecture.md`
- `docs/02-module-boundaries.md`
- `docs/05-ai-dev-protocol.md`
- `docs/06-file-size-policy.md`
