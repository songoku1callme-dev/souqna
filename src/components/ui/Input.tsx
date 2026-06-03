import { forwardRef } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  type TextInputProps,
  type View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: object;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, icon, containerStyle, style, multiline, ...rest },
  ref,
) {
  const theme = useTheme();

  return (
    <View style={[{ gap: theme.spacing.xs }, containerStyle]}>
      {label ? (
        <Text variant="label" color="textMuted">
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radii.md,
            paddingHorizontal: theme.spacing.md,
            minHeight: multiline ? 96 : 50,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={theme.colors.textMuted}
            style={{ marginEnd: theme.spacing.sm, marginTop: multiline ? 14 : 0 }}
          />
        ) : null}
        <TextInput
          ref={ref}
          multiline={multiline}
          placeholderTextColor={theme.colors.textMuted}
          style={[
            {
              flex: 1,
              color: theme.colors.text,
              fontSize: theme.fontSize.md,
              paddingVertical: multiline ? theme.spacing.md : theme.spacing.sm,
              textAlign: 'auto',
              writingDirection: 'auto',
              textAlignVertical: multiline ? 'top' : 'center',
            },
            style,
          ]}
          {...rest}
        />
      </View>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    borderWidth: 1,
  },
});

export type { RNView };
