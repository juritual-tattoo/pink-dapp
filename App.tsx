import React, { useState, useEffect, useCallback, useRef } from 'react';
import CanvasBoard, { CanvasBoardActions } from './components/CanvasBoard';
import {
  IconBrush,
  IconEraser,
  IconWallet,
  IconCheck,
  IconDownload,
  IconZap,
  IconUndo,
  IconRedo,
  IconClose,
  IconLoader,
} from './components/Icons';
import { PALETTE } from './constants';
import { mcp } from './services/mcp';
import { AppStage, WalletState } from './types';
import { useTranslation } from './hooks/useTranslation';
import { isValidWalletState } from './utils/validation';
import { getGeminiApiKey, hasGeminiApiKey } from './utils/env';
// import EnvTest from './components/EnvTest'; // Temporariamente desabilitado

export default function App() {
  // Internacionalização
  const { t } = useTranslation();

  // Verificar variáveis de ambiente no carregamento
  useEffect(() => {
    try {
      if (hasGeminiApiKey()) {
        const apiKey = getGeminiApiKey();
        console.warn(
          '[App] GEMINI_API_KEY carregada:',
          apiKey ? `${apiKey.substring(0, 10)}...` : 'não encontrada'
        );
      } else {
        console.warn('[App] GEMINI_API_KEY não encontrada. Verifique o arquivo .env.local');
      }
    } catch (error) {
      console.error('[App] Erro ao verificar variáveis de ambiente:', error);
    }
  }, []);

  const [stage, setStage] = useState<AppStage>(AppStage.ONBOARDING);
  const [wallet, setWallet] = useState<WalletState>(mcp.getWalletState());
  const [currentColor, setCurrentColor] = useState(PALETTE[1].hex);
  const [isEraser, setIsEraser] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  // Undo/Redo State
  const boardActionRef = useRef<CanvasBoardActions | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Notification State - melhorado com opção de fechar manualmente
  const [notification, setNotification] = useState<{
    msg: string;
    type: 'info' | 'success' | 'error';
    id: number;
  } | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref para rastrear estado anterior da wallet
  const prevWalletActiveRef = useRef(wallet.isActive);

  // Validação profissional do estado da wallet
  useEffect(() => {
    const walletState = mcp.getWalletState();
    if (!isValidWalletState(walletState)) {
      console.warn('[App] Estado da wallet inválido, resetando...');
      mcp.reset();
    }
  }, []);

  useEffect(() => {
    // Subscribe to MCP changes (Wallet & XP)
    const unsubscribe = mcp.subscribe((newState) => {
      // Validação profissional do estado antes de atualizar
      if (!isValidWalletState(newState)) {
        console.warn('[App] Estado da wallet recebido é inválido');
        return;
      }

      // Check for state transition: Wallet Created usando ref
      if (!prevWalletActiveRef.current && newState.isActive) {
        showNotification(t.notifications.walletActivated, 'success');
      }
      prevWalletActiveRef.current = newState.isActive;
      setWallet({ ...newState });
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependência corrigida: deve ser array vazio para executar apenas uma vez

  const showNotification = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    // Limpar timeout anterior se existir
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    const id = Date.now();
    setNotification({ msg, type, id });

    // Auto-fechar após 5 segundos (aumentado de 3 para 5)
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, 5000);
  };

  const closeNotification = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
    setNotification(null);
  };

  const handleInteraction = () => {
    // Basic interaction tracking handled by MCP
  };

  const handleDownload = () => {
    try {
      if (!canvasRef) {
        showNotification(t.notifications.downloadErrorEmpty, 'error');
        return;
      }

      const dataURL = canvasRef.toDataURL('image/png');
      if (!dataURL || dataURL === 'data:,') {
        throw new Error('Falha ao gerar imagem do canvas');
      }

      const link = document.createElement('a');
      link.download = 'inkpink-flash.png';
      link.href = dataURL;
      link.click();
      mcp.logEvent('draw.complete', { method: 'download' });
      showNotification(t.notifications.downloadStarted, 'success');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      showNotification(t.notifications.downloadError, 'error');
    }
  };

  const handleMint = () => {
    if (!wallet.isActive) {
      showNotification(t.notifications.mintingErrorNoWallet, 'error');
      return;
    }

    setStage(AppStage.MINTING);
    showNotification(t.notifications.minting, 'info');

    // Simulate Minting Process
    setTimeout(() => {
      showNotification(t.notifications.mintingSuccess, 'success');
      setStage(AppStage.COMPLETED);
      mcp.logEvent('draw.complete', { method: 'mint' });
    }, 2000);
  };

  const handleHistoryChange = useCallback((undoAvailable: boolean, redoAvailable: boolean) => {
    setCanUndo(undoAvailable);
    setCanRedo(redoAvailable);
  }, []);

  // --- Views ---

  if (stage === AppStage.ONBOARDING) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8 relative">
          <h1
            className="text-6xl font-black text-brand-pink tracking-tighter whitespace-pre-line"
            style={{ textShadow: '4px 4px 0px #1a1a1a' }}
          >
            {t.app.title}
          </h1>
          <span className="absolute -top-4 -right-8 bg-black text-white text-xs px-2 py-1 font-mono transform rotate-12">
            {t.app.version}
          </span>
        </div>
        <p className="max-w-xs text-brand-dark font-mono text-sm mb-12">{t.app.subtitle}</p>
        <button
          onClick={() => setStage(AppStage.CANVAS)}
          className="bg-brand-dark text-white font-bold py-4 px-12 text-xl border-b-4 border-r-4 border-brand-pink hover:translate-y-1 hover:border-b-0 hover:border-r-0 transition-all"
        >
          {t.onboarding.startSession}
        </button>
        <div className="mt-12 text-xs text-gray-400 font-mono">{t.app.poweredBy}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col overflow-hidden relative">
      {/* HEADER HUD */}
      <header className="px-4 py-3 flex justify-between items-center bg-white border-b-2 border-brand-dark z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-pink flex items-center justify-center border-2 border-brand-dark">
            <span className="text-white font-bold text-xs">JP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold leading-tight tracking-wider text-gray-500">
              {t.header.level}
            </span>
            <div className="w-24 h-2 bg-gray-200 border border-gray-400 mt-1 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-brand-pink transition-all duration-500"
                style={{ width: `${Math.min((wallet.xp / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wallet Status Widget */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all duration-500 ${wallet.isActive ? 'border-brand-pink bg-pink-50' : 'border-gray-300 bg-gray-100 opacity-50'}`}
        >
          <IconWallet
            className={`w-4 h-4 ${wallet.isActive ? 'text-brand-pink' : 'text-gray-400'}`}
          />
          {wallet.isActive ? (
            <span className="font-mono text-xs font-bold text-brand-pink">
              {wallet.balance} PINK
            </span>
          ) : (
            <span className="font-mono text-[10px] text-gray-400">{t.header.offline}</span>
          )}
        </div>
      </header>

      {/* CANVAS AREA */}
      <main className="flex-1 flex flex-col justify-center relative p-4 z-0">
        <CanvasBoard
          currentColor={currentColor}
          isEraser={isEraser}
          onInteract={handleInteraction}
          getCanvasRef={setCanvasRef}
          actionRef={boardActionRef}
          onHistoryChange={handleHistoryChange}
        />

        {/* Floating Notification - Melhorado */}
        {notification && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 border-l-4 shadow-xl flex items-center gap-3 animate-slide-up z-50 min-w-[300px] max-w-[90%] ${
              notification.type === 'success'
                ? 'bg-brand-dark text-white border-brand-pink'
                : notification.type === 'error'
                  ? 'bg-red-50 text-red-900 border-red-500'
                  : 'bg-blue-50 text-blue-900 border-blue-500'
            }`}
          >
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <IconZap className="text-brand-pink" />
              ) : notification.type === 'error' ? (
                <IconClose className="text-red-500" />
              ) : stage === AppStage.MINTING ? (
                <IconLoader className="text-blue-500 animate-spin" />
              ) : (
                <IconCheck className="text-blue-500" />
              )}
            </div>
            <span className="font-mono text-sm flex-1">{notification.msg}</span>
            <button
              onClick={closeNotification}
              className="flex-shrink-0 ml-2 p-1 hover:opacity-70 transition-opacity"
              aria-label="Fechar notificação"
            >
              <IconClose
                className={`w-4 h-4 ${
                  notification.type === 'success' ? 'text-white' : 'text-gray-600'
                }`}
              />
            </button>
          </div>
        )}
      </main>

      {/* COMPLETION MODAL */}
      {stage === AppStage.COMPLETED && (
        <div className="absolute inset-0 bg-brand-bg/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border-4 border-brand-dark p-6 max-w-sm w-full shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black text-brand-pink mb-4">{t.completion.title}</h2>
            <p className="font-mono text-sm text-gray-600 mb-6">
              {t.completion.message} <span className="font-bold text-brand-dark">100 PINK</span>{' '}
              tokens.
            </p>
            <button
              onClick={() => setStage(AppStage.CANVAS)}
              className="w-full bg-brand-dark text-white py-3 font-bold hover:bg-gray-800"
            >
              {t.completion.backToStudio}
            </button>
          </div>
        </div>
      )}

      {/* CONTROLS */}
      <footer className="bg-white border-t-2 border-brand-dark pb-6 pt-4 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 relative">
        {/* Tools Row */}
        <div className="flex justify-between items-center mb-4 max-w-[400px] mx-auto gap-2">
          {/* Brush/Eraser Group */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsEraser(false)}
              className={`p-3 border-2 transition-colors ${!isEraser ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-400 border-gray-200'}`}
              aria-label={t.canvas.brushTool}
            >
              <IconBrush className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`p-3 border-2 transition-colors ${isEraser ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-400 border-gray-200'}`}
              aria-label={t.canvas.eraserTool}
            >
              <IconEraser className="w-5 h-5" />
            </button>
          </div>

          {/* Undo/Redo Group */}
          <div className="flex gap-2">
            <button
              onClick={() => boardActionRef.current?.undo()}
              disabled={!canUndo}
              className={`p-3 border-2 transition-all ${canUndo ? 'bg-white text-brand-dark border-brand-dark hover:bg-gray-100' : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'}`}
              aria-label={t.canvas.undo}
            >
              <IconUndo className="w-5 h-5" />
            </button>
            <button
              onClick={() => boardActionRef.current?.redo()}
              disabled={!canRedo}
              className={`p-3 border-2 transition-all ${canRedo ? 'bg-white text-brand-dark border-brand-dark hover:bg-gray-100' : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'}`}
              aria-label={t.canvas.redo}
            >
              <IconRedo className="w-5 h-5" />
            </button>
          </div>

          {/* Action Group */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleDownload}
              className="p-3 border-2 border-gray-200 hover:border-brand-pink text-gray-600"
              title="Download PNG"
              aria-label={t.canvas.download}
            >
              <IconDownload className="w-5 h-5" />
            </button>
            <button
              onClick={handleMint}
              disabled={!wallet.isActive || stage === AppStage.MINTING}
              className={`flex items-center gap-2 px-4 py-3 border-2 font-bold text-sm transition-all ${
                wallet.isActive && stage !== AppStage.MINTING
                  ? 'bg-brand-pink border-brand-pink text-white shadow-[2px_2px_0px_#1a1a1a] hover:shadow-[1px_1px_0px_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px]'
                  : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
              }`}
              aria-label={stage === AppStage.MINTING ? t.canvas.minting : t.canvas.mint}
            >
              {stage === AppStage.MINTING ? (
                <>
                  <IconLoader className="w-4 h-4 animate-spin" />
                  <span>{t.canvas.minting}</span>
                </>
              ) : (
                t.canvas.mint
              )}
            </button>
          </div>
        </div>

        {/* Color Palette */}
        <div className="flex justify-center gap-3 overflow-x-auto py-2 max-w-[400px] mx-auto scrollbar-hide">
          {PALETTE.map((color, index) => {
            // Mapear cores para traduções
            const colorNames = [
              t.colors.inkBlack,
              t.colors.juPink,
              t.colors.oldSchoolRed,
              t.colors.gold,
              t.colors.venomGreen,
              t.colors.skyBlue,
              t.colors.ghostWhite,
            ];
            return (
              <button
                key={`color-${index}-${color.hex}`}
                onClick={() => {
                  setCurrentColor(color.hex);
                  setIsEraser(false);
                }}
                className={`w-10 h-10 rounded-none border-2 transition-transform ${
                  currentColor === color.hex && !isEraser
                    ? 'scale-110 border-brand-dark shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={colorNames[index] || color.name}
              />
            );
          })}
        </div>
      </footer>
    </div>
  );
}
