type Quadrant = 'NT' | 'NF' | 'SJ' | 'SP';

type MBTISeed = {
  code: string;
  archetype: string;
  vibe: string;
  conflictStyle: string;
  soothingSignal: string;
  growthFocus: string;
  quadrant: Quadrant;
};

export const MBTI_LIBRARY = [
  {
    code: 'INTJ',
    archetype: '暗夜制图师',
    vibe: '沉静而高维，喜欢在脑中先推演三步之后的棋局再开口。',
    conflictStyle: '把关心伪装成改进建议，语气容易被理解成冷酷审判。',
    soothingSignal: '给出逻辑框架、说明“我在意你”的动机，再进入方案。',
    growthFocus: '放慢节奏，允许感受存在，不要急着修复所有问题。',
    quadrant: 'NT',
  },
  {
    code: 'INTP',
    archetype: '洞察解构师',
    vibe: '以概念游戏为乐，喜欢拆解前提与定义来获得清晰感。',
    conflictStyle: '嘴角带着“其实逻辑不通”的笑，听者容易觉得被否定个人。',
    soothingSignal: '先快速承认对方投入，再邀请一起调试系统。',
    growthFocus: '学会把抽象推理翻译成生活化比喻，降低被距离感。',
    quadrant: 'NT',
  },
  {
    code: 'ENTJ',
    archetype: '执行指挥家',
    vibe: '天然扫描瓶颈，语速快、目标感强，擅长集结资源。',
    conflictStyle: '把急迫感直接砸在对方身上，会被体验成命令或否定。',
    soothingSignal: '说明对方价值、表达信任，再对事不对人地拆解问题。',
    growthFocus: '放松控制欲，练习双向提问而不是单向指挥。',
    quadrant: 'NT',
  },
  {
    code: 'ENTP',
    archetype: '灵感黑客',
    vibe: '永远在点子与反面点子之间跳跃，喜欢辩论激发火花。',
    conflictStyle: '为了脑内乐趣而抛反驳，忽略了对方的情绪安全。',
    soothingSignal: '先表态“我站你这边”，再邀请一起玩创意脑暴。',
    growthFocus: '适度收束，确认对方是否准备好讨论变量。',
    quadrant: 'NT',
  },
  {
    code: 'INFJ',
    archetype: '洞察翻译官',
    vibe: '捕捉氛围与情绪暗流，表达含蓄却期待深度连结。',
    conflictStyle: '闷声累积，突然抛出一整份“情绪论文”让人措手不及。',
    soothingSignal: '用“我感到…”而不是“你总是…”的句式来展开观察。',
    growthFocus: '允许自己直接提出需求，不要靠暗示等待被读懂。',
    quadrant: 'NF',
  },
  {
    code: 'INFP',
    archetype: '意义守望者',
    vibe: '重视价值观与真诚，语言柔软却极在意被理解。',
    conflictStyle: '遇压会退回内心世界，外界只看到冷淡与回避。',
    soothingSignal: '温柔肯定其动机，邀请描述感受细节再谈解决。',
    growthFocus: '在表达边界时带上事实例子，帮他人理解你的底线。',
    quadrant: 'NF',
  },
  {
    code: 'ENFJ',
    archetype: '关系引导师',
    vibe: '擅调动群体情绪，习惯把大家的需求排表优先处理。',
    conflictStyle: '过度承担导致累积怨气，爆发时像放大版的无助。',
    soothingSignal: '允许自己讲“我也需要...”，并请求对方承担具体动作。',
    growthFocus: '练习慢半拍回应，别急着给出解决方案。',
    quadrant: 'NF',
  },
  {
    code: 'ENFP',
    archetype: '火花召唤师',
    vibe: '热情外放，感知机会与人心，喜欢把点子变成冒险。',
    conflictStyle: '情绪上头时语言失准，容易让人觉得夸大或不可靠。',
    soothingSignal: '先稳住自己的节奏，用简短句子表达核心需求。',
    growthFocus: '建立小型执行仪式，让灵感可以落地成具体请求。',
    quadrant: 'NF',
  },
  {
    code: 'ISTJ',
    archetype: '秩序维护者',
    vibe: '沉稳、注重事实细节，用可靠行动表达关心。',
    conflictStyle: '以“规则就是规则”回应情绪，显得僵硬冷漠。',
    soothingSignal: '把情绪翻译成可执行的清单或时间表就能安心。',
    growthFocus: '练习先回应感受，再回到任务，否则像机器人。',
    quadrant: 'SJ',
  },
  {
    code: 'ISFJ',
    archetype: '温度档案师',
    vibe: '记得每个人的习惯，以温柔的照料堆积安全感。',
    conflictStyle: '委屈久了突然爆哭，让对方难以追溯问题源头。',
    soothingSignal: '肯定其投入，邀请一起列出“我能怎么帮”的菜单。',
    growthFocus: '设置界限并提前说“不行”，别等到能量见底。',
    quadrant: 'SJ',
  },
  {
    code: 'ESTJ',
    archetype: '系统执行官',
    vibe: '行动力极强，喜欢一步步推进流程与标准。',
    conflictStyle: '把意见当事实宣判，忽略对方的感受维度。',
    soothingSignal: '说明期望背后的价值，再请对方补充遗漏信息。',
    growthFocus: '对自己说慢一点，留出聆听空间就会更有威信。',
    quadrant: 'SJ',
  },
  {
    code: 'ESFJ',
    archetype: '体贴协调者',
    vibe: '喜欢让所有人感到被照顾，以人情网络稳住局面。',
    conflictStyle: '为了和谐压抑真实想法，最后变成委婉的抱怨。',
    soothingSignal: '用具体语言而非暗示，告诉对方你期待的反馈。',
    growthFocus: '先确认自己想要什么，再去满足别人。',
    quadrant: 'SJ',
  },
  {
    code: 'ISTP',
    archetype: '冷静调参师',
    vibe: '敏锐洞察系统、喜动手修复，偏好直接而简洁的互动。',
    conflictStyle: '被情绪淹没时直接退场，显得不在乎。',
    soothingSignal: '给他空间整理，再用要点式信息重新接入对话。',
    growthFocus: '把“我需要暂停”说出来，减少神秘消失感。',
    quadrant: 'SP',
  },
  {
    code: 'ISFP',
    archetype: '感官诗人',
    vibe: '通过体验表达自我，珍惜当下、追求美好细节。',
    conflictStyle: '讨厌正面冲突，会以疏离让对方“自己懂”。',
    soothingSignal: '营造温和环境并询问“你现在最在意哪一块？”。',
    growthFocus: '学习用简单直白的句子声明界线，才不会被猜测。',
    quadrant: 'SP',
  },
  {
    code: 'ESTP',
    archetype: '情境应变家',
    vibe: '当下感十足，擅即兴解决危机，也热衷社交舞台。',
    conflictStyle: '为了赢当下辩论而忽略长期信任，语气过猛。',
    soothingSignal: '先肯定对方贡献，再一起找“下一步的赢法”。',
    growthFocus: '慢半拍回应，别把真心话当作竞技场。',
    quadrant: 'SP',
  },
  {
    code: 'ESFP',
    archetype: '能量扩散者',
    vibe: '以热情点亮场域，敏感于他人的即时反应。',
    conflictStyle: '被忽视时会通过戏剧化语言争取注意力。',
    soothingSignal: '承诺会继续连线，并给出明确时间或行动。',
    growthFocus: '帮自己整理重点，用两三句完成表达。',
    quadrant: 'SP',
  },
] as const satisfies readonly MBTISeed[];

