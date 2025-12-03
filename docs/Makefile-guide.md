# Guia do Makefile - Pink DApp

Este documento explica como usar o Makefile do projeto para facilitar o desenvolvimento.

## 🚀 Início Rápido

```bash
# Ver todos os comandos disponíveis
make help

# Instalar dependências
make install

# Iniciar desenvolvimento
make dev

# Criar build de produção
make build
```

## 📋 Comandos Principais

### Desenvolvimento

| Comando             | Descrição                                           |
| ------------------- | --------------------------------------------------- |
| `make dev`          | Inicia servidor de desenvolvimento (Vite)           |
| `make dev-open`     | Inicia servidor e abre no navegador automaticamente |
| `make preview`      | Preview do build de produção                        |
| `make preview-open` | Preview e abre no navegador                         |

### Build

| Comando               | Descrição                                                |
| --------------------- | -------------------------------------------------------- |
| `make build`          | Cria build de produção otimizado                         |
| `make build-analyze`  | Cria build e mostra tamanho dos arquivos                 |
| `make bundle-analyze` | Análise visual do bundle (requer vite-bundle-visualizer) |

### Testes

| Comando              | Descrição                                 |
| -------------------- | ----------------------------------------- |
| `make test`          | Executa testes unitários                  |
| `make test-watch`    | Executa testes em modo watch              |
| `make test-coverage` | Executa testes com relatório de cobertura |
| `make setup-tests`   | Instala e configura Vitest                |

### Qualidade de Código

| Comando             | Descrição                                                  |
| ------------------- | ---------------------------------------------------------- |
| `make lint`         | Executa ESLint                                             |
| `make lint-fix`     | Executa ESLint e corrige automaticamente                   |
| `make format`       | Formata código com Prettier                                |
| `make format-check` | Verifica formatação sem modificar                          |
| `make type-check`   | Verifica tipos TypeScript                                  |
| `make check-all`    | Executa todas as verificações (lint + type-check + format) |

### Dependências

| Comando               | Descrição                                        |
| --------------------- | ------------------------------------------------ |
| `make install`        | Instala dependências (npm ci)                    |
| `make install-dev`    | Instala dependências incluindo devDependencies   |
| `make deps-update`    | Atualiza dependências para versões mais recentes |
| `make deps-check`     | Verifica dependências desatualizadas             |
| `make deps-audit`     | Verifica vulnerabilidades                        |
| `make deps-audit-fix` | Corrige vulnerabilidades automaticamente         |

### Limpeza

| Comando            | Descrição                               |
| ------------------ | --------------------------------------- |
| `make clean`       | Remove tudo (node_modules, dist, cache) |
| `make clean-cache` | Remove apenas cache                     |
| `make clean-deps`  | Remove apenas node_modules              |

### Setup de Ferramentas

| Comando             | Descrição                      |
| ------------------- | ------------------------------ |
| `make setup-lint`   | Instala e configura ESLint     |
| `make setup-format` | Instala e configura Prettier   |
| `make setup-tests`  | Instala e configura Vitest     |
| `make setup-all`    | Configura todas as ferramentas |

### Versionamento

| Comando              | Descrição                               |
| -------------------- | --------------------------------------- |
| `make version-patch` | Incrementa versão patch (0.0.1 → 0.0.2) |
| `make version-minor` | Incrementa versão minor (0.0.1 → 0.1.0) |
| `make version-major` | Incrementa versão major (0.0.1 → 1.0.0) |

### Git

| Comando                        | Descrição               |
| ------------------------------ | ----------------------- |
| `make git-status`              | Mostra status do Git    |
| `make git-commit M="mensagem"` | Faz commit com mensagem |

### Informações

| Comando     | Descrição                               |
| ----------- | --------------------------------------- |
| `make info` | Mostra informações do projeto e versões |
| `make help` | Mostra ajuda completa                   |

## 🔄 Fluxos de Trabalho Comuns

### Primeira Configuração

```bash
# 1. Instalar dependências
make install

# 2. Configurar ferramentas (opcional)
make setup-all

# 3. Verificar tudo
make check-all

# 4. Iniciar desenvolvimento
make dev
```

### Antes de Commitar

```bash
# Executar todas as verificações
make check-all

# Se houver problemas, corrigir
make lint-fix
make format

# Verificar novamente
make check-all
```

### Antes de Deploy

```bash
# 1. Verificar código
make check-all

# 2. Executar testes
make test

# 3. Criar build
make build

# 4. Preview do build
make preview

# 5. Deploy
make deploy
```

### Atualizar Dependências

```bash
# 1. Verificar atualizações disponíveis
make deps-check

# 2. Verificar vulnerabilidades
make deps-audit

# 3. Atualizar dependências
make deps-update

# 4. Verificar se tudo ainda funciona
make check-all
make test
```

## 💡 Dicas

1. **Use `make help`** para ver todos os comandos disponíveis
2. **Use `make check-all`** antes de commitar código
3. **Use `make clean-cache`** se tiver problemas estranhos no desenvolvimento
4. **Use `make info`** para verificar versões instaladas
5. **Use `make build-analyze`** para otimizar o tamanho do bundle

## 🐛 Troubleshooting

### Comando não encontrado

```bash
# Verificar se Make está instalado
make --version

# No macOS
brew install make

# No Ubuntu/Debian
sudo apt-get install make
```

### Erro de permissão

```bash
# Dar permissão de execução (se necessário)
chmod +x Makefile
```

### Comandos específicos não funcionam

Alguns comandos requerem ferramentas específicas instaladas:

- `make lint` → Requer ESLint configurado (`make setup-lint`)
- `make format` → Requer Prettier configurado (`make setup-format`)
- `make test` → Requer Vitest configurado (`make setup-tests`)

## 📚 Recursos Adicionais

- [Documentação do Make](https://www.gnu.org/software/make/manual/)
- [Makefile Best Practices](https://www.gnu.org/software/make/manual/html_node/Introduction.html)
