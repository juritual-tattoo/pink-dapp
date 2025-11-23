export enum AppStage {
  LOADING = 'LOADING',
  ONBOARDING = 'ONBOARDING',
  CANVAS = 'CANVAS',
  MINTING = 'MINTING',
  COMPLETED = 'COMPLETED'
}

export interface PixelData {
  x: number;
  y: number;
  color: string;
}

export interface WalletState {
  isActive: boolean;
  address: string | null;
  balance: number; // In $PINK
  xp: number;
}

export interface McpEvent {
  type: 'draw.pixel' | 'draw.complete' | 'wallet.init' | 'claim.ready';
  payload?: any;
  timestamp: number;
}

export interface ColorPalette {
  hex: string;
  name: string;
}