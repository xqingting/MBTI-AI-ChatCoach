import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MBTI_CODES, getMBTIProfile, type MBTIType } from '@/constants/mbti';
import { useMemoryCapsule } from '@/hooks/useMemoryCapsule';
import {
  requestCoaching,
  type CoachingFocus,
  type ToneSetting,
  type CoachingResult,
  type ReplyOption,
} from '@/lib/coach';

type Option<T> = {
  id: T;
  title: string;
  caption: string;
};

type SetupForm = {
  myName: string;
  myMbti: MBTIType;
  partnerName: string;
  partnerMbti: MBTIType;
  relationshipTag: string;
};

const focusOptions: Option<CoachingFocus>[] = [
  {
    id: 'soothe',
    title: '先安抚',
    caption: '情绪先落地，再轻柔提需求',
  },
  {
    id: 'clarify',
    title: '澄清误会',
    caption: '结构化事实，保持尊重',
  },
  {
    id: 'co-create',
    title: '共创下一步',
    caption: '强调合作与共同目标',
  },
];

const toneOptions: Option<ToneSetting>[] = [
  {
    id: 'soft',
    title: '柔和',
    caption: '多用关怀语气与提问',
  },
  {
    id: 'balanced',
    title: '平衡',
    caption: '温度与清晰兼得',
  },
  {
    id: 'direct',
    title: '坦率',
    caption: '对事不对人地直说',
  },
];

const palette = {
  background: '#05060A',
  card: '#11121A',
  elevated: '#181B24',
  border: 'rgba(255,255,255,0.08)',
  text: '#F5F7FB',
  muted: '#9EA6C1',
  accent: '#9FD8FF',
  accentDark: '#4ECFE8',
  success: '#7BE0B8',
  warn: '#FFB679',
};

const TypeChip = ({
  label,
  active,
  onPress,
}: {
  label: MBTIType;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.typeChip, active && styles.typeChipActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}>
    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{label}</Text>
  </Pressable>
);

const OptionButton = <T,>({
  option,
  active,
  onPress,
}: {
  option: Option<T>;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.optionButton, active && styles.optionButtonActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}>
    <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{option.title}</Text>
    <Text style={[styles.optionCaption, active && styles.optionCaptionActive]}>
      {option.caption}
    </Text>
  </Pressable>
);

const ReplyChoiceButton = ({
  option,
  active,
  onPress,
}: {
  option: ReplyOption;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.replyOption, active && styles.replyOptionActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}>
    <View style={styles.replyOptionHeader}>
      <Text style={[styles.replyOptionLabel, active && styles.replyOptionLabelActive]}>
        {option.label}
      </Text>
      <Text style={styles.replyTone}>{option.toneGuide}</Text>
    </View>
    <Text style={[styles.replyMessage, active && styles.replyMessageActive]}>{option.message}</Text>
  </Pressable>
);

