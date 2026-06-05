# Features Documentation

本目录用于记录 `samurai-rampage-lab` 当前已经完成的功能基线。

目标：

1. 记录已经做完的功能
2. 记录用户可以如何操作这些功能
3. 记录当前功能边界和限制
4. 为后续接入真实战斗系统提供稳定的 UI 基线

---

## 当前文档

### 1. 功能总表

- [feature-summary-v0_1.md](./feature-summary-v0_1.md)
- [feature-summary-v0_2.md](./feature-summary-v0_2.md)
- [feature-summary-v0_3.md](./feature-summary-v0_3.md)

用途：

1. 汇总 `demo-web` 当前已完成的 UI 和交互功能
2. 作为阶段性功能基线
3. 用于回顾“目前到底已经能做什么”
4. `v0.3` 之后应优先查看最新版本总结

### 2. 战场交互专题

- [battlefield-interactions.md](./battlefield-interactions.md)

用途：

1. 记录中央 `BattleField` 当前支持的交互能力
2. 固化点击、选中、高亮、轻量反馈和拖拽命中规则
3. 防止后续修改战场视觉时破坏已有交互

### 3. 阵型与布阵专题

- [formation-and-deployment.md](./formation-and-deployment.md)

用途：

1. 记录阵型预设与手动布阵能力
2. 记录蓝红双方拖拽规则、左右半区限制和回退规则
3. 为后续接入战斗前部署和真实事件流提供基线

### 4. 版本索引

- [changelog.md](./changelog.md)

用途：

1. 记录功能演进版本轨迹
2. 追溯某个功能在哪个阶段加入
3. 追溯某个交互问题在哪个阶段修正

---

## 当前记录范围

当前 `features` 文档主要覆盖：

1. `apps/demo-web`
2. 正式 `game-frame`
3. `BattleField`
4. `DevHarness`
5. 阵型、选中、高亮、拖拽等交互功能

当前不覆盖：

1. `packages/battle-core`
2. `packages/battle-rules`
3. `packages/contracts`
4. `packages/content`
5. `packages/replay`
6. 真实战斗结算逻辑

---

## 推荐维护规则

后续每次新增交互能力或可见功能时，建议同步更新本目录文档。

推荐更新时机：

1. 新增一个玩家可见 UI 模块
2. 新增一个开发测试交互能力
3. 修改已有功能边界
4. 接入 mock events 或真实事件流
5. 接入 `battle-core` 前后

推荐记录方式：

1. 先在总表中补充新的功能点
2. 当某一主题开始变复杂时，再拆成单独文档

---

## 后续可拆分的主题

当内容继续增长时，建议按主题拆分：

1. `battlefield-interactions.md`
2. `formation-and-deployment.md`
3. `dev-harness.md`
4. `game-frame-ui.md`

---

## 当前结论

`docs/features/` 是功能视角的文档目录。

它和设计文档、视觉合同文档的区别是：

1. 设计文档回答“为什么这样设计”
2. 视觉合同回答“哪些表现允许，哪些禁止”
3. 功能文档回答“现在已经能做什么”

---

## Repo Local Skill

如果要继续维护 `demo-web` 功能文档、专题文档和 changelog，可直接使用仓库内 skill：

1. `.codex/skills/demo-web-feature-docs/SKILL.md`
2. 配套模板：`.codex/skills/demo-web-feature-docs/templates/feature-doc-update-template.md`

它的用途是：

1. 写 `demo-web` 功能点文档
2. 更新 `docs/features/changelog.md`
3. 维护 `feature summary / 专题文档 / changelog` 的一致性
4. 复用这个项目自己的文档更新骨架，而不是每次重新描述格式
