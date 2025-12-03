# Diagnóstico - Tela Branca

## Problema

Tela branca sem avisos no console.

## Possíveis Causas

### 1. CSS não está sendo processado

**Sintoma:** Estilos Tailwind não funcionam

**Solução Testada:**

- ✅ Tailwind CSS v3 instalado
- ✅ PostCSS configurado
- ✅ CSS importado no `index.tsx`
- ✅ Configuração do Tailwind criada

**Próximo passo:** Verificar se o Vite está processando o PostCSS corretamente.

---

### 2. Erro silencioso no React

**Sintoma:** Componente não renderiza

**Verificações:**

- [ ] Abrir DevTools → Console (F12)
- [ ] Verificar se há erros em vermelho
- [ ] Verificar aba Network para recursos que falharam

---

### 3. Problema com import do CSS

**Sintoma:** CSS não carrega

**Solução Alternativa:**
Mover o CSS para a raiz ou usar import diferente:

```typescript
// Opção 1: Mover CSS para raiz
import './index.css';

// Opção 2: Importar no HTML
<link rel="stylesheet" href="/src/index.css">
```

---

## Checklist de Verificação

1. **Verificar Console do Navegador:**
   - Abra DevTools (F12)
   - Vá para aba Console
   - Procure por erros em vermelho

2. **Verificar Network:**
   - Aba Network no DevTools
   - Recarregue a página
   - Procure por requisições que falharam (vermelho)

3. **Verificar se CSS está sendo carregado:**
   - Aba Network → Filtre por CSS
   - Verifique se `index.css` aparece e tem status 200

4. **Testar sem Tailwind:**
   - Comente temporariamente o import do CSS
   - Veja se a aplicação renderiza (mesmo sem estilos)

---

## Solução Rápida - Teste

Execute no terminal:

```bash
# Limpar cache
make clean-cache

# Reinstalar dependências
make install

# Iniciar dev server
make dev
```

Depois:

1. Abra http://localhost:3000
2. Abra DevTools (F12)
3. Vá para Console
4. Me diga quais erros aparecem (se houver)
