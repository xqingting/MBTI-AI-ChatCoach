# MBTI 聊天器

一个专注于**「原话→分析→优化表达」**的移动端体验：选择双方 MBTI、一次填写记忆胶囊、输入对方语句与自己的本能回复，随后由大模型输出语气诊断、措辞替换与下一步行动建议。

## 主要特性

- 🎯 **记忆胶囊**：AsyncStorage 自动持久化双方 MBTI、称谓、关系标签以及背景碎片，一次设定后每次打开都能延续状态。
- 🌈 **原生质感 UI**：双卡片布局、渐变英雄区、语气控制台，适配暗色主题的原生手势体验。
- 🧭 **首次弹窗设定**：新用户打开即弹窗填写双方 MBTI、称谓与关系，后续只在页面底部需要时修改即可。
- 🧠 **结构化分析**：调用 `grok-4-fast` 输出 JSON，聚焦“对方会怎么想 & 为什么”，并生成 1~3 条真人感候选回复。
- 📚 **速查手册**：第二个 Tab 内置 16 型人格速查卡，随时翻阅对方的沟通偏好与舒缓方式。

## 快速开始

1. 安装依赖
   ```bash
   npm install
   ```
2. 复制环境变量模板并填入自己的 API Key
   ```bash
   cp .env.example .env
   ```
   在 `.env` 中设置（示例）：
   ```
   EXPO_PUBLIC_WEAVEX_API_KEY=sk-********
   EXPO_PUBLIC_WEAVEX_API_ENDPOINT=https://openai.weavex.tech/v1/chat/completions
   EXPO_PUBLIC_WEAVEX_MODEL=grok-4-fast
   ```
   > 三个变量缺一不可：密钥、API 代理地址、模型名都集中在这个文件里，便于开源时替换。`.env` 已在 `.gitignore` 中，切勿把真实 Key 提交到仓库。
3. 运行本地开发
   ```bash
   npx expo start
   ```
4. 按照 Expo CLI 指引在模拟器、真机或网页中预览。

## 工作流程

1. 在「聊天教练」页选择双方 MBTI，补充称谓、关系标签以及最近需要记住的背景。
2. 粘贴/输入对方原话与自己的本能回复，选择本轮对话的目标（安抚 / 澄清 / 共创）以及语气力度。
3. 点击「生成分析 & 优化表达」，得到对方可能的解读 + 1~3 条候选回复。点选任意按钮即可查看“为什么这样回更好”与语气提示。
4. 第二个 Tab 可随时查看 16 型人格的沟通速查卡，帮助重新 framing 对方的感受。

## 配置模型 API

`lib/coach.ts` 会从环境变量中读取所有模型配置，因此发布或分享仓库时只需要共享 `.env.example`：

| 变量名 | 用途 |
| --- | --- |
| `EXPO_PUBLIC_WEAVEX_API_KEY` | OpenAI 代理的访问密钥 |
| `EXPO_PUBLIC_WEAVEX_API_ENDPOINT` | `chat/completions` 的完整地址，可替换为其他代理 |
| `EXPO_PUBLIC_WEAVEX_MODEL` | 想要调用的模型名称，例如 `grok-4-fast` |

启动时若缺失任何一项，前端会提示补全。你也可以在 `.env` 中换成其他模型/地址，实现一键切换。

## AI 调用说明

- **鉴权**：通过这三个环境变量从 `.env` 注入，前端在请求头里写入 `Authorization: Bearer <key>`。
- **提示词**：要求模型返回严格 JSON，包含语气诊断、候选回复、MBTI 互动要点等，前端解析失败时会直接显示原文。

## 目录结构速览

```
app/(tabs)         主要页面（聊天教练 / 速查手册）
constants/mbti.ts  16 型人格文案与分组元数据
hooks/useMemoryCapsule.ts  AsyncStorage 持久化记忆
lib/coach.ts       与 grok-4-fast 的通讯与结果规整
```

欢迎继续扩展，例如：添加历史记录、分享卡片或语音输入等。Happy hacking! 🎧
