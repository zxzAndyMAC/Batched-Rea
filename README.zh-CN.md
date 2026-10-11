# 分批逆向工程（Batched Reverse Engineering）

[English](README.md)

这是一个可复用的 Agent Skill，用于对未知或规模较大的本地软件进行分批、受证据约束的逆向分析。

它适用于模块数量未知、一次性分析可能超过分析器堆内存、结果预算或人工审阅范围的目标。技能在可用时使用 REA 作为分析引擎，跨批次保留证据，只通过有依据的关系合并结果，并最终生成带置信度的架构或对比报告。

## 解决的问题

- 在决定批次边界前，先发现未知应用的整体形状。
- 分阶段分析入口、进程、IPC/API、原生绑定、存储、权限和功能链路。
- 明确区分直接观察事实、有限推断和仍未解决的未知项。
- 把分析器限制记录成覆盖边界，不把局部输出误认为完整模型。
- 将证据交给架构图和 AI 执行提示词工作流继续处理。

## 安装

### 交互式 `npx` 安装器

npm 发布后，推荐使用：

```bash
npx batched-reverse-engineering install
```

安装器会先询问安装到用户全局目录还是当前项目目录，再让你选择 Codex、Claude Code、Cursor、Cline 和 OpenCode。它会把统一的 `SKILL.md` 和证据模板映射到各工具的技能目录；Codex 还会额外安装 `agents/openai.yaml`，其他工具安装通用 Skill 和 references。

在脚本或 CI 中可以显式跳过交互：

```bash
npx batched-reverse-engineering install --global --tool codex,claude --yes
npx batched-reverse-engineering install --local --tool cursor --yes
npx batched-reverse-engineering install --list
```

写入文件前可使用 `--dry-run` 查看映射结果。

### 项目局部安装

将技能复制到 Agent 运行时使用的项目级技能目录：

```bash
mkdir -p .agents/skills/batched-reverse-engineering
cp -R /path/to/Batched-Rea/SKILL.md /path/to/Batched-Rea/agents /path/to/Batched-Rea/references .agents/skills/batched-reverse-engineering/
```

对于兼容 Codex 的项目技能，目录应如下：

```text
.agents/skills/batched-reverse-engineering/
├── SKILL.md
├── agents/openai.yaml
└── references/evidence-ledger.md
```

项目局部安装适合将分析流程和项目说明一起纳入版本管理。

### 全局安装

对于 Codex，可安装到当前用户的全局技能目录。之后 Codex 打开的所有项目都可以从这个用户级目录发现技能；其他 Agent 工具只有在读取同一目录，或复制到各自的全局技能目录后才能使用：

```bash
mkdir -p ~/.codex/skills/batched-reverse-engineering
cp -R SKILL.md agents references ~/.codex/skills/batched-reverse-engineering/
```

如果其他 Agent 运行时使用不同的全局技能目录，也需要将这三个条目复制过去。全局安装表示在兼容该目录的同一运行时中对当前用户生效，并不意味着所有独立 Agent 产品会自动共享。

### 用自然语言告诉 Agent 安装

如果 Agent 具备文件系统和 Shell 权限，可以直接告诉它：

> 从 `https://github.com/zxzAndyMAC/Batched-Rea` 安装 `batched-reverse-engineering` 技能到合适的项目局部或全局技能目录，保留 `SKILL.md`、`agents/openai.yaml` 和 `references/evidence-ledger.md`，然后验证技能可以被发现和调用。

安装后使用：

```text
$batched-reverse-engineering
```

## 依赖和配套技能

本工作流本身是文档型技能，不依赖语言包。它要求 Agent 能读取本地文件并运行相关分析工具。

推荐配套技能：

- `reverse-engineer-anything`：为原生、托管、Electron/JavaScript、打包应用、固件和浏览器目标选择 REA 分析路径。
- `archify`：生成可探索的架构图、流程图、时序图、数据流图和生命周期图 HTML。
- `writing-for-agents`：把研究结果整理成其他 Agent 可以直接执行的指令。

如果环境支持，REA 是首选分析引擎。本技能不捆绑 REA，也不替代目标类型对应的工具链。

## 常用用法

```text
使用 $batched-reverse-engineering 分析 /path/to/unknown-app。
请回答：
1. 应用如何启动并创建主会话？
2. 哪个进程或模块负责权限和持久化？
3. 第一轮受限分析后还有哪些未知项？

可用时使用 REA。维护证据台账，按受限批次拆分工作，
输出带置信度的报告和下一步探针计划。
```

要生成包含图表和实施提示词的完整报告：

```text
先使用 $batched-reverse-engineering 收集证据。
然后使用 $archify 生成架构图和流程图。
最后使用 $writing-for-agents 编写包含 P0/P1 优先级的 AI 可执行改造路线。
```

## 分析模型

1. 固化目标文件、版本、摘要、平台和问题。
2. 深度展开前先建立低成本全局地图。
3. 围绕入口、进程、IPC、存储、权限边界或具体功能链路形成批次。
4. 保存每批次的命令、证据 ID、范围、观察、连接关系、未知项和下一步探针。
5. 只通过稳定身份和相互印证的证据合并批次。
6. 只有静态证据无法回答重要问题时才增加运行时探针。
7. 明确报告堆限制、结果预算或传输截断。
8. 当问题已回答，或下一批不会改变决策时停止。

推荐台账格式见 [`references/evidence-ledger.md`](references/evidence-ledger.md)。

## 仓库结构

```text
SKILL.md                         # Agent 指令和工作流
agents/openai.yaml               # Codex 技能元数据
references/evidence-ledger.md    # 可复用的批次证据模板
```

## 贡献

请将改动集中在可重复的调查行为上。新增规则时说明触发条件、证据要求、停止条件和失败模式。除非工具行为本身是必要内容，否则示例应保持厂商中立。

## 许可证

当前尚未声明许可证。如果要在组织外分发此仓库，请先补充许可证。
