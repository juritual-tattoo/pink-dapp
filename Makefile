# Makefile para Pink DApp
# Makefile profissional com comandos úteis para desenvolvimento, build e deploy

.PHONY: help install dev build preview test lint format clean deps-update deps-check bundle-analyze type-check check-all docker-build docker-run deploy docs

# Variáveis
NODE_VERSION := 18
NPM := npm
NODE := node
NPM_CI := $(NPM) ci
NPM_RUN := $(NPM) run
NPM_INSTALL := $(NPM) install

# Cores para output
COLOR_RESET := \033[0m
COLOR_BOLD := \033[1m
COLOR_GREEN := \033[32m
COLOR_YELLOW := \033[33m
COLOR_BLUE := \033[34m
COLOR_RED := \033[31m

# Detectar sistema operacional
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
	OPEN_CMD := xdg-open
endif
ifeq ($(UNAME_S),Darwin)
	OPEN_CMD := open
endif
ifeq ($(UNAME_S),Windows_NT)
	OPEN_CMD := start
endif

# Help - Comando padrão
help: ## Mostra esta mensagem de ajuda
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)╔════════════════════════════════════════════════════════════╗$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)║$(COLOR_RESET)  $(COLOR_BOLD)Pink DApp - Makefile Commands$(COLOR_RESET)                           $(COLOR_BOLD)$(COLOR_BLUE)║$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)╚════════════════════════════════════════════════════════════╝$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BOLD)Comandos disponíveis:$(COLOR_RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_GREEN)%-20s$(COLOR_RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(COLOR_BOLD)Exemplos:$(COLOR_RESET)"
	@echo "  $(COLOR_YELLOW)make dev$(COLOR_RESET)          - Inicia servidor de desenvolvimento"
	@echo "  $(COLOR_YELLOW)make build$(COLOR_RESET)         - Cria build de produção"
	@echo "  $(COLOR_YELLOW)make check-all$(COLOR_RESET)     - Executa todas as verificações"
	@echo ""

# Instalação
install: ## Instala dependências do projeto
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)📦 Instalando dependências...$(COLOR_RESET)"
	@if [ -f "package-lock.json" ]; then \
		$(NPM_CI); \
	else \
		echo "$(COLOR_YELLOW)⚠️  package-lock.json não encontrado. Usando npm install...$(COLOR_RESET)"; \
		$(NPM_INSTALL); \
	fi
	@echo "$(COLOR_GREEN)✅ Dependências instaladas com sucesso!$(COLOR_RESET)"

install-dev: ## Instala dependências incluindo devDependencies
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)📦 Instalando dependências de desenvolvimento...$(COLOR_RESET)"
	@$(NPM_INSTALL)
	@echo "$(COLOR_GREEN)✅ Dependências instaladas com sucesso!$(COLOR_RESET)"

# Desenvolvimento
dev: ## Inicia servidor de desenvolvimento
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🚀 Iniciando servidor de desenvolvimento...$(COLOR_RESET)"
	@$(NPM_RUN) dev

dev-open: ## Inicia servidor e abre no navegador
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🚀 Iniciando servidor de desenvolvimento...$(COLOR_RESET)"
	@$(NPM_RUN) dev &
	@sleep 3
	@$(OPEN_CMD) http://localhost:5173

# Build
build: ## Cria build de produção
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔨 Criando build de produção...$(COLOR_RESET)"
	@$(NPM_RUN) build
	@echo "$(COLOR_GREEN)✅ Build criado com sucesso em ./dist$(COLOR_RESET)"

build-analyze: ## Cria build e analisa tamanho do bundle
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔨 Criando build e analisando bundle...$(COLOR_RESET)"
	@$(NPM_RUN) build
	@echo "$(COLOR_BOLD)$(COLOR_YELLOW)📊 Análise do bundle:$(COLOR_RESET)"
	@du -sh dist/*
	@echo "$(COLOR_GREEN)✅ Análise concluída!$(COLOR_RESET)"

preview: ## Preview do build de produção
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)👀 Iniciando preview do build...$(COLOR_RESET)"
	@$(NPM_RUN) preview

preview-open: ## Preview do build e abre no navegador
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)👀 Iniciando preview do build...$(COLOR_RESET)"
	@$(NPM_RUN) preview &
	@sleep 3
	@$(OPEN_CMD) http://localhost:4173

# Testes
test: ## Executa testes unitários
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🧪 Executando testes...$(COLOR_RESET)"
	@if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then \
		$(NPM_RUN) test; \
	else \
		echo "$(COLOR_YELLOW)⚠️  Testes não configurados. Execute 'make setup-tests' primeiro.$(COLOR_RESET)"; \
	fi

test-watch: ## Executa testes em modo watch
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🧪 Executando testes em modo watch...$(COLOR_RESET)"
	@if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then \
		$(NPM_RUN) test:watch; \
	else \
		echo "$(COLOR_YELLOW)⚠️  Testes não configurados. Execute 'make setup-tests' primeiro.$(COLOR_RESET)"; \
	fi

test-coverage: ## Executa testes com cobertura
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🧪 Executando testes com cobertura...$(COLOR_RESET)"
	@if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then \
		$(NPM_RUN) test:coverage; \
	else \
		echo "$(COLOR_YELLOW)⚠️  Testes não configurados. Execute 'make setup-tests' primeiro.$(COLOR_RESET)"; \
	fi

# Lint e Format
lint: ## Executa ESLint
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔍 Executando ESLint...$(COLOR_RESET)"
	@if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ]; then \
		$(NPM_RUN) lint || echo "$(COLOR_YELLOW)⚠️  ESLint não configurado. Execute 'make setup-lint' primeiro.$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠️  ESLint não configurado. Execute 'make setup-lint' primeiro.$(COLOR_RESET)"; \
	fi

lint-fix: ## Executa ESLint e corrige problemas automaticamente
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔧 Corrigindo problemas do ESLint...$(COLOR_RESET)"
	@if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ]; then \
		$(NPM_RUN) lint:fix || echo "$(COLOR_YELLOW)⚠️  ESLint não configurado.$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠️  ESLint não configurado. Execute 'make setup-lint' primeiro.$(COLOR_RESET)"; \
	fi

format: ## Formata código com Prettier
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)💅 Formatando código com Prettier...$(COLOR_RESET)"
	@if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ] || [ -f "prettier.config.js" ]; then \
		$(NPM_RUN) format || npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}" || echo "$(COLOR_YELLOW)⚠️  Prettier não configurado.$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠️  Prettier não configurado. Execute 'make setup-format' primeiro.$(COLOR_RESET)"; \
	fi

format-check: ## Verifica formatação sem modificar arquivos
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔍 Verificando formatação...$(COLOR_RESET)"
	@if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ] || [ -f "prettier.config.js" ]; then \
		$(NPM_RUN) format:check || npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}" || echo "$(COLOR_YELLOW)⚠️  Prettier não configurado.$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠️  Prettier não configurado.$(COLOR_RESET)"; \
	fi

# Type Checking
type-check: ## Verifica tipos TypeScript
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔍 Verificando tipos TypeScript...$(COLOR_RESET)"
	@npx tsc --noEmit
	@echo "$(COLOR_GREEN)✅ Verificação de tipos concluída!$(COLOR_RESET)"

# Verificações completas
check-all: lint type-check format-check ## Executa todas as verificações (lint, type-check, format-check)
	@echo "$(COLOR_BOLD)$(COLOR_GREEN)✅ Todas as verificações concluídas!$(COLOR_RESET)"

# Limpeza
clean: ## Remove arquivos gerados (node_modules, dist, cache)
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🧹 Limpando arquivos gerados...$(COLOR_RESET)"
	@rm -rf node_modules
	@rm -rf dist
	@rm -rf .vite
	@rm -rf coverage
	@rm -rf .turbo
	@find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.log" -delete 2>/dev/null || true
	@echo "$(COLOR_GREEN)✅ Limpeza concluída!$(COLOR_RESET)"

clean-cache: ## Remove apenas cache (mantém node_modules e dist)
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🧹 Limpando cache...$(COLOR_RESET)"
	@rm -rf .vite
	@rm -rf node_modules/.cache
	@rm -rf coverage
	@echo "$(COLOR_GREEN)✅ Cache limpo!$(COLOR_RESET)"

clean-deps: ## Remove apenas node_modules
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🧹 Removendo node_modules...$(COLOR_RESET)"
	@rm -rf node_modules
	@echo "$(COLOR_GREEN)✅ node_modules removido!$(COLOR_RESET)"

# Dependências
deps-update: ## Atualiza dependências para versões mais recentes
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔄 Atualizando dependências...$(COLOR_RESET)"
	@npx npm-check-updates -u
	@$(NPM_INSTALL)
	@echo "$(COLOR_GREEN)✅ Dependências atualizadas!$(COLOR_RESET)"

deps-check: ## Verifica dependências desatualizadas
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔍 Verificando dependências desatualizadas...$(COLOR_RESET)"
	@npx npm-check-updates
	@echo "$(COLOR_GREEN)✅ Verificação concluída!$(COLOR_RESET)"

deps-audit: ## Verifica vulnerabilidades nas dependências
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔒 Verificando vulnerabilidades...$(COLOR_RESET)"
	@$(NPM) audit
	@echo "$(COLOR_GREEN)✅ Auditoria concluída!$(COLOR_RESET)"

deps-audit-fix: ## Corrige vulnerabilidades automaticamente
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🔒 Corrigindo vulnerabilidades...$(COLOR_RESET)"
	@$(NPM) audit fix
	@echo "$(COLOR_GREEN)✅ Vulnerabilidades corrigidas!$(COLOR_RESET)"

# Bundle Analysis
bundle-analyze: ## Analisa tamanho do bundle (requer vite-bundle-visualizer)
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)📊 Analisando bundle...$(COLOR_RESET)"
	@if [ -f "vite.config.ts" ]; then \
		$(NPM_RUN) build && npx vite-bundle-visualizer || echo "$(COLOR_YELLOW)⚠️  vite-bundle-visualizer não instalado. Execute: npm install -D vite-bundle-visualizer$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠️  vite.config.ts não encontrado.$(COLOR_RESET)"; \
	fi

# Setup de ferramentas
setup-lint: ## Configura ESLint no projeto
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)⚙️  Configurando ESLint...$(COLOR_RESET)"
	@$(NPM_INSTALL) -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
		eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier
	@echo "$(COLOR_GREEN)✅ ESLint instalado! Configure .eslintrc.json manualmente.$(COLOR_RESET)"

setup-format: ## Configura Prettier no projeto
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)⚙️  Configurando Prettier...$(COLOR_RESET)"
	@$(NPM_INSTALL) -D prettier eslint-config-prettier
	@echo "$(COLOR_GREEN)✅ Prettier instalado! Configure .prettierrc manualmente.$(COLOR_RESET)"

setup-tests: ## Configura testes (Vitest) no projeto
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)⚙️  Configurando testes...$(COLOR_RESET)"
	@$(NPM_INSTALL) -D vitest @testing-library/react @testing-library/jest-dom \
		@testing-library/user-event @vitest/ui
	@echo "$(COLOR_GREEN)✅ Vitest instalado! Configure vitest.config.ts manualmente.$(COLOR_RESET)"

setup-all: setup-lint setup-format setup-tests ## Configura todas as ferramentas de desenvolvimento
	@echo "$(COLOR_BOLD)$(COLOR_GREEN)✅ Todas as ferramentas configuradas!$(COLOR_RESET)"

# Docker (opcional)
docker-build: ## Cria imagem Docker
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🐳 Criando imagem Docker...$(COLOR_RESET)"
	@if [ -f "Dockerfile" ]; then \
		docker build -t pink-dapp:latest .; \
		echo "$(COLOR_GREEN)✅ Imagem Docker criada!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠️  Dockerfile não encontrado.$(COLOR_RESET)"; \
	fi

docker-run: ## Executa container Docker
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🐳 Executando container Docker...$(COLOR_RESET)"
	@if [ -f "Dockerfile" ]; then \
		docker run -p 4173:4173 pink-dapp:latest; \
	else \
		echo "$(COLOR_YELLOW)⚠️  Dockerfile não encontrado.$(COLOR_RESET)"; \
	fi

# Deploy
deploy: build ## Faz deploy (ajuste conforme sua plataforma)
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)🚀 Fazendo deploy...$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)⚠️  Configure o deploy conforme sua plataforma (Vercel, Netlify, etc.)$(COLOR_RESET)"
	@echo "$(COLOR_GREEN)✅ Build pronto para deploy em ./dist$(COLOR_RESET)"

deploy-preview: build ## Cria build e mostra preview antes do deploy
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)👀 Preview do build para deploy...$(COLOR_RESET)"
	@$(NPM_RUN) preview

# Documentação
docs: ## Gera documentação (se configurado)
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)📚 Gerando documentação...$(COLOR_RESET)"
	@if [ -f "typedoc.json" ] || [ -f ".typedocrc" ]; then \
		$(NPM_RUN) docs || npx typedoc --out docs/api src; \
		echo "$(COLOR_GREEN)✅ Documentação gerada!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠️  TypeDoc não configurado.$(COLOR_RESET)"; \
	fi

docs-serve: ## Serve documentação localmente
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)📚 Servindo documentação...$(COLOR_RESET)"
	@if [ -d "docs/api" ]; then \
		cd docs/api && python3 -m http.server 8080 || echo "$(COLOR_YELLOW)⚠️  Python não encontrado.$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠️  Documentação não gerada. Execute 'make docs' primeiro.$(COLOR_RESET)"; \
	fi

# Informações do projeto
info: ## Mostra informações do projeto
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)ℹ️  Informações do Projeto$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BOLD)Node.js:$(COLOR_RESET) $$(node --version 2>/dev/null || echo 'Não instalado')"
	@echo "$(COLOR_BOLD)NPM:$(COLOR_RESET) $$(npm --version 2>/dev/null || echo 'Não instalado')"
	@echo "$(COLOR_BOLD)TypeScript:$(COLOR_RESET) $$(npx tsc --version 2>/dev/null || echo 'Não instalado')"
	@echo ""
	@if [ -f "package.json" ]; then \
		echo "$(COLOR_BOLD)Projeto:$(COLOR_RESET) $$(grep '"name"' package.json | head -1 | sed 's/.*"name": *"\(.*\)".*/\1/')"; \
		echo "$(COLOR_BOLD)Versão:$(COLOR_RESET) $$(grep '"version"' package.json | head -1 | sed 's/.*"version": *"\(.*\)".*/\1/')"; \
	fi
	@echo ""
	@echo "$(COLOR_BOLD)Estrutura:$(COLOR_RESET)"
	@ls -1d */ 2>/dev/null | sed 's|/$$||' | sed 's/^/  /' || echo "  (nenhum diretório encontrado)"

# Versioning
version-patch: ## Incrementa versão patch (0.0.1)
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)📌 Incrementando versão patch...$(COLOR_RESET)"
	@$(NPM) version patch --no-git-tag-version
	@echo "$(COLOR_GREEN)✅ Versão incrementada!$(COLOR_RESET)"

version-minor: ## Incrementa versão minor (0.1.0)
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)📌 Incrementando versão minor...$(COLOR_RESET)"
	@$(NPM) version minor --no-git-tag-version
	@echo "$(COLOR_GREEN)✅ Versão incrementada!$(COLOR_RESET)"

version-major: ## Incrementa versão major (1.0.0)
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)📌 Incrementando versão major...$(COLOR_RESET)"
	@$(NPM) version major --no-git-tag-version
	@echo "$(COLOR_GREEN)✅ Versão incrementada!$(COLOR_RESET)"

# Git helpers
git-status: ## Mostra status do Git
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)📊 Status do Git:$(COLOR_RESET)"
	@git status

git-commit: ## Faz commit (use: make git-commit M="mensagem")
	@if [ -z "$(M)" ]; then \
		echo "$(COLOR_RED)❌ Erro: Use 'make git-commit M=\"sua mensagem\"'$(COLOR_RESET)"; \
	else \
		git add . && git commit -m "$(M)"; \
		echo "$(COLOR_GREEN)✅ Commit criado!$(COLOR_RESET)"; \
	fi

# Padrão (executa help se nenhum comando for especificado)
.DEFAULT_GOAL := help

