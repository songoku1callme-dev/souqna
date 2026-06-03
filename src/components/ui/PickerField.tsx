import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { Sheet } from './Sheet';
import { Text } from './Text';

export type PickerOption = { value: string; label: string };

export type PickerFieldProps = {
  label?: string;
  placeholder: string;
  value: string | null;
  options: PickerOption[];
  onChange: (value: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  sheetTitle?: string;
};

export function PickerField({
  label,
  placeholder,
  value,
  options,
  onChange,
  icon,
  sheetTitle,
}: PickerFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? (
        <Text variant="label" color="textMuted">
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          minHeight: 50,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        }}
      >
        {icon ? <Ionicons name={icon} size={18} color={theme.colors.textMuted} /> : null}
        <Text variant="body" color={selected ? 'text' : 'textMuted'} style={{ flex: 1 }}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <Sheet visible={open} onClose={() => setOpen(false)} title={sheetTitle ?? placeholder}>
        <View style={{ gap: theme.spacing.sm }}>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: theme.spacing.md,
                  borderRadius: theme.radii.md,
                  backgroundColor: active ? theme.colors.primaryMuted : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                }}
              >
                <Text variant="body">{option.label}</Text>
                {active ? (
                  <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}
