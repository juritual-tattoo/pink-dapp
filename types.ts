export enum AppStage {
  LOADING = 'LOADING',
  ONBOARDING = 'ONBOARDING',
  CANVAS = 'CANVAS',
  MINTING = 'MINTING',
  COMPLETED = 'COMPLETED',
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

// Tipos específicos para payloads de cada evento
export interface DrawPixelPayload {
  x: number;
  y: number;
  color: string;
}

export interface DrawCompletePayload {
  method: 'download' | 'mint';
}

export interface WalletInitPayload {
  address: string;
}

export interface ClaimReadyPayload {
  amount: number;
  token: string;
}

// Union type para todos os payloads possíveis
export type McpEventPayload =
  | DrawPixelPayload
  | DrawCompletePayload
  | WalletInitPayload
  | ClaimReadyPayload
  | undefined;

// Tipos específicos para cada evento
export interface DrawPixelEvent {
  type: 'draw.pixel';
  payload: DrawPixelPayload;
  timestamp: number;
}

export interface DrawCompleteEvent {
  type: 'draw.complete';
  payload: DrawCompletePayload;
  timestamp: number;
}

export interface WalletInitEvent {
  type: 'wallet.init';
  payload: WalletInitPayload;
  timestamp: number;
}

export interface ClaimReadyEvent {
  type: 'claim.ready';
  payload: ClaimReadyPayload;
  timestamp: number;
}

// Union type para todos os eventos
export type McpEvent = DrawPixelEvent | DrawCompleteEvent | WalletInitEvent | ClaimReadyEvent;

export interface ColorPalette {
  hex: string;
  name: string;
}
