import { CANVAS_SIZE } from '../constants';
import { WalletState, DrawPixelPayload, DrawCompletePayload, WalletInitPayload } from '../types';

/**
 * Utilitários de validação profissional para o sistema
 */

/**
 * Valida coordenadas do canvas
 * @param x Coordenada X
 * @param y Coordenada Y
 * @returns true se as coordenadas são válidas
 */
export function isValidCanvasCoordinate(x: number, y: number): boolean {
  return (
    typeof x === 'number' &&
    typeof y === 'number' &&
    !isNaN(x) &&
    !isNaN(y) &&
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    x >= 0 &&
    x < CANVAS_SIZE &&
    y >= 0 &&
    y < CANVAS_SIZE
  );
}

/**
 * Valida formato de cor hexadecimal
 * @param color String de cor em formato hexadecimal
 * @returns true se a cor é válida
 */
export function isValidColor(color: string): boolean {
  if (typeof color !== 'string') {
    return false;
  }

  // Aceita formato #RRGGBB ou #RGB
  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexColorRegex.test(color);
}

/**
 * Valida estado da wallet
 * @param wallet Estado da wallet para validar
 * @returns true se o estado é válido
 */
export function isValidWalletState(wallet: unknown): wallet is WalletState {
  if (!wallet || typeof wallet !== 'object') {
    return false;
  }

  const w = wallet as Record<string, unknown>;

  return (
    typeof w.isActive === 'boolean' &&
    (w.address === null || typeof w.address === 'string') &&
    typeof w.balance === 'number' &&
    typeof w.xp === 'number' &&
    !isNaN(w.balance) &&
    !isNaN(w.xp) &&
    w.balance >= 0 &&
    w.xp >= 0 &&
    Number.isFinite(w.balance) &&
    Number.isFinite(w.xp)
  );
}

/**
 * Valida payload de evento draw.pixel
 * @param payload Payload para validar
 * @returns true se o payload é válido
 */
export function isValidDrawPixelPayload(payload: unknown): payload is DrawPixelPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const p = payload as Record<string, unknown>;

  return (
    typeof p.x === 'number' &&
    typeof p.y === 'number' &&
    typeof p.color === 'string' &&
    isValidCanvasCoordinate(p.x, p.y) &&
    (p.color === 'none' || isValidColor(p.color))
  );
}

/**
 * Valida payload de evento draw.complete
 * @param payload Payload para validar
 * @returns true se o payload é válido
 */
export function isValidDrawCompletePayload(payload: unknown): payload is DrawCompletePayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const p = payload as Record<string, unknown>;

  return typeof p.method === 'string' && (p.method === 'download' || p.method === 'mint');
}

/**
 * Valida payload de evento wallet.init
 * @param payload Payload para validar
 * @returns true se o payload é válido
 */
export function isValidWalletInitPayload(payload: unknown): payload is WalletInitPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const p = payload as Record<string, unknown>;

  return (
    typeof p.address === 'string' && p.address.length > 0 && /^0x[a-fA-F0-9]{40}$/.test(p.address) // Validação básica de endereço Ethereum
  );
}

/**
 * Sanitiza string para prevenir XSS
 * @param input String para sanitizar
 * @returns String sanitizada
 */
export function sanitizeString(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Valida e sanitiza coordenadas
 * @param x Coordenada X
 * @param y Coordenada Y
 * @returns Coordenadas validadas ou null se inválidas
 */
export function validateAndSanitizeCoordinates(
  x: unknown,
  y: unknown
): { x: number; y: number } | null {
  const numX = typeof x === 'number' ? x : Number(x);
  const numY = typeof y === 'number' ? y : Number(y);

  if (isValidCanvasCoordinate(numX, numY)) {
    return { x: Math.floor(numX), y: Math.floor(numY) };
  }

  return null;
}
