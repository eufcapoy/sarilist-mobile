import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScanStateSwitcher } from '@/components/scan/scan-state-switcher';
import { QuantityUnitControl } from '@/components/shopping/quantity-unit-control';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/button';
import { MascotIllustration } from '@/components/ui/mascot-illustration';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Surface } from '@/components/ui/surface';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { mockScannedItems } from '@/data/mock-scan';
import { useShoppingList } from '@/state/shopping-list-context';
import type { ScannedItem, ScanStatus } from '@/types/scan';

function cloneMockItems() {
  return mockScannedItems.map((item) => ({ ...item }));
}

type PhotoSource = 'camera' | 'library' | 'sample';

type SelectedPhoto = {
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
};

export default function ReviewScanScreen() {
  const router = useRouter();
  const { setActiveList } = useShoppingList();
  const { height, width } = useWindowDimensions();
  const compact = width < 380 || height < 700;
  const [status, setStatus] = useState<ScanStatus>('empty');
  const [items, setItems] = useState<ScannedItem[]>(cloneMockItems);
  const [photo, setPhoto] = useState<SelectedPhoto>();
  const [lastSource, setLastSource] = useState<PhotoSource>('sample');
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [errorTitle, setErrorTitle] = useState("We couldn't read that");
  const [errorMessage, setErrorMessage] = useState(
    'The photo may be blurry or too dark. Try again with the full note inside the frame.',
  );

  useEffect(() => {
    let active = true;

    void ImagePicker.getPendingResultAsync()
      .then((pendingResult) => {
        if (!active || !pendingResult) return;

        if ('code' in pendingResult) {
          setErrorTitle('Photo recovery failed');
          setErrorMessage('Android could not restore the selected photo. Please choose it again.');
          setLastSource('library');
          setStatus('error');
          return;
        }

        if (!pendingResult.canceled && pendingResult.assets[0]) {
          const asset = pendingResult.assets[0];
          setPhoto({
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
            fileName: asset.fileName,
          });
          setStatus('empty');
        }
      })
      .catch(() => {
        if (!active) return;
        setErrorTitle('Photo recovery failed');
        setErrorMessage('The previous photo could not be restored. Please choose it again.');
        setLastSource('library');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      return;
    }

    const timer = setTimeout(() => {
      setItems(cloneMockItems());
      setStatus('success');
    }, 1400);

    return () => clearTimeout(timer);
  }, [status]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }

  function selectState(nextStatus: ScanStatus) {
    setPermissionBlocked(false);
    if (nextStatus === 'empty') {
      setPhoto(undefined);
    }
    if (nextStatus === 'error') {
      setLastSource('sample');
      setErrorTitle("We couldn't read that");
      setErrorMessage('The photo may be blurry or too dark. Try again with the full note inside the frame.');
    }
    if (nextStatus === 'success') {
      setItems(cloneMockItems());
    }
    setStatus(nextStatus);
    void Haptics.selectionAsync();
  }

  function applyPickerResult(result: ImagePicker.ImagePickerResult) {
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPhoto({ uri: asset.uri, width: asset.width, height: asset.height, fileName: asset.fileName });
    setPermissionBlocked(false);
    setStatus('empty');
    void Haptics.selectionAsync();
  }

  function showPermissionError(source: Exclude<PhotoSource, 'sample'>, canAskAgain: boolean) {
    const camera = source === 'camera';
    setLastSource(source);
    setPermissionBlocked(!canAskAgain);
    setErrorTitle(camera ? 'Camera access is off' : 'Photo access is off');
    setErrorMessage(
      canAskAgain
        ? `Allow SariList to access your ${camera ? 'camera' : 'photos'}, then try again.`
        : `Open your device settings and allow SariList to access your ${camera ? 'camera' : 'photos'}.`,
    );
    setStatus('error');
  }

  function showPickerError(source: Exclude<PhotoSource, 'sample'>) {
    setLastSource(source);
    setPermissionBlocked(false);
    setErrorTitle('Photo could not be opened');
    setErrorMessage('Something interrupted the photo picker. Your list is safe, so please try again.');
    setStatus('error');
  }

  async function takePhoto() {
    setLastSource('camera');
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showPermissionError('camera', permission.canAskAgain);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        cameraType: ImagePicker.CameraType.back,
        mediaTypes: ['images'],
        quality: 0.85,
      });
      applyPickerResult(result);
    } catch {
      showPickerError('camera');
    }
  }

  async function choosePhoto() {
    setLastSource('library');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showPermissionError('library', permission.canAskAgain);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ['images'],
        quality: 0.85,
      });
      applyPickerResult(result);
    } catch {
      showPickerError('library');
    }
  }

  function useSamplePhoto() {
    setLastSource('sample');
    setPermissionBlocked(false);
    setPhoto(undefined);
    setStatus('loading');
  }

  function retryAfterError() {
    if (permissionBlocked) {
      void Linking.openSettings();
      return;
    }
    if (lastSource === 'camera') void takePhoto();
    else if (lastSource === 'library') void choosePhoto();
    else setStatus('loading');
  }

  function updateItem(id: string, updates: Partial<ScannedItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  function continueToList() {
    setActiveList({
      id: `scan-${Date.now()}`,
      name: 'Scanned restock list',
      budget: 0,
      items: items.map((item) => ({
        id: item.id,
        productName: item.name.trim() || item.originalText,
        originalText: item.originalText,
        quantity: item.quantity,
        unit: item.unit,
        purchased: false,
        unavailable: false,
        ocrConfidence: item.confidence,
      })),
    });
    router.push({ pathname: '/new-list', params: { source: 'scan' } });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.frame}>
        <View style={[styles.headerWrap, compact && styles.horizontalCompact]}>
          <ScreenHeader onBack={goBack} subtitle="Check before adding" title="Review scan" />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            compact && styles.contentCompact,
            compact && styles.horizontalCompact,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ScanStateSwitcher onChange={selectState} value={status} />

          {status === 'empty' ? (
            photo ? (
              <Surface style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewCopy}>
                    <AppText variant="heading">Ready to review</AppText>
                    <AppText numberOfLines={1} tone="muted" variant="caption">
                      {photo.fileName ?? 'Selected handwritten list'}
                    </AppText>
                  </View>
                  <Pressable
                    accessibilityLabel="Remove selected photo"
                    accessibilityRole="button"
                    onPress={() => setPhoto(undefined)}
                    style={({ pressed }) => [styles.removePhotoButton, pressed && styles.pressed]}>
                    <Feather color={Colors.textMuted} name="x" size={18} />
                  </Pressable>
                </View>
                <View style={styles.previewImageWrap}>
                  <Image
                    accessibilityIgnoresInvertColors
                    accessibilityLabel="Selected handwritten list"
                    resizeMode="contain"
                    source={{ uri: photo.uri }}
                    style={[styles.previewImage, compact && styles.previewImageCompact]}
                  />
                </View>
                <View style={styles.replaceActions}>
                  <AppButton
                    icon="camera"
                    label="Retake"
                    onPress={() => void takePhoto()}
                    style={styles.replaceButton}
                    variant="secondary"
                  />
                  <AppButton
                    icon="image"
                    label="Replace"
                    onPress={() => void choosePhoto()}
                    style={styles.replaceButton}
                    variant="secondary"
                  />
                </View>
                <AppButton
                  fullWidth
                  icon="search"
                  label="Review this photo"
                  onPress={() => setStatus('loading')}
                  style={styles.reviewButton}
                />
                <AppText style={styles.privacyNote} tone="subtle" variant="caption">
                  Recognition is mocked for now; the selected image stays on your device.
                </AppText>
              </Surface>
            ) : (
              <Surface style={styles.stateCard}>
                <MascotIllustration expression="empty" size={136} style={styles.stateMascot} />
                <AppText style={styles.centeredText} variant="heading">Add your handwritten list</AppText>
                <AppText style={styles.stateMessage} tone="muted">
                  Keep the full note inside the frame and use bright, even lighting.
                </AppText>
                <AppButton
                  icon="camera"
                  label="Take a photo"
                  onPress={() => void takePhoto()}
                  style={styles.stateButton}
                />
                <AppButton
                  icon="image"
                  label="Choose from gallery"
                  onPress={() => void choosePhoto()}
                  style={styles.secondaryStateButton}
                  variant="secondary"
                />
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={useSamplePhoto}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <AppText style={styles.sampleLink} tone="accent" variant="label">
                    Or preview with a sample
                  </AppText>
                </Pressable>
                <AppText style={styles.privacyNote} tone="subtle" variant="caption">
                  Your photo stays on your device during this mock phase.
                </AppText>
              </Surface>
            )
          ) : null}

          {status === 'loading' ? (
            <Surface style={styles.stateCard}>
              <MascotIllustration expression="loading" size={136} style={styles.stateMascot} />
              <ActivityIndicator color={Colors.forest} size="small" style={styles.loadingIndicator} />
              <AppText style={styles.centeredText} variant="heading">Reading your list</AppText>
              <AppText style={styles.stateMessage} tone="muted">
                Finding item names, quantities, and units…
              </AppText>
              <View style={styles.skeletonWrap}>
                <View style={[styles.skeleton, styles.skeletonLong]} />
                <View style={[styles.skeleton, styles.skeletonMedium]} />
                <View style={[styles.skeleton, styles.skeletonShort]} />
              </View>
            </Surface>
          ) : null}

          {status === 'error' ? (
            <Surface style={[styles.stateCard, styles.errorCard]}>
              <MascotIllustration expression="error" size={136} style={styles.stateMascot} />
              <AppText style={styles.centeredText} variant="heading">{errorTitle}</AppText>
              <AppText style={styles.stateMessage} tone="muted">{errorMessage}</AppText>
              <AppButton
                icon={permissionBlocked ? 'settings' : 'refresh-cw'}
                label={
                  permissionBlocked
                    ? 'Open settings'
                    : lastSource === 'camera'
                      ? 'Try camera again'
                      : lastSource === 'library'
                        ? 'Choose again'
                        : 'Try sample again'
                }
                onPress={retryAfterError}
                style={styles.stateButton}
              />
              <AppButton
                label="Choose another photo"
                onPress={() => void choosePhoto()}
                style={styles.secondaryStateButton}
                variant="ghost"
              />
            </Surface>
          ) : null}

          {status === 'success' ? (
            <View>
              <Surface style={styles.successBanner}>
                <MascotIllustration expression="success" size={68} style={styles.successMascot} />
                <View style={styles.successCopy}>
                  <AppText variant="bodyMedium">{items.length} items found</AppText>
                  <AppText tone="muted" variant="caption">Review anything highlighted before continuing</AppText>
                </View>
              </Surface>

              {photo ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setStatus('empty');
                    void choosePhoto();
                  }}
                  style={({ pressed }) => [styles.changePhoto, pressed && styles.pressed]}>
                  <Feather color={Colors.forest} name="image" size={16} />
                  <AppText tone="accent" variant="label">Change source photo</AppText>
                </Pressable>
              ) : null}

              <View style={styles.sectionHeading}>
                <AppText variant="heading">Detected items</AppText>
                <AppText tone="muted" variant="caption">Tap any text or unit to correct it</AppText>
              </View>

              <View style={styles.itemList}>
                {items.map((item) => {
                  const needsReview = item.confidence < 0.75;
                  return (
                    <Surface key={item.id} style={[styles.itemCard, needsReview && styles.itemCardReview]}>
                      <View style={styles.itemTopRow}>
                        <View style={styles.itemCopy}>
                          <TextInput
                            accessibilityLabel={`Detected item ${item.name}`}
                            maxLength={60}
                            onChangeText={(name) => updateItem(item.id, { name })}
                            selectionColor={Colors.forest}
                            style={styles.itemNameInput}
                            value={item.name}
                          />
                          <AppText numberOfLines={1} tone="muted" variant="caption">
                            Read as “{item.originalText}”
                          </AppText>
                        </View>
                        <View style={[styles.confidence, needsReview && styles.confidenceReview]}>
                          <AppText tone={needsReview ? 'default' : 'accent'} variant="overline">
                            {needsReview ? 'Check' : `${Math.round(item.confidence * 100)}%`}
                          </AppText>
                        </View>
                      </View>
                      <View style={styles.itemBottomRow}>
                        <QuantityUnitControl
                          onQuantityChange={(quantity) => updateItem(item.id, { quantity })}
                          onUnitChange={(unit) => updateItem(item.id, { unit })}
                          quantity={item.quantity}
                          unit={item.unit}
                        />
                        <Pressable
                          accessibilityLabel={`Remove ${item.name}`}
                          accessibilityRole="button"
                          hitSlop={8}
                          onPress={() => setItems((current) => current.filter(({ id }) => id !== item.id))}
                          style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
                          <Feather color={Colors.textSubtle} name="trash-2" size={17} />
                        </Pressable>
                      </View>
                    </Surface>
                  );
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>

        {status === 'success' ? (
          <View style={[styles.footer, compact && styles.horizontalCompact]}>
            <AppButton
              disabled={items.length === 0}
              fullWidth
              icon="arrow-right"
              label={`Continue with ${items.length} ${items.length === 1 ? 'item' : 'items'}`}
              onPress={continueToList}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.canvas, flex: 1 },
  frame: { alignSelf: 'center', flex: 1, maxWidth: 520, width: '100%' },
  headerWrap: { paddingHorizontal: Spacing[5] },
  horizontalCompact: { paddingHorizontal: Spacing[4] },
  content: { paddingBottom: Spacing[6], paddingHorizontal: Spacing[5], paddingTop: Spacing[3] },
  contentCompact: { paddingBottom: Spacing[4], paddingTop: Spacing[2] },
  previewCard: {
    backgroundColor: Colors.canvas,
    marginTop: Spacing[4],
    padding: Spacing[4],
  },
  previewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  previewCopy: { flex: 1 },
  removePhotoButton: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  previewImageWrap: {
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  previewImage: { height: 330, width: '100%' },
  previewImageCompact: { height: 250 },
  replaceActions: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[3] },
  replaceButton: { flex: 1, minWidth: 0 },
  reviewButton: { marginTop: Spacing[3] },
  stateCard: {
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    marginTop: Spacing[4],
    minHeight: 370,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[8],
  },
  stateMascot: {
    marginBottom: Spacing[4],
  },
  loadingIndicator: {
    marginBottom: Spacing[3],
    marginTop: -Spacing[3],
  },
  centeredText: { textAlign: 'center' },
  stateMessage: { marginTop: Spacing[2], maxWidth: 300, textAlign: 'center' },
  stateButton: { marginTop: Spacing[6], minWidth: 210 },
  secondaryStateButton: { marginTop: Spacing[1], minWidth: 210 },
  sampleLink: { marginTop: Spacing[4] },
  privacyNote: { marginTop: Spacing[4], textAlign: 'center' },
  skeletonWrap: { alignSelf: 'stretch', gap: Spacing[3], marginTop: Spacing[7] },
  skeleton: { backgroundColor: Colors.border, borderRadius: Radii.pill, height: 12 },
  skeletonLong: { width: '100%' },
  skeletonMedium: { width: '82%' },
  skeletonShort: { width: '58%' },
  errorCard: { borderColor: '#E7CFC9' },
  successBanner: {
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderColor: '#C9DACF',
    flexDirection: 'row',
    marginTop: Spacing[4],
    padding: Spacing[4],
  },
  successMascot: {
    marginRight: Spacing[3],
  },
  successCopy: { flex: 1 },
  changePhoto: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[3],
    padding: Spacing[2],
  },
  sectionHeading: { marginBottom: Spacing[3], marginTop: Spacing[7] },
  itemList: { gap: Spacing[3] },
  itemCard: { padding: Spacing[4] },
  itemCardReview: { backgroundColor: '#FFF9ED', borderColor: '#E6CF9C' },
  itemTopRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing[3] },
  itemCopy: { flex: 1 },
  itemNameInput: {
    color: Colors.charcoal,
    fontSize: 16,
    fontWeight: '600',
    minHeight: 30,
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  confidence: {
    backgroundColor: Colors.forestSoft,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing[2],
    paddingVertical: 5,
  },
  confidenceReview: { backgroundColor: Colors.cream },
  itemBottomRow: {
    alignItems: 'center',
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  footer: {
    backgroundColor: Colors.canvas,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
  },
  pressed: { opacity: 0.62 },
});
