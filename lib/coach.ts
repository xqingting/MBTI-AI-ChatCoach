import { getMBTIProfile } from '@/constants/mbti';
import type { MemorySnapshot } from '@/hooks/useMemoryCapsule';

export type CoachingFocus = 'soothe' | 'clarify' | 'co-create';
export type ToneSetting = 'soft' | 'balanced' | 'direct';

export type ConversationDraft = {
  incomingMessage: string;
  instinctiveReply: string;
  nuanceGoal: string;
  focus?: CoachingFocus | null;
  tone?: ToneSetting | null;
};

type AiPayload = {
  toneDiagnosis?: string;
  perceptionInsights?: Array<{
    hook: string;
    interpretation: string;
    reason: string;
  }>;
  replyOptions?: Array<{
    id: string;
    label: string;
    message: string;
    whyBetter: string;
    toneGuide: string;
  }>;
};

export type PerceptionInsight = NonNullable<AiPayload['perceptionInsights']>[number];
export type ReplyOption = NonNullable<AiPayload['replyOptions']>[number];

export type CoachingResult = {
  toneDiagnosis: string;
  perceptionInsights: PerceptionInsight[];
  replyOptions: ReplyOption[];
  raw: string;
  createdAt: number;
};

const API_ENDPOINT = process.env.EXPO_PUBLIC_OPENAI_API_ENDPOINT;
const MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL;

const focusMap: Record<CoachingFocus, string> = {
  soothe: '先安抚情绪，再轻柔地提出边界或需求',
  clarify: '结构化表达事实、澄清误会，保持尊重',
  'co-create': '强调合作与共同目标，把能量导向下一步',
};

const toneMap: Record<ToneSetting, string> = {
  soft: '温和、充满关怀、避免压迫感',
  balanced: '既柔软也清晰，兼顾尊重与效率',
  direct: '直接坦率，但仍保持对人不对事的善意',
};

const sanitizeBlock = (value: string) => {
  const withoutFences = value.replace(/```json|```/gi, '');
  const withoutThink = withoutFences.replace(/<think>[\s\S]*?<\/think>/gi, '');
  const firstBrace = withoutThink.indexOf('{');
  const lastBrace = withoutThink.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return withoutThink.slice(firstBrace, lastBrace + 1).trim();
  }
  return withoutThink.trim();
};

const normalizeArray = <T>(value: T[] | undefined | null): T[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [];
};

