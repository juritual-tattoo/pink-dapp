/**
 * Sistema de Internacionalização (i18n) profissional
 */

export type Locale = 'pt-BR' | 'en-US';

export interface Translations {
  // App geral
  app: {
    title: string;
    subtitle: string;
    version: string;
    poweredBy: string;
  };

  // Onboarding
  onboarding: {
    startSession: string;
  };

  // Header
  header: {
    level: string;
    offline: string;
  };

  // Notifications
  notifications: {
    walletActivated: string;
    downloadStarted: string;
    downloadError: string;
    downloadErrorEmpty: string;
    minting: string;
    mintingSuccess: string;
    mintingError: string;
    mintingErrorNoWallet: string;
  };

  // Canvas
  canvas: {
    brushTool: string;
    eraserTool: string;
    undo: string;
    redo: string;
    download: string;
    mint: string;
    minting: string;
  };

  // Completion Modal
  completion: {
    title: string;
    message: string;
    backToStudio: string;
  };

  // Error Boundary
  error: {
    title: string;
    message: string;
    technicalDetails: string;
    tryAgain: string;
  };

  // Colors
  colors: {
    inkBlack: string;
    juPink: string;
    oldSchoolRed: string;
    gold: string;
    venomGreen: string;
    skyBlue: string;
    ghostWhite: string;
  };
}

const translations: Record<Locale, Translations> = {
  'pt-BR': {
    app: {
      title: 'INK\nPINK',
      subtitle:
        'Micro-ecosistema para flash tattoos pixeladas. Comece a pintar para desbloquear sua identidade.',
      version: 'v0.1',
      poweredBy: 'POWERED BY MCP &bull; JU TATTOO',
    },
    onboarding: {
      startSession: 'INICIAR SESSÃO',
    },
    header: {
      level: 'NÍVEL 1',
      offline: 'OFFLINE',
    },
    notifications: {
      walletActivated: 'Camada de Segurança Ativada. Wallet Gerada.',
      downloadStarted: 'Download iniciado! Seu arquivo será salvo como inkpink-flash.png',
      downloadError:
        'Ops! Não foi possível fazer o download. Verifique se há algo desenhado no canvas.',
      downloadErrorEmpty: 'Canvas não disponível para download. Por favor, desenhe algo primeiro.',
      minting: 'Processando minting... Isso pode levar alguns segundos.',
      mintingSuccess: 'NFT Minted com sucesso! Seu flash tattoo está agora na blockchain Polygon.',
      mintingError: 'Erro ao fazer mint. Tente novamente.',
      mintingErrorNoWallet:
        'Você precisa criar sua wallet primeiro! Continue desenhando para ganhar XP.',
    },
    canvas: {
      brushTool: 'Ferramenta Pincel',
      eraserTool: 'Ferramenta Borracha',
      undo: 'Desfazer',
      redo: 'Refazer',
      download: 'Download',
      mint: 'MINT',
      minting: 'MINTING...',
    },
    completion: {
      title: 'OBRA-PRIMA.',
      message: 'Seu flash 8-bit foi imortalizado. Você ganhou',
      backToStudio: 'VOLTAR AO ESTÚDIO',
    },
    error: {
      title: 'OPS!',
      message: 'Algo deu errado. Não se preocupe, seus dados estão seguros.',
      technicalDetails: 'Detalhes técnicos',
      tryAgain: 'TENTAR NOVAMENTE',
    },
    colors: {
      inkBlack: 'Tinta Preta',
      juPink: 'Ju Pink',
      oldSchoolRed: 'Vermelho Old School',
      gold: 'Dourado',
      venomGreen: 'Verde Veneno',
      skyBlue: 'Azul Céu',
      ghostWhite: 'Branco Fantasma',
    },
  },
  'en-US': {
    app: {
      title: 'INK\nPINK',
      subtitle:
        'Micro-ecosystem for pixelated flash tattoos. Start painting to unlock your identity.',
      version: 'v0.1',
      poweredBy: 'POWERED BY MCP &bull; JU TATTOO',
    },
    onboarding: {
      startSession: 'START SESSION',
    },
    header: {
      level: 'LEVEL 1',
      offline: 'OFFLINE',
    },
    notifications: {
      walletActivated: 'Security Layer Activated. Wallet Generated.',
      downloadStarted: 'Download started! Your file will be saved as inkpink-flash.png',
      downloadError: 'Oops! Could not download. Check if there is something drawn on the canvas.',
      downloadErrorEmpty: 'Canvas not available for download. Please draw something first.',
      minting: 'Processing minting... This may take a few seconds.',
      mintingSuccess:
        'NFT Minted successfully! Your flash tattoo is now on the Polygon blockchain.',
      mintingError: 'Error minting. Please try again.',
      mintingErrorNoWallet: 'You need to create your wallet first! Keep drawing to earn XP.',
    },
    canvas: {
      brushTool: 'Brush Tool',
      eraserTool: 'Eraser Tool',
      undo: 'Undo',
      redo: 'Redo',
      download: 'Download',
      mint: 'MINT',
      minting: 'MINTING...',
    },
    completion: {
      title: 'MASTERPIECE.',
      message: 'Your 8-bit flash has been immortalized. You earned',
      backToStudio: 'BACK TO STUDIO',
    },
    error: {
      title: 'OOPS!',
      message: "Something went wrong. Don't worry, your data is safe.",
      technicalDetails: 'Technical details',
      tryAgain: 'TRY AGAIN',
    },
    colors: {
      inkBlack: 'Ink Black',
      juPink: 'Ju Pink',
      oldSchoolRed: 'Old School Red',
      gold: 'Gold',
      venomGreen: 'Venom Green',
      skyBlue: 'Sky Blue',
      ghostWhite: 'Ghost White',
    },
  },
};

let currentLocale: Locale = 'pt-BR';

/**
 * Define o locale atual
 */
export function setLocale(locale: Locale): void {
  if (translations[locale]) {
    currentLocale = locale;
    // Salvar preferência no localStorage
    try {
      localStorage.setItem('inkpink_locale', locale);
    } catch {
      // Ignorar erro se localStorage não estiver disponível
    }
  }
}

/**
 * Obtém o locale atual
 */
export function getLocale(): Locale {
  // Tentar carregar do localStorage
  try {
    const saved = localStorage.getItem('inkpink_locale');
    if (saved && (saved === 'pt-BR' || saved === 'en-US')) {
      currentLocale = saved as Locale;
    }
  } catch {
    // Usar padrão se não conseguir ler
  }

  return currentLocale;
}

/**
 * Obtém todas as traduções para o locale atual
 */
export function getTranslations(): Translations {
  return translations[getLocale()];
}

/**
 * Hook-like function para obter traduções (para uso em componentes)
 */
export function useTranslation() {
  const t = getTranslations();

  return {
    t,
    locale: getLocale(),
    setLocale,
  };
}

// Inicializar locale ao carregar
if (typeof window !== 'undefined') {
  getLocale();
}
