#!/usr/bin/env python3
"""
Quick start script for Return Fraud Detection System.
This script sets up and runs the entire system with minimal configuration.
"""

import os
import sys
import subprocess
import time
import requests
import json
from pathlib import Path

def print_banner():
    """Print the system banner."""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║        Return Fraud Detection System - Quick Start          ║
    ║                                                              ║
    ║  🎯 Real-time fraud detection for e-commerce returns       ║
    ║  🤖 Machine learning with LightGBM                          ║
    ║  🚀 FastAPI + React dashboard                               ║
    ║  📊 Comprehensive analytics and monitoring                  ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required dependencies are available."""
    required_packages = [
        'numpy', 'pandas', 'scikit-learn', 'lightgbm', 
        'fastapi', 'uvicorn', 'matplotlib', 'seaborn'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("   Run: pip install -r requirements.txt")
        return False
    
    print("✅ All required packages are available")
    return True

def setup_environment():
    """Set up the development environment."""
    print("\n🔧 Setting up environment...")
    
    # Create necessary directories
    directories = ['data', 'models', 'models/plots', 'logs', 'notebooks']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"   📁 Created directory: {directory}")
    
    # Check if data exists
    data_file = Path('data/synthetic_returns_dataset.csv')
    if not data_file.exists():
        print("   🎲 Generating synthetic dataset...")
        try:
            subprocess.run([sys.executable, 'src/data/generate_synthetic_data.py'], 
                         check=True, capture_output=True)
            print("   ✅ Dataset generated successfully")
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Failed to generate dataset: {e}")
            return False
    else:
        print("   ✅ Dataset already exists")
    
    # Check if model exists
    model_file = Path('models/fraud_detection_model.joblib')
    if not model_file.exists():
        print("   🤖 Training machine learning model...")
        try:
            subprocess.run([sys.executable, 'src/models/train_model.py'], 
                         check=True, capture_output=True)
            print("   ✅ Model trained successfully")
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Failed to train model: {e}")
            return False
    else:
        print("   ✅ Model already exists")
    
    return True

def start_api_server():
    """Start the FastAPI server."""
    print("\n🚀 Starting API server...")
    
    try:
        # Start the API server in the background
        process = subprocess.Popen([
            sys.executable, '-m', 'uvicorn', 
            'src.api.app:app', 
            '--host', '0.0.0.0', 
            '--port', '8000',
            '--reload'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for server to start
        print("   ⏳ Waiting for server to start...")
        time.sleep(5)
        
        # Check if server is running
        try:
            response = requests.get('http://localhost:8000/health', timeout=5)
            if response.status_code == 200:
                print("   ✅ API server is running on http://localhost:8000")
                return process
            else:
                print(f"   ❌ API server health check failed: {response.status_code}")
                return None
        except requests.exceptions.RequestException:
            print("   ❌ Cannot connect to API server")
            return None
            
    except Exception as e:
        print(f"   ❌ Failed to start API server: {e}")
        return None

def test_api():
    """Test the API with sample requests."""
    print("\n🧪 Testing API...")
    
    # Test health endpoint
    try:
        response = requests.get('http://localhost:8000/health')
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health check: {data['status']}")
            print(f"   ✅ Model loaded: {data['model_loaded']}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Health check failed: {e}")
        return False
    
    # Test scoring endpoint
    test_request = {
        "user_id": "test_user_001",
        "order_id": "test_order_001",
        "user_age_days": 30,
        "num_orders": 5,
        "avg_order_value": 100.0,
        "device_count": 1,
        "return_rate": 0.1,
        "recent_returns_30d": 0,
        "recent_returns_90d": 1,
        "recent_returns_365d": 2,
        "order_value": 150.0,
        "item_count": 2,
        "product_risk_score": 0.5,
        "shipping_method_express": 0,
        "billing_shipping_mismatch": 0,
        "days_to_return": 3,
        "return_reason_suspicious": 0,
        "refund_type_cash": 1,
        "refund_type_store_credit": 0,
        "is_high_value": 0,
        "email_domain_risk": 0,
        "hour_of_day": 14,
        "is_weekend": 0
    }
    
    try:
        response = requests.post('http://localhost:8000/score', json=test_request)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Scoring test: Risk score = {data['risk_score']:.3f}")
            print(f"   ✅ Flagged: {data['is_flagged']}")
        else:
            print(f"   ❌ Scoring test failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Scoring test failed: {e}")
        return False
    
    return True

def show_next_steps():
    """Show next steps for the user."""
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next Steps:")
    print("   1. 🌐 API Documentation: http://localhost:8000/docs")
    print("   2. 🧪 Test the API: python scripts/run_demo.py")
    print("   3. 📊 Jupyter Notebooks: jupyter notebook notebooks/")
    print("   4. 🐳 Docker: docker-compose up --build")
    print("   5. 📱 Frontend: cd frontend && npm install && npm start")
    
    print("\n🔧 Available Commands:")
    print("   • Generate data: python src/data/generate_synthetic_data.py")
    print("   • Train model: python src/models/train_model.py")
    print("   • Start API: python src/api/app.py")
    print("   • Run tests: python -m pytest tests/")
    print("   • Run demo: python scripts/run_demo.py")
    
    print("\n📚 Documentation:")
    print("   • Technical Report: docs/technical_report.md")
    print("   • README: README.md")
    print("   • API Docs: http://localhost:8000/docs")

def main():
    """Main function."""
    print_banner()
    
    # Check system requirements
    if not check_python_version():
        sys.exit(1)
    
    if not check_dependencies():
        print("\n💡 Install dependencies with: pip install -r requirements.txt")
        sys.exit(1)
    
    # Setup environment
    if not setup_environment():
        print("\n❌ Setup failed. Please check the error messages above.")
        sys.exit(1)
    
    # Start API server
    api_process = start_api_server()
    if not api_process:
        print("\n❌ Failed to start API server.")
        sys.exit(1)
    
    # Test API
    if not test_api():
        print("\n❌ API tests failed.")
        api_process.terminate()
        sys.exit(1)
    
    # Show next steps
    show_next_steps()
    
    print(f"\n🔄 API server is running in the background (PID: {api_process.pid})")
    print("   Press Ctrl+C to stop the server")
    
    try:
        # Keep the script running
        api_process.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping API server...")
        api_process.terminate()
        print("✅ API server stopped")

if __name__ == "__main__":
    main()
