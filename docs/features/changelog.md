# Features Changelog

本文档用于记录 `docs/features/` 所对应的功能演进轨迹。

目标：

1. 记录每个阶段新增了哪些功能
2. 记录每个阶段解决了哪些关键问题
3. 为后续回溯 UI 交互演进提供索引

说明：

1. 本文档关注“功能变化”
2. 不关注底层实现细节
3. 不替代 Git 历史
4. 不替代设计文档和视觉合同文档

---

## v0.1

阶段定位：

1. `demo-web` 第一条 UI 垂直切片
2. 建立正式 `game-frame` 与 `DevHarness` 的结构分离
3. 建立战场 UI、侧栏 UI、底栏 UI 的基础闭环

本阶段新增：

### 1. 页面结构

1. 建立 `1920×1080` 正式 `game-frame`
2. 建立位于下方的 `DevHarness`
3. 建立 `game-frame` 等比缩放能力

### 2. 正式 UI 基础模块

1. TopHud
2. 左右 ArmyPanel
3. 中央 BattleField
4. BottomCommandBar

### 3. BattleField 主视觉

1. 接入战场背景图
2. 接入透明单位 sprite
3. 保留伤害数字、攻击轨迹、冲突中心和“激突”标题
4. 明确中央战场不再使用大卡片作为主视觉

### 4. 战场选择交互

1. Selection Sync
2. 点击侧栏选中单位
3. 点击战场单位选中单位
4. 侧栏与战场高亮同步
5. `SelectedUnitChip` 轻量反馈层

### 5. 阵型与布阵

1. 蓝方预设阵型切换：
   - 锋矢阵
   - 鹤翼阵
   - 鱼鳞阵
2. 蓝方手动拖拽布阵
3. 红方手动拖拽布阵
4. 蓝方左半区限制
5. 红方右半区限制
6. 非法释放回退
7. 最小防重叠
8. `预设阵型 / 手动布阵` 状态标签

### 6. DevHarness 能力

1. Run 1v1
2. Run 5v5
3. Reset Battle
4. Random Formation
5. Seed 输入
6. 速度切换
7. Export Replay
8. Import Replay
9. Validate Content
10. Raw Events 显示区
11. Test Result 显示区

本阶段修正的关键问题：

1. `BattleField` 视觉从面板感调整为战场感
2. 中央单位从卡片感改为 marker 交互模型
3. 修正中央单位 hit target 被上层容器遮挡的问题
4. 修正蓝方拖拽无法稳定命中的问题
5. 修正红方拖拽坐标回写错误导致跳到左侧的问题

当前边界：

1. 未接 battle-core
2. 未接 PixiJS
3. 未实现真实战斗
4. 红方尚无预设阵型按钮逻辑

相关文档：

1. [feature-summary-v0_1.md](./feature-summary-v0_1.md)
2. [battlefield-interactions.md](./battlefield-interactions.md)
3. [formation-and-deployment.md](./formation-and-deployment.md)

---

## 后续版本记录规则

建议后续每个版本至少记录以下内容：

1. 版本号
2. 阶段定位
3. 本阶段新增功能
4. 本阶段修正的关键问题
5. 当前边界变化
6. 相关文档链接

推荐写法：

1. `v0.2`
2. `v0.3`
3. `v0.4`

如果某一阶段变化很多，也可以按主题分节：

1. 战场
2. 阵型
3. DevHarness
4. 事件流
5. battle-core 接入

---

## 当前结论

`docs/features/changelog.md` 是功能视角的版本追溯索引。

它回答的问题是：

1. 某个版本时，系统已经支持了什么
2. 某个能力是在哪个阶段出现的
3. 某个交互问题是在哪个阶段被修正的
