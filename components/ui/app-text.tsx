import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Typography } from '@/constants/theme';

type TextVariant = keyof typeof Typography;
type TextTone = 'default' | 'muted' | 'subtle' | 'inverse' | 'accent';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

const toneColors: Record<TextTone, string> = {
  default: Colors.charcoal,
  muted: Colors.textMuted,
  subtle: Colors.textSubtle,
  inverse: Colors.white,
  accent: Colors.forest,
};

export function AppText({ variant = 'body', tone = 'default', style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[styles.base, Typography[variant], { color: toneColors[tone] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: undefined,
  },
});
