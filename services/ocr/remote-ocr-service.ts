import { ShoppingUnits } from '@/constants/shopping-units';
import { OCRServiceError, type OCRService } from '@/services/ocr/ocr-service';
import type { OCRImage, OCRResult, ScannedItem } from '@/types/scan';
import type { ShoppingUnit } from '@/types/shopping';

const REQUEST_TIMEOUT_MS = 90_000;
const supportedUnits = new Set<string>(ShoppingUnits.map(({ value }) => value));

function inferMimeType(image: OCRImage) {
  if (image.mimeType?.startsWith('image/')) return image.mimeType;

  const extension = image.fileName?.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

type RemoteScannedItem = Omit<ScannedItem, 'unit'> & { unit?: ShoppingUnit | null };

function isScannedItem(value: unknown): value is RemoteScannedItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.originalText === 'string' &&
    (item.quantity === undefined ||
      (typeof item.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity > 0)) &&
    (item.unit === undefined ||
      item.unit === null ||
      (typeof item.unit === 'string' && supportedUnits.has(item.unit))) &&
    typeof item.confidence === 'number' &&
    item.confidence >= 0 &&
    item.confidence <= 1
  );
}

function parseResult(value: unknown): OCRResult {
  if (!value || typeof value !== 'object') {
    throw new OCRServiceError('invalid-response', 'The OCR service returned an unreadable response.');
  }

  const response = value as Record<string, unknown>;
  if (!Array.isArray(response.items) || !response.items.every(isScannedItem)) {
    throw new OCRServiceError('invalid-response', 'The OCR service returned invalid list items.');
  }

  if (response.items.length === 0) {
    throw new OCRServiceError('no-text', 'No list items were found in the photo.');
  }

  return {
    items: response.items.map(({ unit, ...item }) => ({
      ...item,
      ...(unit ? { unit } : {}),
    })),
    processingMs:
      typeof response.processingMs === 'number' ? response.processingMs : undefined,
  };
}

export class RemoteOCRService implements OCRService {
  constructor(private readonly baseUrl = process.env.EXPO_PUBLIC_OCR_API_URL?.trim()) {}

  async recognize(image: OCRImage): Promise<OCRResult> {
    if (!this.baseUrl) {
      throw new OCRServiceError(
        'not-configured',
        'The OCR service address has not been configured.',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const form = new FormData();
    form.append(
      'image',
      {
        name: image.fileName ?? `sarilist-${Date.now()}.jpg`,
        type: inferMimeType(image),
        uri: image.uri,
      } as unknown as Blob,
    );

    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/v1/ocr/recognize`, {
        body: form,
        method: 'POST',
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail: unknown;
        try {
          detail = (await response.json() as { detail?: unknown }).detail;
        } catch {
          detail = undefined;
        }
        throw new OCRServiceError(
          response.status === 422 ? 'no-text' : 'invalid-response',
          typeof detail === 'string' ? detail : `OCR request failed (${response.status}).`,
        );
      }

      return parseResult(await response.json());
    } catch (error) {
      if (error instanceof OCRServiceError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new OCRServiceError('timeout', 'Reading the photo took too long.');
      }
      throw new OCRServiceError('unreachable', 'The OCR service could not be reached.');
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const ocrService: OCRService = new RemoteOCRService();
