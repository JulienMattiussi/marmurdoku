default: help

help: ## Display available commands
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	npm install

start: ## Start application in development (http://localhost:2020)
	npm run dev

build: ## Build application for production
	npm run build

preview: build ## Preview production build locally
	npm run preview

lint: ## Run ESLint
	npm run lint

knip: ## Find unused files, exports and dependencies
	npm run knip

format: ## Format code with Prettier
	npm run format

format-check: ## Check formatting with Prettier
	npm run format:check

typecheck: ## Run TypeScript type checker
	npm run typecheck

test: ## Run unit and component tests
	npm run test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage report
	npm run test:coverage

solve: ## Tell whether the clues single out data/solution.ts (and show another solution if not)
	npm run solve

CHROME ?= $(shell command -v google-chrome || command -v chromium || command -v chromium-browser)

.PHONY: og
og: ## Re-render the share image public/og.png from og.html, built with the real components (needs Chrome)
	@test -n "$(CHROME)" || { echo "Chrome introuvable. Passe le binaire : make og CHROME=/chemin/vers/chrome"; exit 1; }
	@./node_modules/.bin/vite --port 2021 --strictPort >/dev/null 2>&1 & echo $$! > .og.pid; sleep 3
	@"$(CHROME)" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
		--virtual-time-budget=4000 --window-size=1200,630 --screenshot=public/og.png http://localhost:2021/og.html 2>/dev/null
	@kill `cat .og.pid` && rm .og.pid
	@echo "public/og.png (1200x630) regeneree"

.PHONY: icons
icons: ## Re-render the PNG icons (manifest, Apple) from public/favicon.svg (needs ImageMagick)
	@magick -background none -density 1200 public/favicon.svg -resize 140x140 -background '#140b0d' -gravity center -extent 192x192 public/favicon.png
	@magick -background none -density 1200 public/favicon.svg -resize 132x132 -background '#140b0d' -gravity center -extent 180x180 public/apple-touch-icon.png
	@echo "public/favicon.png (192x192) et public/apple-touch-icon.png (180x180) regenerees"

fix: format lint ## Format and lint all code

check: build lint typecheck knip test ## Run all checks (build, lint, typecheck, knip, tests)
	@echo "All checks passed!"

clean: ## Remove build artifacts and dependencies
	rm -rf dist node_modules coverage
