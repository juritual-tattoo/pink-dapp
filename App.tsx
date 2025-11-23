import React, { useState, useEffect, useCallback, useRef } from 'react';
import CanvasBoard, { CanvasBoardActions } from './components/CanvasBoard';
import { IconBrush, IconEraser, IconWallet, IconCheck, IconDownload, IconZap, IconUndo, IconRedo } from './components/Icons';
import { BRAND_COLORS, PALETTE } from './constants';
import { mcp } from './services/mcp';
import { AppStage, WalletState } from './types';

export default function App() {
  const [stage, setStage] = useState<AppStage>(AppStage.ONBOARDING);
  const [wallet, setWallet] = useState<WalletState>(mcp.getWalletState());
  const [currentColor, setCurrentColor] = useState(PALETTE[1].hex);
  const [isEraser, setIsEraser] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  
  // Undo/Redo State
  const boardActionRef = useRef<CanvasBoardActions | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{msg: string, type: 'info' | 'success'} | null>(null);

  useEffect(() => {
    // Subscribe to MCP changes (Wallet & XP)
    const unsubscribe = mcp.subscribe((newState) => {
      // Check for state transition: Wallet Created
      if (!wallet.isActive && newState.isActive) {
        showNotification("Security Layer Activated. Wallet Generated.", 'success');
      }
      setWallet({ ...newState });
    });
    return unsubscribe;
  }, [wallet.isActive]);

  const showNotification = (msg: string, type: 'info' | 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInteraction = () => {
    // Basic interaction tracking handled by MCP
  };

  const handleDownload = () => {
    if (canvasRef) {
      const link = document.createElement('a');
      link.download = 'inkpink-flash.png';
      link.href = canvasRef.toDataURL('image/png');
      link.click();
      mcp.logEvent('draw.complete', { method: 'download' });
    }
  };

  const handleMint = () => {
    setStage(AppStage.MINTING);
    // Simulate Minting Process
    setTimeout(() => {
      showNotification("NFT Minted on Polygon (Simulated)", 'success');
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
           <h1 className="text-6xl font-black text-brand-pink tracking-tighter" style={{ textShadow: '4px 4px 0px #1a1a1a' }}>
             INK<br/>PINK
           </h1>
           <span className="absolute -top-4 -right-8 bg-black text-white text-xs px-2 py-1 font-mono transform rotate-12">v0.1</span>
        </div>
        <p className="max-w-xs text-brand-dark font-mono text-sm mb-12">
          Micro-ecosystem for pixelated flash tattoos. Start painting to unlock your identity.
        </p>
        <button 
          onClick={() => setStage(AppStage.CANVAS)}
          className="bg-brand-dark text-white font-bold py-4 px-12 text-xl border-b-4 border-r-4 border-brand-pink hover:translate-y-1 hover:border-b-0 hover:border-r-0 transition-all"
        >
          START SESSION
        </button>
        <div className="mt-12 text-xs text-gray-400 font-mono">
          POWERED BY MCP &bull; JU TATTOO
        </div>
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
             <span className="text-[10px] font-mono font-bold leading-tight tracking-wider text-gray-500">LEVEL 1</span>
             <div className="w-24 h-2 bg-gray-200 border border-gray-400 mt-1 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-brand-pink transition-all duration-500" 
                  style={{ width: `${Math.min((wallet.xp / 100) * 100, 100)}%` }}
                />
             </div>
           </div>
        </div>
        
        {/* Wallet Status Widget */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all duration-500 ${wallet.isActive ? 'border-brand-pink bg-pink-50' : 'border-gray-300 bg-gray-100 opacity-50'}`}>
          <IconWallet className={`w-4 h-4 ${wallet.isActive ? 'text-brand-pink' : 'text-gray-400'}`} />
          {wallet.isActive ? (
            <span className="font-mono text-xs font-bold text-brand-pink">
              {wallet.balance} PINK
            </span>
          ) : (
             <span className="font-mono text-[10px] text-gray-400">OFFLINE</span>
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
         
         {/* Floating Notification */}
         {notification && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-brand-dark text-white px-6 py-3 border-l-4 border-brand-pink shadow-xl flex items-center gap-3 animate-slide-up z-50 min-w-[300px]">
             {notification.type === 'success' ? <IconZap className="text-brand-pink" /> : <IconCheck />}
             <span className="font-mono text-sm">{notification.msg}</span>
           </div>
         )}
      </main>

      {/* COMPLETION MODAL */}
      {stage === AppStage.COMPLETED && (
        <div className="absolute inset-0 bg-brand-bg/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white border-4 border-brand-dark p-6 max-w-sm w-full shadow-[8px_8px_0px_rgba(0,0,0,1)]">
             <h2 className="text-2xl font-black text-brand-pink mb-4">MASTERPIECE.</h2>
             <p className="font-mono text-sm text-gray-600 mb-6">
               Your 8-bit flash has been immortalized. You earned <span className="font-bold text-brand-dark">100 PINK</span> tokens.
             </p>
             <button 
               onClick={() => setStage(AppStage.CANVAS)}
               className="w-full bg-brand-dark text-white py-3 font-bold hover:bg-gray-800"
             >
               BACK TO STUDIO
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
              aria-label="Brush Tool"
            >
              <IconBrush className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsEraser(true)}
              className={`p-3 border-2 transition-colors ${isEraser ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-400 border-gray-200'}`}
              aria-label="Eraser Tool"
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
                aria-label="Undo"
             >
                <IconUndo className="w-5 h-5" />
             </button>
             <button 
                onClick={() => boardActionRef.current?.redo()}
                disabled={!canRedo}
                className={`p-3 border-2 transition-all ${canRedo ? 'bg-white text-brand-dark border-brand-dark hover:bg-gray-100' : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'}`}
                aria-label="Redo"
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
                aria-label="Download"
             >
                <IconDownload className="w-5 h-5" />
             </button>
             <button 
                onClick={handleMint}
                disabled={!wallet.isActive}
                className={`flex items-center gap-2 px-4 py-3 border-2 font-bold text-sm ${wallet.isActive ? 'bg-brand-pink border-brand-pink text-white shadow-[2px_2px_0px_#1a1a1a]' : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'}`}
                aria-label="Mint"
             >
                {stage === AppStage.MINTING ? '...' : 'MINT'}
             </button>
          </div>
        </div>

        {/* Color Palette */}
        <div className="flex justify-center gap-3 overflow-x-auto py-2 max-w-[400px] mx-auto scrollbar-hide">
          {PALETTE.map((color) => (
            <button
              key={color.hex}
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
              aria-label={color.name}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}