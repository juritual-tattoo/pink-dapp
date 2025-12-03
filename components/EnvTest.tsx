/**
 * Componente de teste para verificar se variáveis de ambiente estão sendo carregadas
 * Remova este componente após confirmar que está funcionando
 */
import React from 'react';
import { getGeminiApiKey, hasGeminiApiKey } from '../utils/env';

export default function EnvTest() {
  let apiKey: string | undefined;
  let hasKey = false;
  let viaImportMeta: string | undefined;
  let viaProcessEnv: string | undefined;

  try {
    apiKey = getGeminiApiKey();
    hasKey = hasGeminiApiKey();

    // Tentar todas as formas possíveis de acessar
    try {
      // @ts-expect-error - import.meta está disponível no Vite
      viaImportMeta = import.meta?.env?.VITE_GEMINI_API_KEY;
    } catch {
      viaImportMeta = undefined;
    }

    try {
      viaProcessEnv = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
    } catch {
      viaProcessEnv = undefined;
    }
  } catch (error) {
    console.error('[EnvTest] Erro ao acessar variáveis:', error);
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#fff',
        border: '2px solid #000',
        padding: '10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '400px',
        boxShadow: '4px 4px 0px rgba(0,0,0,1)',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
        🔍 Teste de Variáveis de Ambiente
      </h3>
      <div style={{ marginBottom: '5px' }}>
        <strong>hasGeminiApiKey():</strong> {hasKey ? '✅ SIM' : '❌ NÃO'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>getGeminiApiKey():</strong>{' '}
        {apiKey ? `✅ ${apiKey.substring(0, 15)}...` : '❌ undefined'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>import.meta.env.VITE_GEMINI_API_KEY:</strong>{' '}
        {viaImportMeta ? `✅ ${String(viaImportMeta).substring(0, 15)}...` : '❌ undefined'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>process.env.GEMINI_API_KEY:</strong>{' '}
        {viaProcessEnv ? `✅ ${String(viaProcessEnv).substring(0, 15)}...` : '❌ undefined'}
      </div>
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        {hasKey
          ? '✅ Variável carregada com sucesso!'
          : '⚠️ Variável não encontrada. Verifique .env.local e reinicie o servidor.'}
      </div>
    </div>
  );
}
