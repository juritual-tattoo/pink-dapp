import { McpEvent, WalletState } from '../types';
import { XP_PER_PIXEL, XP_WALLET_THRESHOLD, MOCK_WALLET_ADDRESS } from '../constants';

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
    xp: 0
  };

  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    // Check for existing session (cookie simulation)
    const saved = localStorage.getItem('inkpink_session');
    if (saved) {
      this.walletState = JSON.parse(saved);
    }
  }

  public subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
    listener(this.walletState);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    // Persist state
    localStorage.setItem('inkpink_session', JSON.stringify(this.walletState));
    this.listeners.forEach(l => l(this.walletState));
  }

  public logEvent(type: McpEvent['type'], payload?: any) {
    const event: McpEvent = {
      type,
      payload,
      timestamp: Date.now()
    };
    this.sessionEvents.push(event);
    
    // Router Logic: Process Event
    switch (type) {
      case 'draw.pixel':
        this.processPixelDraw();
        break;
      case 'draw.complete':
        this.walletState.balance += 100; // Bonus for completion
        this.notify();
        break;
    }

    console.log(`[MCP Router] Event: ${type}`, payload);
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
    localStorage.removeItem('inkpink_session');
    this.walletState = { isActive: false, address: null, balance: 0, xp: 0 };
    this.notify();
  }
}

export const mcp = new MCPRouter();