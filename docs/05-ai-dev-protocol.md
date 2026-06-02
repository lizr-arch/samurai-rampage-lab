# 05 AI Development Protocol

## Intake

每次开发前，大模型必须回答：

1. 本次目标是什么？
2. 修改哪个 package？
3. 不修改什么？
4. 验收标准是什么？
5. 是否需要新增测试或 scenario？

## Task Size

推荐任务粒度：

- 新增一个武器规则；
- 新增一个技能触发器；
- 修复一个目标选择 bug；
- 给 debug panel 增加一个字段；
- 给 content schema 增加一个字段。

不推荐任务粒度：

- 实现完整技能系统；
- 重构整个战斗系统；
- 做完整 UI；
- 一次加入 20 个单位。

## Completion Report

每次结束必须输出：

```text
Changed files:
- ...

Commands:
- pnpm test

Manual verification:
- ...

Known gaps:
- ...
```
