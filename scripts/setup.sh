#!/bin/bash

# Return Fraud Detection System - Setup Script
# This script sets up the development environment

echo "🚀 Setting up Return Fraud Detection System..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p data
mkdir -p models
mkdir -p models/plots
mkdir -p notebooks
mkdir -p tests
mkdir -p logs

# Generate synthetic data
echo "🎲 Generating synthetic dataset..."
python src/data/generate_synthetic_data.py

# Train the model
echo "🤖 Training fraud detection model..."
python src/models/train_model.py

echo "✅ Setup complete!"
echo ""
echo "To start the system:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Start API server: python src/api/app.py"
echo "3. In another terminal, start frontend: cd frontend && npm install && npm start"
echo ""
echo "Or use Docker: docker-compose up --build"
