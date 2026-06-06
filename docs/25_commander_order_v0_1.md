# 25 Commander Order v0.1

## 1. P0 目标

本阶段只验证：

1. 玩家能选择大将
2. 当前大将决定可用军令
3. 玩家能看懂军令影响谁
4. 玩家点击军令后能看到令旗消耗、CD、目标组反馈和 mock event

## 2. 设计边界

当前实现是 `apps/demo-web` 的 UI / 交互原型，不是战斗系统。

明确边界：

1. 军令第一版只产生视觉反馈和 mock event
2. 不移动单位
3. 不改变单位真实属性
4. 不改变战斗结果
5. 不接 `battle-core`

## 3. 两个大将

### 3.1 破阵主帅

1. `id: charge_commander`
2. `title: 冲阵型`
3. 风格：进攻 / 冲阵 / 快节奏
4. 初始令旗：`3 / 3`
5. 当前军令：`全军前进`

### 3.2 筹策主帅

1. `id: strategy_commander`
2. `title: 控场型`
3. 风格：休整 / 调度 / 稳阵
4. 初始令旗：`3 / 3`
5. 当前军令：`停下休整`

## 4. 两个点击型军令

### 4.1 全军前进

1. `interactionType: click`
2. `targetGroup: all`
3. `intent: advance`
4. 消耗 `1` 令旗
5. `CD 8s`
6. 持续文案 `5s`
7. 目标反馈旗标：`进`

### 4.2 停下休整

1. `interactionType: click`
2. `targetGroup: all`
3. `intent: rest`
4. 消耗 `1` 令旗
5. `CD 10s`
6. 持续文案 `5s`
7. 目标反馈旗标：`休`

## 5. 交互规则

### 5.1 主帅选择

1. 点击左侧 ArmyPanel 的主帅头像或主帅名，打开小型 `CommanderSelect`
2. 面板只显示两个主帅卡片，不遮挡中央战场
3. 切换主帅后，蓝方 TopHud / ArmyPanel / BottomCommandBar 同步更新
4. 切换主帅后，令旗恢复为该主帅初始值，旧 cooldown 清空

### 5.2 Hover 预览

1. hover 军令按钮时，高亮所有会被影响的蓝方兵团
2. 第一版 `targetGroup=all`，因此当前只高亮蓝方全军
3. hover 不改变 `selectedUnitId`
4. hover 不影响拖拽布阵

### 5.3 Click 发令

1. 点击时先检查 cooldown
2. 再检查令旗是否足够
3. 可释放时扣除令旗并进入 cooldown
4. 发布成功后更新最近提示文案
5. 所有目标兵团显示短暂小旗标
6. DevHarness 追加 `commander_order_issued` mock event

### 5.4 DevHarness

1. `Raw Events` 继续只展示 Run 结果
2. 新增 `Order Events` 区域展示军令 mock event
3. 新增 `恢复令旗` 测试按钮
4. 点击后补满当前主帅令旗并追加 `commander_banners_restored`

## 6. 明确禁止

当前不做：

1. 右键命令
2. 框选
3. 拖拽军旗
4. 画线命令
5. 战术暂停
6. 真实战斗执行
7. 单兵团精确命令
8. 敌方集火

## 7. 后续 P1

后续可扩展但本次不实现：

1. 冲锋旗
2. 集结旗
3. 更细的目标组
4. 与真实 battle event / battle-core 对齐
