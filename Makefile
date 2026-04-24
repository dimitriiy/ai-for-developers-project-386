# Project Makefile

.PHONY: help install install-frontend install-backend install-typespec build build-frontend build-backend \
	dev dev-frontend dev-backend mock-server lint test clean

# Show this help
help:
	@echo "Available commands:"
	@echo "  make help              - Show this help"
	@echo "  make install           - Install all dependencies"
	@echo "  make install-frontend  - Install frontend dependencies"
	@echo "  make install-backend   - Install backend dependencies"
	@echo "  make install-typespec  - Install TypeSpec dependencies"
	@echo "  make build             - Build both frontend and backend"
	@echo "  make build-frontend    - Build frontend"
	@echo "  make build-backend     - Build backend"
	@echo "  make dev               - Start both frontend and backend in development mode"
	@echo "  make dev-frontend      - Start frontend in development mode"
	@echo "  make dev-backend       - Start backend in development mode"
	@echo "  make mock-server       - Start Prism mock server"
	@echo "  make lint              - Run linter on frontend"
	@echo "  make test              - Run tests (placeholder)"
	@echo "  make clean             - Clean build artifacts"

# Install all dependencies
install:
	cd frontend && yarn install
	cd backend && yarn install

# Install frontend dependencies
install-frontend:
	cd frontend && yarn install

# Install backend dependencies
install-backend:
	cd backend && yarn install

# Build both frontend and backend
build: build-frontend build-backend

# Build frontend
build-frontend:
	cd frontend && yarn run build

# Build backend
build-backend:
	cd backend && yarn run build

# Start both frontend and backend in development mode
dev: dev-frontend dev-backend

# Start frontend in development mode
dev-frontend:
	cd frontend && yarn run dev

# Start backend in development mode
dev-backend:
	cd backend && yarn run dev

# Run linter on frontend
lint:
	cd frontend && yarn run lint

# Run tests (placeholder - adjust as needed)
test:
	@echo "No tests configured yet"

# Clean build artifacts
clean:
	rm -rf frontend/dist
	rm -rf backend/dist

# Install TypeSpec dependencies
install-typespec:
	cd typespec && npm install

# Start Prism mock server
mock-server:
	cd typespec && npx @stoplight/prism-cli mock -p 3000 tsp-output/schema/openapi.yaml