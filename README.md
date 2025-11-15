# MBTI Chat Coach

一款面向普通用户的 MBTI 聊天教练：把“想怼又怕伤人”的本能回复交给它，几秒内就能得到“既走心又守边界”的表达建议。只需输入双方 MBTI、关系背景以及刚刚发生的对话，它就会：

- 预测对方会如何解读你的语气 & 为什么；
- 输出 1~3 条真人感候选回复（长度贴近原对话）；
- 提供“为什么这样说更好”的解释与语气提示；
- 支持一键复制回复，直接贴回聊天界面。

## Demo Highlights

- **一次设定，持续记忆**：首次打开会弹窗收集双方 MBTI、称谓、关系标签，之后自动复用。
- **聊天优先的原生体验**：渐变 hero、暗色卡片、底部高级设置，手指一滑即可复制或切换候选回复。
- **MBTI 速查手册**：第二个 Tab 展示 16 型人格的冲突盲点 & 舒缓策略，聊天前快速“复盘对方”。
- **可拓展的 AI 引擎**：通过环境变量即可替换 API Key、代理地址、模型名称，默认使用 `grok-4-fast`。

## 快速启动

```bash
# 1. 下载仓库代码
git clone https://github.com/xqingting/MBTI-AI-ChatCoach.git

# 2. 进入项目目录
cd MBTI-AI-ChatCoach

# 3. 安装依赖（Expo + React Native 相关包）
npm install

# 4. 复制并填写环境变量（模型 Key / Endpoint / Model）
cp .env.example .env   # 然后打开 .env，写入自己的配置

# 5. 启动开发服，扫码就能体验
npx expo start         # 可选择 Expo Go、模拟器或 Web
```

> TIPS：Expo CLI 启动后扫描二维码或访问网址即可体验。记得先在 `.env` 中设置 API 相关变量，详见下方「配置模型 API」。

## 配置模型 API（重点）

所有大模型配置都集中在 `.env`，开源/部署时只需替换这三项即可：

| 变量名 | 说明 |
| --- | --- |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI 代理的 Key（请勿提交真实 Key） |
| `EXPO_PUBLIC_OPENAI_API_ENDPOINT` | `chat/completions` 接口地址，例如 `https://openai.weavex.tech/v1/chat/completions` |
| `EXPO_PUBLIC_OPENAI_MODEL` | 使用的模型名称，如 `grok-4-fast` |

应用启动时会校验三项配置，缺失会直接提示。你也可以切换为其他代理/模型，比如自建 OpenAI 兼容服务，只需更新 `.env` 即可。

## 使用流程

1. **登陆页**：填写双方 MBTI、称谓、关系背景（一次即可），主页顶部始终显示“我 / Ta”的能量标签。
2. **聊天教练**：输入“对方刚说的原话”和“自己的本能回复”，点击“生成分析 & 优化表达”。
3. **候选回复**：查看“对方可能的解读”，在按钮式候选中选择一条，立即看到“为什么这样回复更好”并一键复制。
4. **高级设置（可选）**：需要强控语气时，在底部“打开语气控制”中手动指定对话目标与语气力度。
5. **速查手册**：切换到第二个 Tab，查阅 16 型人格的沟通偏好、冲突盲点与舒缓方式。

## 目录结构

```
.env.example                      环境变量示例（Key / Endpoint / Model）
app/(tabs)                        Pages：聊天教练、MBTI 速查
components / hooks / lib          UI 组件、记忆胶囊、AI 请求封装
constants/mbti.ts                 16 型人格文案 & 分组
scripts/reset-project.js          Expo 模板自带脚本
```

## 路线图 & 反馈

欢迎在 Issue 区提出使用体验、文案想法或 PR。一句话介绍你最常遇到的聊天场景，我会基于这些场景继续打磨提示词和 UI。Enjoy the chat magic! ✨
