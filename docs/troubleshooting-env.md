# Troubleshooting - Variáveis de Ambiente

## Problema: Variáveis de ambiente não estão sendo carregadas

### ✅ Checklist de Verificação

1. **Arquivo `.env.local` existe na raiz do projeto?**

   ```bash
   ls -la .env.local
   ```

   Deve mostrar o arquivo.

2. **Arquivo `.env.local` tem o formato correto?**

   ```bash
   cat .env.local
   ```

   Deve mostrar:

   ```
   GEMINI_API_KEY=sua_chave_aqui
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```

   ⚠️ **IMPORTANTE:** Não deve haver espaços ao redor do `=`

3. **Servidor foi reiniciado após criar/editar `.env.local`?**
   - Pare o servidor (Ctrl+C)
   - Inicie novamente: `npm run dev`
   - ⚠️ O Vite só carrega variáveis de ambiente na inicialização

4. **Componente de teste está visível?**
   - Abra a aplicação no navegador
   - Deve aparecer um box no canto superior direito com o status das variáveis
   - Se não aparecer, verifique o console do navegador (F12)

### 🔍 Teste Visual

Um componente de teste foi adicionado ao `App.tsx` que mostra visualmente se as variáveis estão sendo carregadas. Ele aparece no canto superior direito da tela.

**Para remover após confirmar que funciona:**

1. Remova a linha `import EnvTest from './components/EnvTest';` do `App.tsx`
2. Remova a linha `<EnvTest />` do JSX
3. Delete o arquivo `components/EnvTest.tsx`

### 🐛 Problemas Comuns

#### Problema 1: Variável aparece como `undefined`

**Causa:** Servidor não foi reiniciado após criar `.env.local`

**Solução:**

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

#### Problema 2: Variável aparece como `undefined` mesmo após reiniciar

**Causa:** Formato incorreto no `.env.local`

**Solução:**

- Verifique se não há espaços: `GEMINI_API_KEY=valor` (não `GEMINI_API_KEY = valor`)
- Verifique se não há aspas desnecessárias: `GEMINI_API_KEY=valor` (não `GEMINI_API_KEY="valor"`)
- Verifique se não há linhas em branco antes da variável

#### Problema 3: `import.meta.env.VITE_GEMINI_API_KEY` funciona mas `process.env.GEMINI_API_KEY` não

**Causa:** Isso é normal! No Vite, variáveis com prefixo `VITE_` são expostas automaticamente via `import.meta.env`. Variáveis sem prefixo precisam ser definidas no `vite.config.ts`.

**Solução:** Use `import.meta.env.VITE_GEMINI_API_KEY` ou o utilitário `getGeminiApiKey()` que tenta ambas as formas.

#### Problema 4: Variável funciona em desenvolvimento mas não em produção

**Causa:** Variáveis de ambiente precisam estar disponíveis no ambiente de produção.

**Solução:**

- Para Vercel: Configure no painel de variáveis de ambiente
- Para Netlify: Configure no painel de configurações
- Para build local: Crie `.env.production.local`

### 📝 Como Verificar se Está Funcionando

1. **Via Console do Navegador:**

   ```javascript
   // Abra o console (F12) e digite:
   console.log(import.meta.env.VITE_GEMINI_API_KEY);
   // Deve mostrar sua chave (ou undefined se não estiver configurada)
   ```

2. **Via Componente de Teste:**
   - O componente `EnvTest` mostra visualmente o status
   - Aparece no canto superior direito da tela

3. **Via Log no Console:**
   - Abra o console do navegador (F12)
   - Procure por: `[App] GEMINI_API_KEY carregada: ...`

### 🔧 Comandos Úteis

```bash
# Verificar se o arquivo existe
ls -la .env.local

# Ver conteúdo do arquivo (sem mostrar a chave completa)
cat .env.local | grep -E "^[A-Z_]+=" | sed 's/=.*/=***/'

# Verificar se há espaços ou problemas de formato
cat -A .env.local

# Testar se o Vite está carregando
npm run dev
# Depois abra http://localhost:3000 e verifique o console
```

### 📚 Referências

- [Documentação do Vite - Variáveis de Ambiente](https://vitejs.dev/guide/env-and-mode.html)
- [Documentação do Vite - loadEnv](https://vitejs.dev/config/shared-options.html#loadenv)

### ✅ Solução Final

Se nada funcionar, tente:

1. **Criar arquivo `.env` na raiz** (sem `.local`):

   ```bash
   cp .env.local .env
   ```

2. **Reiniciar completamente:**

   ```bash
   # Pare o servidor
   # Limpe o cache
   rm -rf node_modules/.vite
   # Reinicie
   npm run dev
   ```

3. **Verificar se o Vite está usando o modo correto:**
   - O Vite carrega `.env.local` em todos os modos
   - Mas verifique se não há conflito com `.env.development` ou `.env.production`
