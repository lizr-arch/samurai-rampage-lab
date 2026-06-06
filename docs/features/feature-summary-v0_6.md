# Feature Summary v0.6

本阶段完成了三个大项：投放模式死锁修复、军旗 UI 改造、主帅选择系统。

## 1. Bug 修复

### 1.1 投放模式死锁

**根因**：`BattleField.setBannerPlacementPreview` 用 preview 是否存在来控制 `placementMode`，但 preview 靠 `mousemove` 触发，而 `mousemove` 又被 `placementMode` 门控——形成循环依赖。

**修复**：分离关注点。新增 `setPlacementArmed(active)` 独立控制投放模式开关，preview 只负责视觉层。

### 1.2 拖拽区域 CSS class 丢失

**根因**：`renderSide` 传了 `viewport`（`.battlefield-viewport`）作为 `battlefield` 参数给 `attachPlayerSquadDrag`。`setDragZoneState` 回调把 `is-dragging-player` class 加到了 `viewport` 上，但 CSS 选择器 `.battlefield.is-dragging-player` 要求 class 在 `root`（`.battlefield`）上。两处调用（初始渲染 + `update`）都需改为 `root`。

### 1.3 落兵位置坐标偏差

**根因**：`resolveBattlefieldDrop` 用 `getBoundingClientRect` 返回的视觉坐标（缩放后）和 `offsetWidth` 返回的原始尺寸混用，导致坐标换算差了一个缩放倍率。

**修复**：`centerX = (clientX - rect.left) * (offsetWidth / rect.width)`，将视觉坐标转回原始坐标。

### 1.4 Tooltip 死循环

**根因**：`showTip()` 调用 `input.onBannerHover()` → `refreshCommanderUi()` → `renderCommanderUi()` → `orderActions.replaceChildren()` 销毁重建按钮 → 新按钮触发 `mouseenter` → `showTip()` 死循环。

**修复**：tooltip 完全由 BottomCommandBar 自管，不再回调 App 层更新状态。

## 2. 军旗 UI 改造

### 2.1 底部栏精简

- 按钮简化为 `⚑ 军旗名`，删掉常驻文字 tooltip/状态/消息
- 新增大 hover 浮层 tooltip（范围/消耗/CD/描述）
- CD 余量以角标形式显示
- Armed 态按钮脉冲动画

### 2.2 拖兵 Ghost 虚影

- 从"整张卡片克隆"改为独立 `troop-deploy-ghost` 元素
- 虚线边框 + 蓝色辉光 + 半透明背景 + 兵种图标+名称
- CSS `translate(-50%,-50%)` 居中跟鼠标

## 3. 主帅选择系统

### 3.1 数据模型

- 新增 `CommandItem` 类型：`clickOrder`（点击型）和 `placeBanner`（投放型）
- `commander-data.ts`：独立数据文件，含 `COMMANDERS`、`CommandItem` 定义
- `commander-types.ts`：纯类型定义，新增 `commandItems` 字段

### 3.2 CommanderSelect 组件

- 独立 `CommanderSelect.ts` 组件，通过 portal 渲染到 `.game-frame` 直属容器
- 卡片式展示：头像、名称、title、风格标签、可用指令、描述
- Portal 架构避免被 ArmyPanel 裁切链遮挡
- `z-index: 30` portal + `z-index: 50` panel 确保在所有元素上方

### 3.3 底部栏联动

- 只显示当前主帅的指令：点击型军令（⚡）+ 投放型军旗（⚑）
- 切换主帅后底部按钮实时变化：
  - 破阵主帅 → `⚡ 全军前进` `⚑ 冲锋旗`
  - 筹策主帅 → `⚡ 停下休整` `⚑ 集结旗`

### 3.4 兵团 commandState

- 落旗后范围内兵团获得持久命令标签（15 秒）
- 新命令覆盖同兵团旧命令
- 到期自动消失

### 3.5 头像资源

- 像素风 48×48 PNG 占位图，Python 生成
- 路径：`public/assets/commanders/commander_charge_01.png` / `commander_strategy_01.png`

## 4. 当前边界

1. 仍未接 battle-core
2. 点击型军令仅显示提示，不产生实际效果
3. 红方无主帅选择（仅蓝方可切换）

## 5. 相关文档

1. [../25_commander_select_v0_1.md](../25_commander_select_v0_1.md)
2. [../25_commander_order_v0_1.md](../25_commander_order_v0_1.md)
3. [../26_banner_placement_v0_1.md](../26_banner_placement_v0_1.md)
4. [changelog.md](./changelog.md)
