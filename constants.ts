import { ColorPalette } from './types';

// The Ju Tattoo Brand Palette
export const BRAND_COLORS = {
  PINK: '#ed00b2',
  BG: '#e8e9e2',
  DARK: '#1a1a1a',
  WHITE: '#ffffff',
};

// 8-Bit Palette for the User
export const PALETTE: ColorPalette[] = [
  { hex: '#1a1a1a', name: 'Ink Black' },
  { hex: '#ed00b2', name: 'Ju Pink' },
  { hex: '#e74c3c', name: 'Old School Red' },
  { hex: '#f1c40f', name: 'Gold' },
  { hex: '#2ecc71', name: 'Venom Green' },
  { hex: '#3498db', name: 'Sky Blue' },
  { hex: '#ecf0f1', name: 'Ghost White' },
];

export const CANVAS_SIZE = 32; // 32x32 grid
export const XP_PER_PIXEL = 5;
export const XP_WALLET_THRESHOLD = 50; // Trigger wallet creation after ~10 pixels
export const MOCK_WALLET_ADDRESS = '0x71C...9A23';

// Placeholder for the "Template" user traces over
// Using a simple SVG data URI as a placeholder for the "Flash"
export const FLASH_TEMPLATE_URI = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZD0iTTE2IDIgTDIgMTYgTDE2IDMwIEwzMCAxNiBaIiBzdHJva2U9IiMxYTFhMWEiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIvPjxwYXRoIGQ9Ik0xNiA4IEw4IDE2IEwxNiAyNCBMMjQgMTYgWiIgc3Ryb2tlPSIjMWExYTFhIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=`;
