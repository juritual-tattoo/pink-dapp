/**
 * Utilitário para acessar variáveis de ambiente
 * Compatível com Vite (import.meta.env) e Node.js (process.env)
 */

// No Vite, variáveis com prefixo VITE_ são expostas automaticamente via import.meta.env
// Variáveis sem prefixo precisam ser definidas no vite.config.ts via define
export const getGeminiApiKey = (): string | undefined => {
  try {
    // Tentar import.meta.env primeiro (padrão Vite - variáveis com prefixo VITE_)
    try {
      // @ts-expect-error - import.meta está disponível no Vite
      const viteKey = import.meta?.env?.VITE_GEMINI_API_KEY;
      if (viteKey) return viteKey;
    } catch {
      // Ignorar erro se import.meta não estiver disponível
    }

    // Fallback para process.env (definido no vite.config.ts via define)
    if (typeof process !== 'undefined' && process.env) {
      return process.env.GEMINI_API_KEY || process.env.API_KEY;
    }
  } catch (error) {
    console.warn('[getGeminiApiKey] Erro ao acessar variáveis:', error);
  }

  return undefined;
};

// Verificar se a chave está configurada
export const hasGeminiApiKey = (): boolean => {
  const key = getGeminiApiKey();
  return !!key && key.trim().length > 0;
};
