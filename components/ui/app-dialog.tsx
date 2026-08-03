import Feather from '@expo/vector-icons/Feather';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';
import { AppText } from './app-text';
import { AppButton, type ButtonVariant } from './button';
import { MascotIllustration, type MascotExpression } from './mascot-illustration';

type AppDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel?: string;
  primaryIcon?: keyof typeof Feather.glyphMap;
  primaryVariant?: ButtonVariant;
  mascotExpression?: MascotExpression;
  onPrimary: () => void;
  onClose: () => void;
};

export function AppDialog({
  visible,
  title,
  message,
  primaryLabel,
  secondaryLabel,
  primaryIcon = 'arrow-right',
  primaryVariant = 'primary',
  mascotExpression = 'empty',
  onPrimary,
  onClose,
}: AppDialogProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <View style={styles.root}>
        <Pressable
          accessibilityLabel="Close dialog"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View accessibilityViewIsModal style={styles.card}>
          <Pressable
            accessibilityLabel="Close dialog"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <Feather color={Colors.textMuted} name="x" size={18} />
          </Pressable>
          <MascotIllustration
            expression={mascotExpression}
            size={124}
            style={styles.mascot}
          />
          <AppText style={styles.title} variant="heading">
            {title}
          </AppText>
          <AppText style={styles.message} tone="muted" variant="body">
            {message}
          </AppText>
          <View style={styles.actions}>
            <AppButton
              fullWidth
              icon={primaryIcon}
              label={primaryLabel}
              onPress={onPrimary}
              variant={primaryVariant}
            />
            {secondaryLabel ? (
              <AppButton
                fullWidth
                label={secondaryLabel}
                onPress={onClose}
                style={styles.secondaryAction}
                variant="ghost"
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing[5],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 31, 25, 0.48)',
  },
  card: {
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: Radii.xl,
    borderWidth: 1,
    maxWidth: 400,
    padding: Spacing[6],
    width: '100%',
    ...Shadows.soft,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing[4],
    top: Spacing[4],
    width: 36,
  },
  mascot: {
    marginBottom: Spacing[4],
  },
  title: {
    textAlign: 'center',
  },
  message: {
    marginTop: Spacing[2],
    maxWidth: 300,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: Spacing[1],
    marginTop: Spacing[6],
  },
  secondaryAction: {
    minHeight: 44,
  },
  pressed: {
    opacity: 0.62,
  },
});
