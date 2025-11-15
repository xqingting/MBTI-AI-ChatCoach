import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MBTIType } from '@/constants/mbti';

const STORAGE_KEY = 'MBTI_CHAT_MEMORY_V1';

export type MemorySnapshot = {
  myName: string;
  myMbti: MBTIType;
  partnerName: string;
  partnerMbti: MBTIType;
  relationshipTag: string;
  conversationNotes: string;
  isSetupComplete: boolean;
};

export const DEFAULT_MEMORY: MemorySnapshot = {
  myName: '',
  myMbti: 'INFJ',
  partnerName: '',
  partnerMbti: 'ENTP',
  relationshipTag: '创意搭子',
  conversationNotes: '',
  isSetupComplete: false,
};

export const useMemoryCapsule = () => {
  const [memory, setMemory] = useState<MemorySnapshot>(DEFAULT_MEMORY);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveJob = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!value) {
          return;
        }
        try {
          const parsed = JSON.parse(value) as Partial<MemorySnapshot>;
          if (isMounted) {
            const merged = { ...DEFAULT_MEMORY, ...parsed };
            const inferredSetup =
              typeof parsed.isSetupComplete === 'boolean'
                ? parsed.isSetupComplete
                : Boolean(parsed.partnerName || parsed.myName || parsed.relationshipTag);
            setMemory({ ...merged, isSetupComplete: inferredSetup });
          }
        } catch {
          AsyncStorage.removeItem(STORAGE_KEY).catch(() => {
            // noop - already resetting below
          });
          if (isMounted) {
            setMemory(DEFAULT_MEMORY);
            setError('记忆格式异常，已为你重置。');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('读取记忆失败，请稍后重试。');
        }
      })
      .finally(() => {
        if (isMounted) {
          setHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (saveJob.current) {
      clearTimeout(saveJob.current);
    }

    saveJob.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memory)).catch(() => {
        setError('保存记忆失败，但不会影响继续使用。');
      });
    }, 350);

    return () => {
      if (saveJob.current) {
        clearTimeout(saveJob.current);
      }
    };
  }, [memory, hydrated]);

  const updateMemory = useCallback((patch: Partial<MemorySnapshot>) => {
    setMemory((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetMemory = useCallback(() => {
    setMemory(DEFAULT_MEMORY);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {
      setError('清空记忆失败，请重新尝试。');
    });
  }, []);

  const completeSetup = useCallback(() => {
    setMemory((prev) => ({ ...prev, isSetupComplete: true }));
  }, []);

  return {
    memory,
    updateMemory,
    resetMemory,
    completeSetup,
    hydrated,
    loading: !hydrated && !error,
    error,
  };
};
