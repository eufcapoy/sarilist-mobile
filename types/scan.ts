import type { ShoppingUnit } from '@/types/shopping';

export type ScanStatus = 'empty' | 'loading' | 'error' | 'success';

export type ScannedItem = {
  id: string;
  name: string;
  originalText: string;
  quantity?: number;
  unit?: ShoppingUnit;
  confidence: number;
};

export type OCRImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type OCRResult = {
  items: ScannedItem[];
  processingMs?: number;
};
