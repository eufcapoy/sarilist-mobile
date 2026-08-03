import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';
import { AppText } from './app-text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type AppButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  icon?: keyof typeof Feather.glyphMap;
  fullWidth?: boolean;
};

export function AppButton({
  label,
  variant = 'primary',
  icon,
  fullWidth = false,
  disabled,
  accessibilityState,
  onPress,
  style,
  ...props
}: AppButtonProps) {
  const isEmphasized = variant === 'primary' || variant === 'danger';
  const foreground = isEmphasized ? Colors.white : Colors.forest;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={(event) => {
        void Haptics.selectionAsync();
        onPress?.(event);
      }}
      style={(state) => {
        const { pressed } = state;

        return [
          styles.base,
          styles[variant],
          fullWidth && styles.fullWidth,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
          typeof style === 'function' ? style(state) : style,
        ];
      }}
      {...props}>
      <View style={styles.content}>
        {icon ? <Feather color={foreground} name={icon} size={19} /> : null}
        <AppText
          adjustsFontSizeToFit
          minimumFontScale={0.88}
          numberOfLines={1}
          variant="bodyMedium"
          style={{ color: foreground }}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing[4],
  },
  primary: {
    backgroundColor: Colors.forest,
  },
  secondary: {
    backgroundColor: Colors.creamLight,
    borderColor: Colors.borderStrong,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing[2],
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
