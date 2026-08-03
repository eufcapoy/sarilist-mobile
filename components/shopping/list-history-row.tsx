import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import type { ShoppingList } from '@/types/shopping';

function formatUpdatedAt(timestamp?: number) {
  if (!timestamp) return 'Saved recently';
  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const days = Math.round(minutes / 1440);
  if (days <= 1) return 'Updated yesterday';
  return `Updated ${days} days ago`;
}

type ListHistoryRowProps = {
  list: ShoppingList;
  onPress: () => void;
  onMorePress?: () => void;
  showDivider?: boolean;
};

export function ListHistoryRow({
  list,
  onPress,
  onMorePress,
  showDivider = false,
}: ListHistoryRowProps) {
  const handled = list.items.filter((item) => item.purchased || item.unavailable).length;
  const finished = Boolean(list.finishedAt);

  return (
    <View>
      <Pressable
        accessibilityHint={finished ? 'Opens this trip summary' : 'Resumes shopping'}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={[styles.icon, finished && styles.iconFinished]}>
          <Feather
            color={finished ? Colors.forest : Colors.leaf}
            name={finished ? 'check' : 'shopping-bag'}
            size={20}
          />
        </View>
        <View style={styles.copy}>
          <AppText numberOfLines={1} variant="bodyMedium">{list.name}</AppText>
          <AppText numberOfLines={1} tone="muted" variant="caption">
            {formatUpdatedAt(list.updatedAt)}
          </AppText>
        </View>
        <View style={styles.meta}>
          <AppText tone={finished ? 'accent' : 'muted'} variant="label">
            {finished ? 'Done' : `${handled}/${list.items.length}`}
          </AppText>
          {onMorePress ? (
            <Pressable
              accessibilityLabel={`More actions for ${list.name}`}
              accessibilityRole="button"
              hitSlop={6}
              onPress={(event) => {
                event.stopPropagation();
                onMorePress();
              }}
              style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}>
              <Feather color={Colors.textMuted} name="more-vertical" size={19} />
            </Pressable>
          ) : null}
        </View>
      </Pressable>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', minHeight: 72, paddingHorizontal: Spacing[3] },
  icon: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.md,
    height: 40,
    justifyContent: 'center',
    marginRight: Spacing[3],
    width: 40,
  },
  iconFinished: { backgroundColor: Colors.forestSoft },
  copy: { flex: 1 },
  meta: { alignItems: 'center', flexDirection: 'row', gap: Spacing[1], marginLeft: Spacing[2] },
  moreButton: { alignItems: 'center', height: 38, justifyContent: 'center', width: 32 },
  divider: { backgroundColor: Colors.border, height: StyleSheet.hairlineWidth, marginLeft: 64 },
  pressed: { opacity: 0.68 },
});
