import {
  McpEvent,
  WalletState,
  DrawPixelPayload,
  DrawCompletePayload,
  WalletInitPayload,
} from '../types';
import { XP_PER_PIXEL, XP_WALLET_THRESHOLD, MOCK_WALLET_ADDRESS } from '../constants';
import {
  isValidWalletState,
  isValidDrawPixelPayload,
  isValidDrawCompletePayload,
  isValidWalletInitPayload,
} from '../utils/validation';

/**
 * MCP ROUTER SIMULATION
 * This service acts as the "backend" logic described in Level 2.
 * It handles event indexing, XP calculation, and invisible wallet orchestration.
 */

class MCPRouter {
  private sessionEvents: McpEvent[] = [];
  private walletState: WalletState = {
    isActive: false,
    address: null,
    balance: 0,
    xp: 0,
  };

  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    // Check for existing session (cookie simulation)
    try {
      const saved = localStorage.getItem('inkpink_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validação profissional usando utilitário
        if (isValidWalletState(parsed)) {
          this.walletState = {
            isActive: parsed.isActive,
            address: parsed.address || null,
            balance: parsed.balance || 0,
            xp: parsed.xp || 0,
          };
        } else {
          // Dados inválidos, resetar
          console.warn('[MCP Router] Dados de sessão inválidos, resetando...');
          localStorage.removeItem('inkpink_session');
        }
      }
    } catch (error) {
      // Erro ao ler localStorage (pode estar desabilitado ou corrompido)
      console.error('Erro ao carregar sessão do localStorage:', error);
      try {
        localStorage.removeItem('inkpink_session');
      } catch {
        // Ignorar erro ao tentar limpar
      }
    }
  }

  public subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
    listener(this.walletState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    // Persist state
    try {
      localStorage.setItem('inkpink_session', JSON.stringify(this.walletState));
    } catch (error) {
      // localStorage pode estar cheio ou desabilitado
      console.error('Erro ao salvar sessão no localStorage:', error);
      // Continuar mesmo sem salvar, a aplicação ainda funciona
    }
    this.listeners.forEach((l) => l(this.walletState));
  }

  /**
   * Registra um evento no sistema MCP com validação de tipos
   */
  public logEvent<T extends McpEvent['type']>(
    type: T,
    payload?: T extends 'draw.pixel'
      ? DrawPixelPayload
      : T extends 'draw.complete'
        ? DrawCompletePayload
        : T extends 'wallet.init'
          ? WalletInitPayload
          : never
  ): void {
    // Validação de runtime
    if (!this.validateEventPayload(type, payload)) {
      console.warn(`[MCP Router] Payload inválido para evento ${type}:`, payload);
      return;
    }

    const event = {
      type,
      payload,
      timestamp: Date.now(),
    } as McpEvent;

    this.sessionEvents.push(event);

    // Router Logic: Process Event
    switch (type) {
      case 'draw.pixel':
        this.processPixelDraw();
        break;
      case 'draw.complete':
        if (payload && 'method' in payload) {
          this.walletState.balance += 100; // Bonus for completion
          this.notify();
        }
        break;
      case 'wallet.init':
        // Já tratado em activateWallet
        break;
    }

    console.warn(`[MCP Router] Event: ${type}`, payload);
  }

  /**
   * Valida o payload do evento baseado no tipo usando utilitários profissionais
   */
  private validateEventPayload(type: McpEvent['type'], payload: unknown): boolean {
    if (!payload) {
      // Alguns eventos podem não ter payload
      return type === 'claim.ready'; // Ajustar conforme necessário
    }

    switch (type) {
      case 'draw.pixel':
        return isValidDrawPixelPayload(payload);

      case 'draw.complete':
        return isValidDrawCompletePayload(payload);

      case 'wallet.init':
        return isValidWalletInitPayload(payload);

      default:
        return true; // Para tipos futuros, aceitar por enquanto
    }
  }

  private processPixelDraw() {
    // Add XP
    this.walletState.xp += XP_PER_PIXEL;

    // Level 3: Invisible Wallet Creation Logic
    if (!this.walletState.isActive && this.walletState.xp >= XP_WALLET_THRESHOLD) {
      this.activateWallet();
    } else {
      this.notify();
    }
  }

  private activateWallet() {
    // Simulate Thirdweb Embedded Wallet creation delay
    setTimeout(() => {
      this.walletState.isActive = true;
      this.walletState.address = MOCK_WALLET_ADDRESS;
      this.walletState.balance += 10; // Initial drop
      this.logEvent('wallet.init', { address: this.walletState.address });
      this.notify();
    }, 500);
  }

  public getWalletState(): WalletState {
    return this.walletState;
  }

  public reset() {
    try {
      localStorage.removeItem('inkpink_session');
    } catch (error) {
      console.error('Erro ao resetar localStorage:', error);
    }
    this.walletState = { isActive: false, address: null, balance: 0, xp: 0 };
    this.notify();
  }
}

export const mcp = new MCPRouter();
