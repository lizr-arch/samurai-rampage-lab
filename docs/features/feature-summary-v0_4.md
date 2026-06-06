# Feature Summary v0.4

本文档记录 `apps/demo-web` 在 `v0.4` 阶段新增后的可见功能基线。

本阶段重点是为正式 `game-frame` 增加一条最小可验证的 `Commander Order v0.1` 闭环：

1. 选主帅
2. 看军令
3. hover 看目标组
4. click 发令
5. 看令旗 / CD / 短旗标 / mock event

---

## 1. 当前范围

当前总结覆盖：

1. 蓝方主帅选择小面板
2. 底部军令栏
3. 军令 hover 目标组预览
4. 军令点击后的短旗标反馈
5. DevHarness `Order Events` 与 `恢复令旗`

当前不覆盖：

1. `packages/*`
2. 真实 battle-core
3. 真实伤害、移动、属性变化
4. 多目标组筛选
5. 单兵团精确命令

---

## 2. v0.4 核心新增

### 2.1 主帅选择

已完成：

1. 蓝方 ArmyPanel 的主帅头像和主帅名可点击
2. 点击后打开小型 `CommanderSelect`
3. 面板内可在 `破阵主帅 / 筹策主帅` 之间切换
4. 切换后蓝方 TopHud、ArmyPanel、底部军令栏同步更新
5. 切换后当前令旗重置为该主帅初始值
6. 切换后旧 cooldown 清空

### 2.2 底部军令栏

已完成：

1. 底部栏保留 MiniMap
2. 保留播放 / 暂停 / 快进 / 速度显示
3. 保留阵型切换按钮
4. 新增当前主帅名显示
5. 新增令旗 `已用/上限` 显示
6. 新增当前主帅专属军令按钮
7. 新增最近一次军令提示
8. hover 军令时显示目标 / 倾向 / 消耗 / CD / 持续的轻量提示

### 2.3 军令 hover 预览

已完成：

1. hover `全军前进` 或 `停下休整` 时，高亮蓝方所有目标兵团
2. 第一版 `targetGroup` 只有 `all`
3. hover 高亮不会改变 `selectedUnitId`
4. hover 高亮不会改变单位位置
5. hover 高亮不会打断拖拽布阵

### 2.4 军令点击反馈

已完成：

1. 点击军令会先检查 cooldown
2. 点击军令会检查令旗是否足够
3. 可释放时扣除 `1` 点令旗
4. `全军前进` 进入 `8s` cooldown
5. `停下休整` 进入 `10s` cooldown
6. 目标兵团头顶显示短暂旗标
7. 前进旗标为 `进`
8. 休整旗标为 `休`

### 2.5 DevHarness mock event

已完成：

1. `Raw Events` 继续只服务 Run 结果
2. 新增独立 `Order Events` 区域
3. 成功发令时记录 `commander_order_issued`
4. 新增 `恢复令旗` 按钮
5. 恢复令旗时记录 `commander_banners_restored`

---

## 3. 当前边界

当前已明确不做：

1. 真实战斗执行
2. 军令改变 troop 数值
3. 军令触发移动或攻击
4. 右键 / 框选 / 画线命令
5. 拖拽军旗
6. 敌方 AI 发令

当前仍属于：

1. mock 驱动 UI 原型
2. 正式 `game-frame` 内的轻交互验证
3. 为后续接 battle-core 前做的军令 UI 基线

---

## 4. 相关文档

1. [../25_commander_order_v0_1.md](../25_commander_order_v0_1.md)
2. [battlefield-interactions.md](./battlefield-interactions.md)
3. [formation-and-deployment.md](./formation-and-deployment.md)
4. [changelog.md](./changelog.md)
