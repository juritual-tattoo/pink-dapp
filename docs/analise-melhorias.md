_Relatório de melhorias por categoria:_

## Análise do sistema — melhorias necessárias

### 1. Erros críticos de sintaxe

```44:52:App.tsx
  const handleDownload = () => {
    if (canvasRef) {
      const link = document.createElement('a');
      link.download = 'inkpink-flash.png';
      link.href = canvasRef.toDataURL('image/png');
      link.click();
      mcp.logEvent('draw.complete', { method: 'download' });
    }
  };
```

Problema: falta tratamento de erro caso `canvasRef` seja `null` ou `toDataURL()` falhe.

### 2. Tratamento de erros ausente

- Sem try/catch em operações críticas
- Sem tratamento de falhas de localStorage
- Sem tratamento de erros de renderização do canvas
- Sem tratamento de erros de rede (quando integrar APIs reais)
- Sem Error Boundaries do React

### 3. Performance

```156:197:components/CanvasBoard.tsx
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Draw Template (Background Layer - 10% Opacity)
    // In a real app, this would be an Image object.
    // For MVP, we draw the simplified SVG path or shapes.
    ctx.save();
    ctx.globalAlpha = 0.1;
    const img = new Image();
    img.src = FLASH_TEMPLATE_URI;
    // We assume image loads fast since it's data URI, but normally use onload
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.restore();

    // 2. Draw Pixels
    pixels.forEach((color, key) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });

    // 3. Grid Lines (Optional - very faint)
    ctx.strokeStyle = '#000000';
    ctx.globalAlpha = 0.05;
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    for (let i = 0; i <= CANVAS_SIZE; i++) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
    }
    ctx.stroke();

  }, [pixels]);
```

Problemas:

- Imagem recriada a cada render
- Grid redesenhado a cada mudança de pixel
- Sem debounce/throttle em eventos de mouse/touch
- Histórico pode crescer sem limite

### 4. Acessibilidade

- Falta `aria-label` em alguns botões
- Falta feedback de teclado
- Falta navegação por teclado
- Falta suporte a leitores de tela
- Falta contraste adequado em alguns elementos

### 5. Segurança

```22:27:services/mcp.ts
  constructor() {
    // Check for existing session (cookie simulation)
    const saved = localStorage.getItem('inkpink_session');
    if (saved) {
      this.walletState = JSON.parse(saved);
    }
  }
```

Problemas:

- `JSON.parse` sem validação (risco de XSS)
- Dados sensíveis em localStorage sem criptografia
- Sem sanitização de dados de entrada
- Sem validação de tipos em dados persistidos

### 6. TypeScript

```43:63:services/mcp.ts
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
```

Problemas:

- Uso de `any` em `payload`
- Sem tipos específicos para cada evento
- Sem validação de runtime

### 7. UX/UI

- Notificações sem persistência (desaparecem rápido)
- Sem feedback visual durante minting
- Sem confirmação antes de ações destrutivas
- Sem indicador de carregamento
- Sem mensagens de erro amigáveis

### 8. Código e arquitetura

```23:33:App.tsx
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
```

Problemas:

- Dependência incorreta no `useEffect` (deveria ser `[]`)
- Lógica de negócio no componente
- Sem separação de responsabilidades
- Funções não memoizadas adequadamente

### 9. Testes

- Sem testes unitários
- Sem testes de integração
- Sem testes E2E
- Sem configuração de CI/CD

### 10. Configuração e dependências

```11:14:package.json
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
```

Problemas:

- Sem lockfile (`package-lock.json` ou `yarn.lock`)
- Sem scripts de lint/test
- Sem configuração de ESLint/Prettier
- Dependências muito recentes (risco de bugs)

### 11. Documentação

- README básico
- Sem documentação de API
- Sem comentários JSDoc
- Sem guia de contribuição
- Sem changelog

### 12. Problemas específicos do código

```171:174:components/CanvasBoard.tsx
    const img = new Image();
    img.src = FLASH_TEMPLATE_URI;
    // We assume image loads fast since it's data URI, but normally use onload
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
```

Problema: imagem pode não estar carregada ao chamar `drawImage()`.

```77:100:components/CanvasBoard.tsx
  const drawPixel = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    const currentPixel = pixels.get(key);

    // Prevent redraw same color (optimization)
    if (currentPixel === currentColor && !isEraser) return;
    if (!currentPixel && isEraser) return;

    const newPixels = new Map(pixels);

    if (isEraser) {
      newPixels.delete(key);
    } else {
      newPixels.set(key, currentColor);
    }

    setPixels(newPixels);

    // Notify MCP only on drawing, not erasing empty
    if (!isEraser || currentPixel) {
      mcp.logEvent('draw.pixel', { x, y, color: isEraser ? 'none' : currentColor });
      onInteract();
    }
  }, [pixels, currentColor, isEraser, onInteract]);
```

Problema: `useCallback` recriado a cada mudança de `pixels`, reduzindo eficiência.

### 13. Validação de dados

- Sem validação de coordenadas do canvas
- Sem validação de cores
- Sem validação de estado da wallet
- Sem validação de eventos MCP

### 14. Otimizações de memória

```32:34:components/CanvasBoard.tsx
  const initialMap = useMemo(() => new Map<string, string>(), []);
  const [history, setHistory] = useState<Map<string, string>[]>([initialMap]);
  const [historyStep, setHistoryStep] = useState(0);
```

Problema: histórico pode crescer indefinidamente sem limite.

### 15. Internacionalização (i18n)

- Textos hardcoded em inglês
- Sem suporte a múltiplos idiomas
- Sem estrutura para traduções

---

## Priorização de melhorias

### Crítico (fazer primeiro)

1. Corrigir erro de sintaxe em `handleDownload`
2. Adicionar tratamento de erros básico
3. Corrigir dependência do `useEffect` em `App.tsx`
4. Adicionar validação de dados do localStorage
5. Corrigir carregamento de imagem no canvas

### Alto (próximas)

6. Adicionar Error Boundaries
7. Limitar tamanho do histórico
8. Otimizar performance do canvas
9. Adicionar validação de tipos TypeScript
10. Melhorar acessibilidade

### Médio

11. Adicionar testes unitários
12. Configurar ESLint/Prettier
13. Adicionar feedback visual melhor
14. Separar lógica de negócio
15. Adicionar documentação

### Baixo

16. Internacionalização
17. CI/CD
18. Análise de bundle
19. PWA
20. Analytics
