# Return Fraud Detection System - Makefile
# Provides convenient commands for development and deployment

.PHONY: help install setup data model api frontend test demo clean docker

# Default target
help:
	@echo "Return Fraud Detection System - Available Commands:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install     - Install Python dependencies"
	@echo "  make setup       - Complete system setup (data + model + API)"
	@echo "  make data        - Generate synthetic dataset"
	@echo "  make model       - Train machine learning model"
	@echo ""
	@echo "Development:"
	@echo "  make api         - Start FastAPI server"
	@echo "  make frontend    - Start React development server"
	@echo "  make test        - Run test suite"
	@echo "  make demo        - Run demo script"
	@echo ""
	@echo "Docker:"
	@echo "  make docker      - Build and run with Docker Compose"
	@echo "  make docker-build - Build Docker images"
	@echo "  make docker-up   - Start Docker services"
	@echo "  make docker-down - Stop Docker services"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean       - Clean up generated files"
	@echo "  make quick       - Quick start (setup + API)"

# Installation
install:
	@echo "Installing Python dependencies..."
	pip install -r requirements.txt

# Complete setup
setup: data model
	@echo "✅ Setup completed successfully!"

# Generate synthetic data
data:
	@echo "Generating synthetic dataset..."
	python src/data/generate_synthetic_data.py

# Train model
model:
	@echo "Training machine learning model..."
	python src/models/train_model.py

# Start API server
api:
	@echo "Starting FastAPI server..."
	python src/api/app.py

# Start frontend (requires npm)
frontend:
	@echo "Starting React development server..."
	cd frontend && npm install && npm start

# Run tests
test:
	@echo "Running test suite..."
	python -m pytest tests/ -v

# Run demo
demo:
	@echo "Running demo script..."
	python scripts/run_demo.py

# Quick start
quick:
	@echo "Quick start - setting up and starting API..."
	python scripts/quick_start.py

# Docker commands
docker:
	@echo "Building and running with Docker Compose..."
	docker-compose up --build

docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

# Clean up
clean:
	@echo "Cleaning up generated files..."
	rm -rf data/*.csv
	rm -rf models/*.joblib
	rm -rf models/*.json
	rm -rf models/plots/*.png
	rm -rf logs/*.log
	rm -rf __pycache__/
	rm -rf .pytest_cache/
	rm -rf frontend/build/
	rm -rf frontend/node_modules/

# Development workflow
dev: install data model
	@echo "Development environment ready!"
	@echo "Run 'make api' to start the API server"
	@echo "Run 'make frontend' to start the React app (in another terminal)"

# Production deployment
prod: docker
	@echo "Production deployment with Docker Compose"

# Show system status
status:
	@echo "Checking system status..."
	@echo "Python version: $(shell python --version)"
	@echo "Node version: $(shell node --version 2>/dev/null || echo 'Node.js not installed')"
	@echo "Docker version: $(shell docker --version 2>/dev/null || echo 'Docker not installed')"
	@echo "Docker Compose version: $(shell docker-compose --version 2>/dev/null || echo 'Docker Compose not installed')"
