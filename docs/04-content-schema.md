# 04 Content Schema

内容数据应该小文件化。

推荐结构：

```text
packages/content/data/
  units/
    ashigaru.json
    archer.json
  weapons/
    sword.json
    spear.json
  skills/
    battle-start/
    on-kill/
  encounters/
    tutorial-5v5.json
```

原则：

1. 单个 JSON 文件表达一个单位、武器、技能或 encounter。
2. 不要把所有技能写进一个 3000 行 JSON。
3. 数据需要通过 content validation。
4. 复杂规则先用 TypeScript 实现，成熟后再数据驱动。
