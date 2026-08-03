import type { OCRImage, OCRResult } from '@/types/scan';

export type OCRService = {
  recognize(image: OCRImage): Promise<OCRResult>;
};

export type OCRServiceErrorCode =
  | 'not-configured'
  | 'timeout'
  | 'unreachable'
  | 'invalid-response'
  | 'no-text';

export class OCRServiceError extends Error {
  constructor(
    readonly code: OCRServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'OCRServiceError';
  }
}