export type MBTIType = (typeof MBTI_LIBRARY)[number]['code'];

export type MBTIProfile = Extract<(typeof MBTI_LIBRARY)[number], { code: MBTIType }>;

export const MBTI_CODES = MBTI_LIBRARY.map((entry) => entry.code) as MBTIType[];

export const QUADRANT_META: Record<
  Quadrant,
  { title: string; description: string }
> = {
  NT: {
    title: 'NT · 战略与结构',
    description: '逻辑 + 愿景驱动，渴望高效、精确与长期影响。',
  },
  NF: {
    title: 'NF · 共情与意义',
    description: '重视人心与价值，语言承载情感温度与理想感。',
  },
  SJ: {
    title: 'SJ · 稳定与秩序',
    description: '以责任和记忆守护日常，追求安全、可靠、可预期。',
  },
  SP: {
    title: 'SP · 体验与敏捷',
    description: '在即时体验中迭代，强调灵活、感官与现实反馈。',
  },
};

export const MBTI_GROUPS = (Object.keys(QUADRANT_META) as Quadrant[]).map((key) => ({
  id: key,
  ...QUADRANT_META[key],
  members: MBTI_LIBRARY.filter((item) => item.quadrant === key).map((item) => item.code as MBTIType),
}));

export const getMBTIProfile = (code: MBTIType) =>
  MBTI_LIBRARY.find((profile) => profile.code === code);
