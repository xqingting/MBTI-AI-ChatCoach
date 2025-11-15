import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MBTI_GROUPS, getMBTIProfile } from '@/constants/mbti';

const palette = {
  background: '#05060A',
  card: '#11121A',
  border: 'rgba(255,255,255,0.08)',
  text: '#F6F7FB',
  muted: '#9EA6C1',
  accent: '#8DD8FF',
};

export default function GuideScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>MBTI 速查手册</Text>
          <Text style={styles.heroTitle}>用语言对齐双方的能量频段</Text>
          <Text style={styles.heroSubtitle}>
            每张卡片记录一个类型的沟通偏好、常见误解与舒缓方法。发消息前翻一下，
            让表达直接落在对方能接住的点上。
          </Text>
        </View>

        {MBTI_GROUPS.map((group) => (
          <View key={group.id} style={styles.groupCard}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Text style={styles.groupSubtitle}>{group.description}</Text>
            {group.members.map((code) => {
              const profile = getMBTIProfile(code);
              if (!profile) {
                return null;
              }
              return (
                <View key={code} style={styles.profileBlock}>
                  <View style={styles.profileHeader}>
                    <View style={styles.profileBadge}>
                      <Text style={styles.badgeCode}>{profile.code}</Text>
                    </View>
                    <View style={styles.headerText}>
                      <Text style={styles.profileTitle}>{profile.archetype}</Text>
                      <Text style={styles.profileVibe}>{profile.vibe}</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.profileLabel}>冲突盲点</Text>
                  <Text style={styles.profileBody}>{profile.conflictStyle}</Text>
                  <Text style={styles.profileLabel}>舒缓密钥</Text>
                  <Text style={styles.profileBody}>{profile.soothingSignal}</Text>
                  <Text style={styles.profileLabel}>成长方向</Text>
                  <Text style={styles.profileHint}>{profile.growthFocus}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  hero: {
    backgroundColor: '#111A29',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 10,
  },
  heroEyebrow: {
    color: palette.accent,
    letterSpacing: 1,
    fontSize: 12,
  },
  heroTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '600',
  },
  heroSubtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  groupCard: {
    backgroundColor: palette.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
  },
  groupTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '600',
  },
  groupSubtitle: {
    color: palette.muted,
    lineHeight: 20,
  },
  profileBlock: {
    marginTop: 10,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#151A24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  profileBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(141,216,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCode: {
    color: palette.accent,
    fontWeight: '700',
    fontSize: 16,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  profileTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  profileVibe: {
    color: palette.muted,
  },
  profileLabel: {
    color: palette.accent,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  profileBody: {
    color: palette.text,
    lineHeight: 20,
  },
  profileHint: {
    color: palette.muted,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
