# Troubleshooting - Resolução de Erros

## Erros Comuns e Soluções

### ✅ Erros Resolvidos

#### 1. `favicon.ico: Failed to load resource: 404`

**Status:** ✅ Resolvido

**Solução:**

- Criado `public/favicon.svg`
- Adicionado link no `index.html`
- O Vite serve automaticamente arquivos da pasta `public/`

---

### ⚠️ Avisos (Não são erros críticos)

#### 1. `cdn.tailwindcss.com should not be used in production`

**Status:** ⚠️ Aviso (não é erro)

**Explicação:**
O Tailwind CSS está sendo carregado via CDN, o que funciona mas não é recomendado para produção.

**Solução Recomendada (para produção):**

```bash
# Instalar Tailwind CSS como dependência
npm install -D tailwindcss postcss autoprefixer

# Inicializar configuração
npx tailwindcss init -p

# Criar arquivo CSS principal (src/index.css)
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Por enquanto:** O CDN funciona perfeitamente para desenvolvimento. O aviso pode ser ignorado durante o desenvolvimento.

---

### ❌ Erros de Extensões do Chrome (Ignorar)

Os seguintes erros **NÃO são do seu projeto**:

```
fte-utils.js: Failed to load resource
express-fte.js: Failed to load resource
util.js: Failed to load resource
injectedScript.bundle.js: Failed to load resource
chrome-extension://efaidnbmnnnibpcajpcglclefindmkaj/...
```

**Explicação:**
Esses erros são de extensões do Chrome instaladas no seu navegador. Eles não afetam seu projeto.

**Solução:**

- Pode ignorar completamente
- Ou desabilitar extensões temporariamente para desenvolvimento
- Ou usar modo anônimo/privado para testar sem extensões

---

## Checklist de Verificação

- [x] Favicon criado e configurado
- [ ] Tailwind CSS instalado como dependência (opcional para produção)
- [ ] Extensões do Chrome identificadas como não-problema

---

## Próximos Passos

1. **Para desenvolvimento:** Continue usando o CDN do Tailwind (funciona perfeitamente)
2. **Para produção:** Instale Tailwind CSS como dependência (veja solução acima)
3. **Erros de extensão:** Pode ignorar completamente
