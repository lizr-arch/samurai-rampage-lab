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

---

## v0.2

阶段定位：

1. `demo-web` 从固定样本页进入可编辑战斗沙盘
2. 强化局部观察能力
3. 强化兵种搭配、摆阵、删除、重建的测试效率

本阶段新增：

### 1. 战场观察

1. `BattleField` 滚轮缩放
2. 缩放后空白区域拖动画面
3. 双击恢复默认视图
4. 缩放倍率显示

### 2. 兵种部署

1. 蓝方兵种托盘
2. 红方兵种托盘
3. 6 种兵种全部可拖入战场
4. 同兵种允许重复上场
5. 每边上场上限为 8 队

### 3. 战场编辑

1. 已上场单位仍可继续拖动
2. 战场单位支持右键删除
3. 删除后 ArmyPanel 与 MiniMap 同步更新
4. `Random Formation` 只打乱当前已上场单位位置

### 4. 战场资源表达

1. 从 `melee / ranged` 通用图升级为 6 种独立兵种图
2. 蓝红双方都具备独立资源
3. 放大后可以区分枪兵、骑兵、弓兵、铁炮、忍者等轮廓

### 5. Run 语义调整

1. `Run 1v1 / Run 5v5` 使用当前布阵
2. `Scenario Preset` 改为模板填充入口
3. 不再用 Run 覆盖玩家当前自定义阵容

本阶段修正的关键问题：

1. 解决战场局部交战看不清的问题
2. 解决固定 5 支队伍无法验证兵种搭配的问题
3. 解决兵种托盘一次看不全的问题
4. 将单位删除交互从“拖回托盘”升级为“右键直接删除”

当前边界：

1. 仍未接 battle-core
2. 仍未实现真实战斗推进
3. 未实现 cost / 编制 / 多选部署
4. 当前仍属于 mock 驱动沙盘

相关文档：

1. [feature-summary-v0_2.md](./feature-summary-v0_2.md)
2. [battlefield-interactions.md](./battlefield-interactions.md)
3. [formation-and-deployment.md](./formation-and-deployment.md)

---

## v0.3

阶段定位：

1. `demo-web` 从“可编辑战斗沙盘”进入“输入与结果状态可解释”的开发模式
2. 明确当前战场输入和 Run 结果有效性之间的关系
3. 防止 preset、seed 和工具按钮误刷新或污染 Run 结果区

本阶段新增：

### 1. Deployment Mode 状态

1. `DevHarness` 新增 `部署状态` 主状态块
2. 显示当前是否可运行、已运行、或结果已过期
3. 显示当前输入来自默认模板、Scenario Preset、手调或随机重排
4. 显示 Run 结果是否未运行、对应当前战场或已过期

### 2. Run 结果有效性

1. `Raw Events` 标题随有效性变化
2. `Test Result` 标题随有效性变化
3. 输入变更后保留旧结果内容
4. 输入变更后明确标记旧结果已过期

### 3. 操作语义收口

1. `Scenario Preset` 只覆盖站位，不自动 Run
2. `Seed` 修改只影响后续随机和下次 Run，不自动 Run
3. `Speed` 修改只影响播放 / 显示，不影响结果有效性
4. 拖动、部署、删除、阵型和 `Random Formation` 会把旧结果标为过期
5. `Reset Battle` 回到默认模板、`1v1`、未运行态

### 4. 工具状态独立

1. `Export Replay` 不再覆盖 `Raw Events / Test Result`
2. `Import Replay` 不再覆盖 `Raw Events / Test Result`
3. `Validate Content` 不再覆盖 `Raw Events / Test Result`
4. 工具区新增独立 `工具状态`

### 5. Run 规模重算

1. `Run 1v1 / Run 5v5` 会按当前上场单位切换 troop 规模数值
2. 重算时保留单位 id、archetype 和当前位置
3. Run 不再重置当前阵型或重新套 preset

### 6. 战斗准备约束

1. 托盘新增军备值显示
2. 每个兵种新增出阵 cost 表达
3. 当前阵容除 `8 队上限` 外，再增加军备预算约束
4. 预算不足时兵种卡会禁用
5. 删除单位后军备会即时返还

本阶段修正的关键问题：

1. 解决 `scenarioRunKey` 同时表达规模、最近运行和结果有效性的混乱
2. 解决修改 preset / seed 后自动刷新旧结果的问题
3. 解决工具按钮占用 Run 结果区的问题
4. 解决用户无法判断旧 Raw Events / Test Result 是否仍对应当前战场的问题
5. 解决战斗准备阶段“可以无限补兵、没有构筑代价”的空白问题

当前边界：

1. 仍未接 battle-core
2. 仍未实现真实 replay 导入导出
3. 未实现历史 Run 对比
4. 未在 `GameFrame` 内新增持久部署状态 HUD
5. 尚未实现更细的编制槽位、兵种重复限制和正式部署规则

相关文档：

1. [feature-summary-v0_3.md](./feature-summary-v0_3.md)
2. [formation-and-deployment.md](./formation-and-deployment.md)