const AnalysisPanel = ({
  result,
  selectedReplyId,
  onSelect,
}: {
  result: CoachingResult;
  selectedReplyId: string | null;
  onSelect: (id: string) => void;
}) => {
  const selectedReply = result.replyOptions.find((item) => item.id === selectedReplyId) ?? null;
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const copyTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!selectedReply) {
      setCopyStatus('idle');
    }
    return () => {
      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
      }
    };
  }, [selectedReply]);

  const handleCopy = useCallback(async () => {
    if (!selectedReply) {
      return;
    }
    await Clipboard.setStringAsync(selectedReply.message);
    setCopyStatus('copied');
    if (copyTimer.current) {
      clearTimeout(copyTimer.current);
    }
    copyTimer.current = setTimeout(() => setCopyStatus('idle'), 1600);
  }, [selectedReply]);

  return (
  <View style={styles.analysisCard}>
    <View style={styles.analysisHeader}>
      <View>
        <Text style={styles.analysisEyebrow}>即时诊断</Text>
        <Text style={styles.analysisTitle}>{result.toneDiagnosis}</Text>
      </View>
      <Text style={styles.analysisTime}>
        {new Date(result.createdAt).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
    <View style={styles.optimisedContainer}>
      <Text style={styles.optimisedLabel}>对方可能的解读</Text>
      {result.perceptionInsights.length === 0 ? (
        <Text style={styles.detailBody}>暂无分析，直接参考候选回复。</Text>
      ) : (
        result.perceptionInsights.map((insight, index) => (
          <View key={`${insight.hook}-${index}`} style={styles.perceptionBlock}>
            <Text style={styles.badge}>{insight.hook}</Text>
            <Text style={styles.detailBody}>{insight.interpretation}</Text>
            <Text style={styles.detailHint}>为什么 · {insight.reason}</Text>
          </View>
        ))
      )}
    </View>

    <View style={styles.analysisSection}>
      <Text style={styles.sectionLabel}>候选回复（点选下方按钮）</Text>
      {result.replyOptions.length === 0 ? (
        <Text style={styles.detailBody}>暂无候选回复，请稍后重试。</Text>
      ) : (
        <View style={styles.replyList}>
          {result.replyOptions.map((option) => (
            <ReplyChoiceButton
              key={option.id}
              option={option}
              active={selectedReplyId === option.id}
              onPress={() => onSelect(option.id)}
            />
          ))}
        </View>
      )}
    </View>

    {selectedReply ? (
      <View style={styles.reasonCard}>
        <Text style={styles.reasonTitle}>为什么这样回复更好</Text>
        <Text style={styles.reasonBody}>{selectedReply.whyBetter}</Text>
        <Text style={styles.reasonTone}>语气提示 · {selectedReply.toneGuide}</Text>
        <View style={styles.reasonActions}>
          <Pressable style={styles.copyButton} onPress={handleCopy}>
            <Text style={styles.copyButtonText}>
              {copyStatus === 'copied' ? '已复制到剪贴板' : '复制这条回复'}
            </Text>
          </Pressable>
        </View>
      </View>
    ) : (
      <Text style={styles.hintText}>选择一个回复选项，即可看到背后的用意。</Text>
    )}
  </View>
)};

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