export const requestCoaching = async ({
  memory,
  conversation,
}: {
  memory: MemorySnapshot;
  conversation: ConversationDraft;
}): Promise<CoachingResult> => {
  const apiKey = process.env.EXPO_PUBLIC_WEAVEX_API_KEY;

  if (!apiKey) {
    throw new Error('缺少 EXPO_PUBLIC_WEAVEX_API_KEY，请参考 README 进行配置。');
  }
  if (!API_ENDPOINT) {
    throw new Error('缺少 EXPO_PUBLIC_WEAVEX_API_ENDPOINT，请在 .env 中设置模型地址。');
  }
  if (!MODEL) {
    throw new Error('缺少 EXPO_PUBLIC_WEAVEX_MODEL，请在 .env 中设置模型名称。');
  }

  const partnerProfile = getMBTIProfile(memory.partnerMbti);
  const selfProfile = getMBTIProfile(memory.myMbti);
  const focusLine = conversation.focus ? `- 对话目标：${focusMap[conversation.focus]}` : '';
  const toneLine = conversation.tone ? `- 语气力度：${toneMap[conversation.tone]}` : '';
  const optionalDirectives = [focusLine, toneLine].filter(Boolean).join('\n');

  const payload = {
    model: MODEL,
    temperature: 0.45,
    messages: [
      {
        role: 'system',
        content:
          `你是一位专精 MBTI 的「对话优化教练」。

核心任务：
- 帮助用户把「本能回复」优化成更好的聊天回复。

语言与格式：
- 只使用简体中文。
- 如果信息缺失或不确定，也要尽量完成输出，并在 toneDiagnosis 中温和提醒。
- 回复建议要像真人即时聊天
- 避免模板化、流水线句式，不要堆砌 MBTI 术语，让理解自然融入表达中。
`,
      },
      {
        role: 'user',
        content: `
背景
- 我：${memory.myName || '我'}（${memory.myMbti}${selfProfile ? ` · ${selfProfile.archetype}` : ''}，${selfProfile?.vibe ?? '以真诚与洞察沟通'}）
- 对方：${memory.partnerName || '对方'}（${memory.partnerMbti}${partnerProfile ? ` · ${partnerProfile.archetype}` : ''}，${partnerProfile?.vibe ?? '重视真实反馈'}）
- 关系标签：${memory.relationshipTag || '未设置'}
- 记忆碎片：${memory.conversationNotes || '（暂无补充）'}

输入
- 对方原话："""${conversation.incomingMessage.trim()}"""
- 我的本能回复："""${conversation.instinctiveReply.trim()}"""
- 我真正想表达：${conversation.nuanceGoal || '更柔和且被理解的表达'}
${optionalDirectives ? `${optionalDirectives}` : ''}

任务
1. 从对方原话中，推断对方「可能在意什么 / 担心什么」及当前情绪。
2. 重点分析：
   - 「对方会怎么想？」（对这段本能回复的直觉解读）
   - 「为什么会这样解读？」（结合双方 MBTI 功能差异与沟通习惯）
3. 基于以上，帮我设计 1～3 个候选回复

具体要求
- 分析时可以在心里使用 MBTI 功能（如 Fi、Fe、Ti、Te 等）解释差异，但在输出中用日常语言说明，不要堆专业术语。
- 回复建议必须像真人对话：有称呼、有细节、有情绪，而不是生硬的模板句。
- 每个候选回复的语气可以略有不同（例如：更安抚 / 更直接 / 更有边界），方便我按当下状态选择。
- 回复字数尽量贴近对方原话长度，整体控制在对方原话的 ±30% 内，同时 message 字段建议不超过 90 字。
- message 字段只写「我要回复给对方的话」，不要在里面解释理由。

输出 JSON（不要出现注释，不要额外字段）：
{
  "toneDiagnosis": "一句话说明当前语气的机会与风险，如果信息不足也在这里温和说明",
  "perceptionInsights": [
    {
      "hook": "对方会怎么想？（一句话标题，1～3 个字左右，例如“被否定感”）",
      "interpretation": "对方可能的感受/解读，用具体生活化语言描述",
      "reason": "为什么会这么想（结合双方 MBTI 功能差异与沟通习惯，用大众能懂的说法）"
    }
  ],
  "replyOptions": [
    {
      "id": "短标签，例如 reassure、soft-boundary、direct-boundary 等（使用小写英文与短横线）",
      "label": "展示在按钮上的标题，例如“先安抚再解释”",
      "message": "≤90 字的完整回复文本，只写我会发出去的话，要自然、有温度",
      "whyBetter": "向用户解释：这个回复在情绪安抚、关系修复、边界表达上分别有什么好处，尽量具体",
      "toneGuide": "给用户的语气提示，例如“温柔 + 真诚解释 + 轻微边界”"
    }
  ]
}

补充要求：
- perceptionInsights 数量为 1～3 条。
- replyOptions 数量为 1～3 个。
- 如果你对对方的解读存在不确定性，可以在 reason 和 toneDiagnosis 中用“可能”“大概”来降低断言感。
`       .trim(),
      },
    ],
  };

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`大模型接口暂时不可用：${errorText}`);
  }

  const data = await response.json();
  const rawContent: string =
    data?.choices?.[0]?.message?.content?.trim() ?? '未获取到模型返回。';
  const cleaned = sanitizeBlock(rawContent);

  let parsed: AiPayload | null = null;

  try {
    parsed = JSON.parse(cleaned) as AiPayload;
  } catch {
    parsed = null;
  }

  if (!parsed) {
    return {
      toneDiagnosis: '模型返回格式异常，以下内容为原文供参考。',
      perceptionInsights: [],
      replyOptions: [
        {
          id: 'raw',
          label: '查看原文',
          message: cleaned,
          whyBetter: '模型未按格式返回，已展示完整原文供你参考。',
          toneGuide: '自由发挥',
        },
      ],
      raw: rawContent,
      createdAt: Date.now(),
    };
  }

  return {
    toneDiagnosis: parsed.toneDiagnosis || '整体语气分析暂缺，请关注回复内容本身。',
    perceptionInsights: normalizeArray(parsed.perceptionInsights),
    replyOptions: normalizeArray(parsed.replyOptions),
    raw: rawContent,
    createdAt: Date.now(),
  };
};
