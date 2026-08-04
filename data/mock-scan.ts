import type { ScannedItem } from '@/types/scan';

export const mockScannedItems: ScannedItem[] = [
  {
    id: 'scan-rice',
    name: 'Rice',
    originalText: '1 sack rice',
    quantity: 1,
    unit: 'sack',
    confidence: 0.97,
  },
  {
    id: 'scan-coffee',
    name: 'Instant coffee',
    originalText: '10 sachet coffee',
    quantity: 10,
    unit: 'sachet',
    confidence: 0.84,
  },
  {
    id: 'scan-eggs',
    name: 'Eggs',
    originalText: '2 tray egg',
    quantity: 2,
    unit: 'tray',
    confidence: 0.68,
  },
  {
    id: 'scan-bioderm',
    name: 'Biodern',
    originalText: 'Biodern',
    confidence: 0.91,
    suggestion: {
      name: 'Bioderm',
      score: 0.86,
    },
  },
];