export default function HomeScreen() {
  const { memory, updateMemory, resetMemory, hydrated, loading } = useMemoryCapsule();
  const [focus, setFocus] = useState<CoachingFocus>('soothe');
  const [tone, setTone] = useState<ToneSetting>('balanced');
  const [analysis, setAnalysis] = useState<CoachingResult | null>(null);
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    incomingMessage: '',
    instinctiveReply: '',
    nuanceGoal: '',
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupForm, setSetupForm] = useState<SetupForm>({
    myName: memory.myName,
    myMbti: memory.myMbti,
    partnerName: memory.partnerName,
    partnerMbti: memory.partnerMbti,
    relationshipTag: memory.relationshipTag,
  });

  const partnerProfile = useMemo(
    () => getMBTIProfile(memory.partnerMbti),
    [memory.partnerMbti],
  );
  const myProfile = useMemo(() => getMBTIProfile(memory.myMbti), [memory.myMbti]);

  const incomingReady = draft.incomingMessage.trim().length > 0;
  const replyReady = draft.instinctiveReply.trim().length > 0;
  const readyToSend = incomingReady && replyReady;

  const setupReady =
    setupForm.myName.trim().length > 0 &&
    setupForm.partnerName.trim().length > 0 &&
    setupForm.relationshipTag.trim().length > 0;

  const onDraftChange = useCallback(
    (key: keyof typeof draft, value: string) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
      setError(null);
      setAnalysis(null);
      setSelectedReplyId(null);
    },
    [setDraft],
  );

  useEffect(() => {
    if (hydrated && !memory.isSetupComplete) {
      setShowSetupModal(true);
    }
  }, [hydrated, memory.isSetupComplete]);

  useEffect(() => {
    if (showSetupModal) {
      setSetupForm({
        myName: memory.myName,
        myMbti: memory.myMbti,
        partnerName: memory.partnerName,
        partnerMbti: memory.partnerMbti,
        relationshipTag: memory.relationshipTag,
      });
    }
  }, [showSetupModal, memory]);

  const handleSetupChange = useCallback(<K extends keyof SetupForm>(key: K, value: SetupForm[K]) => {
    setSetupForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSetupSubmit = useCallback(() => {
    if (!setupReady) {
      return;
    }
    updateMemory({
      ...setupForm,
      isSetupComplete: true,
    });
    setShowSetupModal(false);
  }, [setupForm, setupReady, updateMemory]);

  const handleSelectReply = useCallback((id: string) => {
    setSelectedReplyId(id);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!readyToSend) {
      setError('请先填写对方原话和自己的本能回复。');
      return;
    }
    if (!hydrated) {
      setError('记忆仍在同步，请稍等几秒。');
      return;
    }

    setIsRequesting(true);
    setError(null);

    try {
      const result = await requestCoaching({
        memory,
        conversation: {
          ...draft,
          focus: showAdvanced ? focus : null,
          tone: showAdvanced ? tone : null,
        },
      });
      setAnalysis(result);
      setSelectedReplyId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败，请稍后重试。');
    } finally {
      setIsRequesting(false);
    }
  }, [draft, focus, tone, memory, readyToSend, hydrated, showAdvanced]);
  return (
    <>
      <Modal animationType="fade" transparent visible={showSetupModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>先把彼此资料对齐</Text>
            <Text style={styles.modalSubtitle}>这些信息仅需填写一次，之后随时可在底部修改。</Text>
            <View style={styles.modalRow}>
              <View style={styles.modalColumn}>
                <Text style={styles.label}>我怎么称呼自己</Text>
                <TextInput
                  style={styles.input}
                  value={setupForm.myName}
                  onChangeText={(text) => handleSetupChange('myName', text)}
                  placeholder="我 / 小李 / Stella"
                  placeholderTextColor={palette.muted}
                />
              </View>
              <View style={styles.modalColumn}>
                <Text style={styles.label}>我怎么称呼 Ta</Text>
                <TextInput
                  style={styles.input}
                  value={setupForm.partnerName}
                  onChangeText={(text) => handleSetupChange('partnerName', text)}
                  placeholder="修修 / 同事 A"
                  placeholderTextColor={palette.muted}
                />
              </View>
            </View>
            <View style={styles.modalRow}>
              <View style={styles.modalColumn}>
                <Text style={styles.label}>我们的关系</Text>
                <TextInput
                  style={styles.input}
                  value={setupForm.relationshipTag}
                  onChangeText={(text) => handleSetupChange('relationshipTag', text)}
                  placeholder="恋人 / 业务搭子"
                  placeholderTextColor={palette.muted}
                />
              </View>
            </View>
            <Text style={[styles.selectorLabel, styles.modalSpacing]}>Ta 的 MBTI</Text>
            <View style={styles.typeGrid}>
              {MBTI_CODES.map((code) => (
                <TypeChip
                  key={`modal-partner-${code}`}
                  label={code}
                  active={setupForm.partnerMbti === code}
                  onPress={() => handleSetupChange('partnerMbti', code)}
                />
              ))}
            </View>
            <Text style={[styles.selectorLabel, styles.modalSpacing]}>我的 MBTI</Text>
            <View style={styles.typeGrid}>
              {MBTI_CODES.map((code) => (
                <TypeChip
                  key={`modal-self-${code}`}
                  label={code}
                  active={setupForm.myMbti === code}
                  onPress={() => handleSetupChange('myMbti', code)}
                />
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalSkip} onPress={() => setShowSetupModal(false)}>
                <Text style={styles.modalSkipText}>稍后再设</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSubmit, !setupReady && styles.submitButtonDisabled]}
                disabled={!setupReady}
                onPress={handleSetupSubmit}>
                <Text style={styles.submitText}>保存基础配置</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <LinearGradient colors={['#1A2341', '#080B14']} style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>MBTI 聊天器</Text>
            <Text style={styles.heroTitle}>一次设定，持续懂你们的频率</Text>
            <Text style={styles.heroSubtitle}>
              {hydrated
                ? '记忆已同步，可随时继续对话。'
                : loading
                  ? '正在唤醒记忆...'
                  : '设置后将自动记住双方偏好。'}
            </Text>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeEyebrow}>我</Text>
                <Text style={styles.heroBadgeLabel}>{memory.myMbti}</Text>
                <Text style={styles.heroBadgeText}>{myProfile?.archetype ?? '我的底色'}</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeEyebrow}>Ta</Text>
                <Text style={styles.heroBadgeLabel}>{memory.partnerMbti}</Text>
                <Text style={styles.heroBadgeText}>
                  {partnerProfile?.archetype ?? 'Ta 的轮廓'}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.card}>
            <SectionTitle title="聊天原料" subtitle="填入原话与本能，交给教练微调" />
            <Text style={styles.label}>对方刚说 / 打字了什么？</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              multiline
              value={draft.incomingMessage}
              onChangeText={(text) => onDraftChange('incomingMessage', text)}
              placeholder="复制对话或直接粘贴语音转文字..."
              placeholderTextColor={palette.muted}
            />
            <Text style={styles.label}>我当下的本能回复</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              multiline
              value={draft.instinctiveReply}
              onChangeText={(text) => onDraftChange('instinctiveReply', text)}
              placeholder="想脱口而出的回应，哪怕有点锋利也没关系"
              placeholderTextColor={palette.muted}
            />
            <Text style={styles.label}>想达到的氛围（可选）</Text>
            <TextInput
              style={styles.input}
              value={draft.nuanceGoal}
              onChangeText={(text) => onDraftChange('nuanceGoal', text)}
              placeholder="例如：温柔坚持底线 / 坦诚但不过度道歉"
              placeholderTextColor={palette.muted}
            />
          </View>

          <Pressable
            onPress={handleAnalyze}
            style={[
              styles.submitButton,
              (!readyToSend || isRequesting) && styles.submitButtonDisabled,
            ]}
            disabled={!readyToSend || isRequesting}>
            {isRequesting ? (
              <ActivityIndicator color="#0B1423" />
            ) : (
              <Text style={styles.submitText}>生成分析 & 优化表达</Text>
            )}
          </Pressable>
          {!readyToSend ? (
            <Text style={styles.hintText}>请先填入对方原话和你的本能回复，再点击生成。</Text>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {analysis ? (
            <AnalysisPanel
              result={analysis}
              selectedReplyId={selectedReplyId}
              onSelect={handleSelectReply}
            />
          ) : null}

          <View style={styles.card}>
            <SectionTitle title="基础设置" subtitle="需要修改时再展开，不占聊天区空间" />
            <View style={styles.memoryRow}>
              <View style={styles.memoryColumn}>
                <Text style={styles.label}>Ta 的称谓 / 角色</Text>
                <TextInput
                  style={styles.input}
                  value={memory.partnerName}
                  placeholder="例如：修修 / 同事 A"
                  placeholderTextColor={palette.muted}
                  onChangeText={(text) => updateMemory({ partnerName: text })}
                />
              </View>
              <View style={styles.memoryColumn}>
                <Text style={styles.label}>关系标签</Text>
                <TextInput
                  style={styles.input}
                  value={memory.relationshipTag}
                  placeholder="创意搭子 / 恋人"
                  placeholderTextColor={palette.muted}
                  onChangeText={(text) => updateMemory({ relationshipTag: text })}
                />
              </View>
            </View>
            <View style={styles.memoryRow}>
              <View style={styles.memoryColumn}>
                <Text style={styles.label}>我的称谓</Text>
                <TextInput
                  style={styles.input}
                  value={memory.myName}
                  placeholder="我 / Stella"
                  placeholderTextColor={palette.muted}
                  onChangeText={(text) => updateMemory({ myName: text })}
                />
              </View>
              <View style={styles.memoryColumn}>
                <Text style={styles.label}>背景碎片</Text>
                <TextInput
                  style={styles.input}
                  value={memory.conversationNotes}
                  placeholder="例：Ta 最近在冲刺项目"
                  placeholderTextColor={palette.muted}
                  onChangeText={(text) => updateMemory({ conversationNotes: text })}
                />
              </View>
            </View>
            <Text style={styles.selectorLabel}>Ta 的 MBTI</Text>
            <View style={styles.typeGrid}>
              {MBTI_CODES.map((code) => (
                <TypeChip
                  key={`settings-partner-${code}`}
                  label={code}
                  active={memory.partnerMbti === code}
                  onPress={() => updateMemory({ partnerMbti: code })}
                />
              ))}
            </View>
            <Text style={styles.selectorHint}>{partnerProfile?.vibe}</Text>

            <Text style={[styles.selectorLabel, styles.selectorSpacing]}>我的 MBTI</Text>
            <View style={styles.typeGrid}>
              {MBTI_CODES.map((code) => (
                <TypeChip
                  key={`settings-self-${code}`}
                  label={code}
                  active={memory.myMbti === code}
                  onPress={() => updateMemory({ myMbti: code })}
                />
              ))}
            </View>
            <Text style={styles.selectorHint}>{myProfile?.vibe}</Text>
            <Pressable style={styles.resetButton} onPress={resetMemory}>
              <Text style={styles.resetButtonText}>清空记忆并重新设定</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <SectionTitle title="高级设置" subtitle="默认交给教练判断，需要时再自定义语气" />
            {showAdvanced ? (
              <>
                <Text style={styles.selectorLabel}>对话目标</Text>
                <View style={styles.optionRow}>
                  {focusOptions.map((option) => (
                    <OptionButton
                      key={option.id}
                      option={option}
                      active={focus === option.id}
                      onPress={() => setFocus(option.id)}
                    />
                  ))}
                </View>
                <Text style={[styles.selectorLabel, styles.selectorSpacing]}>语气力度</Text>
                <View style={styles.optionRow}>
                  {toneOptions.map((option) => (
                    <OptionButton
                      key={option.id}
                      option={option}
                      active={tone === option.id}
                      onPress={() => setTone(option.id)}
                    />
                  ))}
                </View>
                <Pressable style={styles.advancedToggle} onPress={() => setShowAdvanced(false)}>
                  <Text style={styles.advancedToggleText}>收起高级设置</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.advancedCollapsed}>
                <Text style={styles.advancedHint}>
                  未开启时，教练会根据上下文自动判断语气与策略。
                </Text>
                <Pressable style={styles.advancedToggle} onPress={() => setShowAdvanced(true)}>
                  <Text style={styles.advancedToggleText}>打开语气控制</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.footerSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroEyebrow: {
    color: palette.accent,
    letterSpacing: 1,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 6,
  },
  heroSubtitle: {
    color: palette.muted,
    marginTop: 6,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  heroBadge: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  heroBadgeEyebrow: {
    color: palette.muted,
    fontSize: 12,
  },
  heroBadgeLabel: {
    color: palette.accent,
    fontWeight: '600',
  },
  heroBadgeText: {
    color: palette.text,
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    gap: 12,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: palette.muted,
    fontSize: 14,
  },
  memoryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  memoryColumn: {
    flex: 1,
    gap: 6,
  },
  label: {
    color: palette.muted,
    fontSize: 13,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.text,
    backgroundColor: palette.elevated,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  resetButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  resetButtonText: {
    color: palette.warn,
    fontWeight: '600',
  },
  advancedCollapsed: {
    gap: 12,
  },
  advancedHint: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  advancedToggle: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#151B27',
  },
  advancedToggleText: {
    color: palette.accent,
    fontWeight: '600',
  },
  selectorLabel: {
    color: palette.text,
    fontWeight: '600',
  },
  selectorHint: {
    color: palette.muted,
    marginTop: 6,
  },
  selectorSpacing: {
    marginTop: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  typeChipActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  typeChipText: {
    color: palette.muted,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#0A1628',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#181B24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    gap: 6,
  },
  optionButtonActive: {
    borderColor: palette.accent,
    backgroundColor: '#1F273A',
  },
  optionTitle: {
    color: palette.text,
    fontWeight: '600',
  },
  optionTitleActive: {
    color: palette.accent,
  },
  optionCaption: {
    color: palette.muted,
    fontSize: 13,
  },
  optionCaptionActive: {
    color: palette.text,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: palette.accent,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#0A1628',
    fontWeight: '700',
    fontSize: 16,
  },
  hintText: {
    color: palette.muted,
    marginTop: 8,
    fontSize: 13,
  },
  errorText: {
    color: '#FF9E9E',
    marginTop: 10,
  },
  analysisCard: {
    backgroundColor: '#0D111A',
    padding: 20,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(159,216,255,0.25)',
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  analysisEyebrow: {
    color: palette.accent,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  analysisTitle: {
    color: palette.text,
    fontSize: 18,
    marginTop: 4,
  },
  analysisTime: {
    color: palette.muted,
    fontSize: 13,
  },
  optimisedContainer: {
    backgroundColor: '#131A2A',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(159,216,255,0.3)',
    gap: 8,
  },
  optimisedLabel: {
    color: palette.accent,
    fontSize: 13,
  },
  analysisSection: {
    gap: 10,
  },
  sectionLabel: {
    color: palette.text,
    fontWeight: '600',
    fontSize: 15,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(159,216,255,0.15)',
    borderRadius: 99,
    color: palette.accent,
    fontSize: 12,
  },
  detailBody: {
    color: palette.text,
    fontSize: 14,
  },
  detailHint: {
    color: palette.muted,
  },
  perceptionBlock: {
    backgroundColor: '#111A24',
    borderRadius: 16,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  replyList: {
    gap: 12,
  },
  replyOption: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#101522',
    gap: 8,
  },
  replyOptionActive: {
    borderColor: palette.accent,
    backgroundColor: 'rgba(159,216,255,0.15)',
  },
  replyOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyOptionLabel: {
    color: palette.text,
    fontWeight: '600',
    fontSize: 15,
  },
  replyOptionLabelActive: {
    color: palette.accent,
  },
  replyTone: {
    color: palette.muted,
    fontSize: 12,
  },
  replyMessage: {
    color: palette.text,
    lineHeight: 20,
  },
  replyMessageActive: {
    color: palette.text,
  },
  reasonCard: {
    backgroundColor: '#111A23',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(159,216,255,0.3)',
    gap: 8,
  },
  reasonTitle: {
    color: palette.text,
    fontWeight: '600',
    fontSize: 15,
  },
  reasonBody: {
    color: palette.text,
    lineHeight: 20,
  },
  reasonTone: {
    color: palette.muted,
    fontSize: 12,
  },
  reasonActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  copyButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(159,216,255,0.1)',
  },
  copyButtonText: {
    color: palette.accent,
    fontWeight: '600',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0F1524',
    borderRadius: 28,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '600',
  },
  modalSubtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalColumn: {
    flex: 1,
    gap: 6,
  },
  modalSpacing: {
    marginTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalSkip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalSkipText: {
    color: palette.muted,
    fontWeight: '600',
  },
  modalSubmit: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.accent,
  },
  footerSpace: {
    height: 30,
  },
});
