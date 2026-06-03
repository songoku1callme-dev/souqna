import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type ToastType = 'success' | 'error' | 'info';
type ToastItem = { id: number; message: string; type: ToastType };

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, type });
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastView item={toast} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ item }: { item: ToastItem }) {
  const theme = useTheme();
  const config: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    success: { icon: 'checkmark-circle', color: theme.colors.success },
    error: { icon: 'alert-circle', color: theme.colors.danger },
    info: { icon: 'information-circle', color: theme.colors.primary },
  };
  const { icon, color } = config[item.type];

  return (
    <SafeAreaView edges={['bottom']} style={styles.wrapper} pointerEvents="none">
      <Animated.View
        entering={FadeInDown.springify().damping(18)}
        exiting={FadeOutDown}
        style={[
          styles.toast,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.md,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} />
        <Text variant="label" style={{ flex: 1 }}>
          {item.message}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
