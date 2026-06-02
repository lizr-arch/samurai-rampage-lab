# 02 Module Boundaries

## battle-core

允许：

- 创建初始状态；
- 推进时间；
- 调用 battle-rules；
- 更新 runtime state；
- 生成 BattleEvent；
- 输出 BattleReport。

禁止：

- import PixiJS / React / DOM；
- 写具体武器、技能、角色特判；
- 直接读取浏览器输入；
- 直接加载外部美术资源。

## battle-rules

允许：

- 实现目标选择；
- 实现移动规则；
- 实现伤害规则；
- 实现死亡规则；
- 实现武器和技能规则。

禁止：

- import demo-web；
- 修改 PixiJS 对象；
- 保存长期全局状态。

## demo-web

允许：

- 展示棋盘；
- 播放 BattleEvent；
- 提供 debug panel；
- 发起 BattleCommand。

禁止：

- 在 UI 中计算伤害；
- 在 PixiJS 中决定胜负；
- 绕过 battle-core 直接修改战斗规则。
