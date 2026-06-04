# demo-web-feature-docs

## Purpose

这个 skill 只用于 `samurai-rampage-lab` 仓库内，专门服务 `apps/demo-web` 的功能文档维护。

目标：

1. 快速补齐 `demo-web` 的功能点文档
2. 同步更新 `docs/features/changelog.md`
3. 保持 `feature summary / 专题文档 / changelog` 三者一致
4. 避免每次都重新解释文档结构和写法

---

## Bundle Layout

本 skill 在仓库内按 bundle 组织：

1. `SKILL.md`
   - 入口说明
   - 适用范围
   - 写作规则
2. `templates/feature-doc-update-template.md`
   - 文档更新时的统一骨架
   - 需要起草新 summary、专题文档或 changelog 条目时优先复用

如果后续再扩展：

1. 示例输出放 `examples/`
2. 小检查表放 `checklists/`
3. 辅助脚本放 `scripts/`

---

## When To Use

当用户出现以下意图时，优先使用本 skill：

1. 写 `demo-web` 功能文档
2. 更新 `docs/features/changelog.md`
3. 补“功能点文档”“交互文档”“版本文档”
4. 给刚做完的 `demo-web` 功能补文档
5. 整理某个 UI 阶段的能力边界

不适用：

1. `packages/battle-core` 规则设计文档
2. 通用架构文档
3. 内容 schema 文档
4. 与 `demo-web` 无关的 changelog

---

## Source Of Truth

写文档前，默认按以下顺序取事实：

1. 当前代码行为
2. 当前 `docs/features/*.md`
3. 当前 `AGENTS.md`
4. 当前 `docs/05-ai-dev-protocol.md`
5. 用户本轮明确补充的产品意图

不要把“旧文档里的过时描述”当成真相。
如果代码和旧文档冲突，以当前代码行为为准，再修文档。

---

## Inputs And Deliverables

默认输入：

1. 本轮已完成的 `demo-web` 功能改动
2. 当前 `docs/features/` 目录下现有文档
3. 用户本轮强调的产品边界

默认输出：

1. 至少一处被更新的功能文档
2. 如有阶段升级，则新增新的 `feature-summary-v0_X.md`
3. `docs/features/changelog.md` 中可追溯的版本记录
4. 最终回复中给出变更文档、记录范围、验证方式和未覆盖项

---

## Required Targets

当本轮功能明显影响 `demo-web` 能力边界时，至少检查并按需更新以下文件：

1. `docs/features/changelog.md`
2. `docs/features/README.md`
3. 最新一份 `feature-summary-v0_X.md`

如果变更触发专题边界，也一并更新：

1. `docs/features/battlefield-interactions.md`
2. `docs/features/formation-and-deployment.md`

判断规则：

1. 改了战场点击、拖拽、缩放、删除、观察方式：更新 `battlefield-interactions.md`
2. 改了兵种部署、阵型、托盘、布阵规则：更新 `formation-and-deployment.md`
3. 改了阶段能力基线：补新的 `feature-summary-v0_X.md`
4. 改了阶段里程碑：更新 `changelog.md`

---

## Writing Style

文档必须遵守以下风格：

1. 站在“功能视角”写，不写实现流水账
2. 重点回答：
   - 现在已经能做什么
   - 用户怎么操作
   - 当前边界是什么
3. 用编号列表为主
4. 用中文写
5. 优先描述行为，不优先描述类名/函数名
6. 不写无根据的未来承诺

禁止：

1. 把 changelog 写成 git diff
2. 把 feature summary 写成文件清单
3. 把实现细节塞进功能文档主体
4. 把未完成能力写成“已完成”

---

## Versioning Rule

当本轮属于新的阶段能力升级，而不是小修补时：

1. 新增一份新的 `feature-summary-v0_X.md`
2. 保留旧版本总结
3. 在 `docs/features/README.md` 里把新版本加到“功能总表”
4. 在 `docs/features/changelog.md` 追加新版本节

当本轮只是小修补，不足以形成新阶段时：

1. 直接更新当前最新 summary
2. 在 changelog 当前版本下补充条目

默认判断：

1. 新增一个明确的玩家可见能力层，算新阶段
2. 改变核心交互语义，算新阶段
3. 单纯修文案或小 UI 排版，不算新阶段

---

## Recommended Workflow

1. 先读当前代码，确认真实行为
2. 再读 `docs/features/README.md` 和 `changelog.md`
3. 判断这轮要不要新开一个 `feature-summary-v0_X.md`
4. 打开 `templates/feature-doc-update-template.md`，按需要选取骨架
5. 更新对应专题文档
6. 检查交叉一致性：
   - `README` 是否索引到新文档
   - `changelog` 是否能解释这个阶段
   - `feature summary` 是否覆盖新增能力
   - 专题文档是否反映新的交互边界

---

## Output Checklist

完成后，最终回复至少要说明：

1. 改了哪些文档
2. 这次文档新增记录了哪些能力
3. 是否新增了新的 `feature summary` 版本
4. 是否还有没覆盖到的专题文档

---

## Repo-Specific Notes

当前仓库下，`demo-web` 的功能文档主目录固定为：

- `docs/features/`

当前已经存在的重点文档：

1. `feature-summary-v0_1.md`
2. `feature-summary-v0_2.md`
3. `battlefield-interactions.md`
4. `formation-and-deployment.md`
5. `changelog.md`

默认策略：

1. 新功能先更新 summary，再补专题，再补 changelog
2. `docs/features/README.md` 只做索引和维护规则，不堆具体功能细节
