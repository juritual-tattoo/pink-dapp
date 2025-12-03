# Variáveis de Ambiente

## Configuração

O projeto usa variáveis de ambiente para configurações sensíveis como chaves de API.

### Arquivos Criados

1. **`.env.example`** - Template com todas as variáveis necessárias (pode ser commitado)
2. **`.env.local`** - Suas variáveis locais (ignorado pelo git)

### Variáveis Disponíveis

#### `GEMINI_API_KEY`

- **Tipo:** String
- **Obrigatório:** Não (opcional para funcionalidades futuras)
- **Descrição:** Chave da API do Google Gemini
- **Como obter:** [Google AI Studio](https://makersuite.google.com/app/apikey)

### Como Usar

1. **Copie o arquivo de exemplo:**

   ```bash
   cp .env.example .env.local
   ```

2. **Edite `.env.local` e adicione suas chaves:**

   ```bash
   GEMINI_API_KEY=sua_chave_aqui
   ```

3. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

### Importante

- ✅ `.env.example` pode ser commitado (não contém valores reais)
- ❌ `.env.local` NUNCA deve ser commitado (já está no `.gitignore`)
- 🔒 Mantenha suas chaves seguras e nunca as compartilhe publicamente

### Como Funciona

O Vite carrega automaticamente variáveis de ambiente de arquivos `.env`:

- `.env` - Carregado em todos os ambientes
- `.env.local` - Carregado em todos os ambientes, ignorado pelo git
- `.env.[mode]` - Carregado apenas no modo especificado (ex: `.env.development`)
- `.env.[mode].local` - Carregado apenas no modo especificado, ignorado pelo git

### Acesso no Código

As variáveis são expostas via `process.env`:

```typescript
// No código TypeScript/JavaScript
const apiKey = process.env.GEMINI_API_KEY;
```

### Troubleshooting

**Problema:** Variáveis não estão sendo carregadas

- ✅ Verifique se o arquivo `.env.local` existe na raiz do projeto
- ✅ Reinicie o servidor de desenvolvimento após criar/editar `.env.local`
- ✅ Verifique se não há espaços ao redor do `=` (ex: `KEY=value` não `KEY = value`)

**Problema:** Erro de "API_KEY is undefined"

- ✅ Certifique-se de que a variável está definida no `.env.local`
- ✅ Verifique se o nome da variável está correto (case-sensitive)
