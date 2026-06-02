# 20 - Game Frame v0.1 + DevHarness v0.1

## 目标边界

- `1920 × 1080` 的 `game-frame` 作为正式游戏画面，采用固定逻辑尺寸并在浏览器中按比例缩放。
- `DevHarness` 在 `game-frame` 下方，作为开发测试区，不属于正式游戏 UI。
- 本阶段仅构建静态页面骨架与 mock 驱动交互，不接入 `battle-core`、不接入 `PixiJS`。

## 允许进入 game-frame 的内容

- TopHud（双方分数、主将名、兵力/士气条、对战时间）
- 左右军团面板（左右双方主将占位、部队条目与数值）
- 中央战场（左右对峙布局、单位 marker、血条、等级、标签、提示、伤害数字）
- 底部指挥栏（MiniMap、播放控制、倍率显示、战术按钮）

## 不允许进入 game-frame 的内容

- Raw Events 文本块
- Scenario 控制按钮（Run 1v1、Run 5v5、Reset Battle、Random Formation）
- Seed 输入框与速度测试按钮
- Export/Import/Validate 等开发工具区内容
- 开发者调试日志与 JSON 输出

## 实现说明（v0.1）

- `game-frame` 使用 `apps/demo-web/src/game-ui` 进行模块化拆分，仅包含正式玩家可见的战斗画面。
- `DevHarness` 使用 `apps/demo-web/src/dev-ui` 进行开发工具封装。
- 数据与显示解耦：
  - `apps/demo-web/src/mock/mock-armies.ts` 提供兵力阵容 mock；
  - `apps/demo-web/src/mock/mock-battle-events.ts` 提供 scenario、事件与结果 mock；
  - 点击按钮仅更新 mock 文本，不触发真实战斗流程。
- 缩放逻辑通过 `apps/demo-web/src/layout/GameFrameScaler.ts` 计算 `--frame-scale`，`1920 × 1080` 始终保持等比缩放。

## 交互范围（v0.1）

- 点击左右军团列表条目可高亮对应项；
- 点击战场单位 marker 可高亮；
- 选中信息同步显示在战场提示区；
- 点击 Scenario 和工具按钮更新 `Raw Events` 与 `Test Result` 区域；
- Reset Battle 会恢复初始 mock 状态与文本。

## 后续演进路线

1. 静态 UI 稳定：继续完善 frame 内各区块像素风视觉和交互状态（禁用/选中/提示）。
2. Mock Events 驱动 UI：完善更多事件文本格式，覆盖回合、伤害、消耗、位移等展示。
3. BattleEvent 合同：在不接真实逻辑的前提下定义 UI 可消费的标准事件模型。
4. battle-core v0.1：将 UI 与 `battle-core` 的最小事件合同对齐。
5. UI 接真实事件流：逐步接入真实 battle event，替换当前模拟更新逻辑。

