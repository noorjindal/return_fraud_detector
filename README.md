# Return Fraud Detection System

A machine learning system to detect suspicious return requests in e-commerce platforms, built as a college major project.

## 🎯 Project Overview

This system analyzes return requests and assigns fraud risk scores (0-1) to flag suspicious cases for manual review. It uses supervised learning with LightGBM and includes a complete pipeline from data generation to deployment.

## 🏗️ Architecture

- **Data Layer**: Synthetic data generation + SQL database
- **ML Pipeline**: Feature engineering + LightGBM training + evaluation
- **Inference**: FastAPI REST API with real-time scoring
- **Dashboard**: React frontend for manual review
- **Deployment**: Docker containerization

## 📁 Project Structure

```
├── data/                   # Data generation and storage
├── notebooks/             # Jupyter notebooks for analysis
├── src/                   # Source code
│   ├── data/             # Data generation and preprocessing
│   ├── features/         # Feature engineering
│   ├── models/           # Model training and evaluation
│   └── api/              # FastAPI inference service
├── frontend/             # React dashboard
├── docker/               # Docker configurations
├── tests/                # Unit tests
└── docs/                 # Documentation
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Generate Synthetic Data

```bash
python src/data/generate_synthetic_data.py
```

### 3. Train Model

```bash
python src/models/train_model.py
```

### 4. Start API Server

```bash
python src/api/app.py
```

### 5. Start Frontend Dashboard

```bash
cd frontend
npm install
npm start
```

## 📊 Features

### User-Level Features
- Account age (days)
- Number of orders and returns
- Return rate
- Average order value
- Device fingerprint count

### Order-Level Features
- Order value and item count
- Product category risk score
- Billing vs shipping address mismatch
- Shipping method

### Return-Level Features
- Time between delivery and return
- Return reason code
- Refund type preference
- Historical return patterns

### Behavioral Features
- IP geolocation analysis
- Session patterns
- Rapid-fire return requests
- Email domain analysis

## 🎯 Model Performance

- **Algorithm**: LightGBM (Gradient Boosting)
- **Evaluation**: Precision-Recall AUC, F1-Score
- **Class Imbalance**: Handled with stratified sampling and class weights
- **Threshold Tuning**: Optimized for business metrics

## 🔧 API Endpoints

- `POST /score` - Score a return request
- `GET /health` - Health check
- `GET /metrics` - Model performance metrics

## 📈 Dashboard Features

- Real-time fraud scoring
- Manual review queue
- SHAP explanations
- Historical analysis
- Alert management

## 🛡️ Ethics & Privacy

- No sensitive PII storage
- Fairness monitoring across demographics
- Human-in-the-loop for high-value cases
- Appeals process for customers

## 📚 Documentation

- [Technical Report](docs/technical_report.md)
- [API Documentation](docs/api_docs.md)
- [Deployment Guide](docs/deployment.md)
- [Ethics Statement](docs/ethics.md)

## 🧪 Testing

```bash
# Run unit tests
pytest tests/

# Run integration tests
pytest tests/integration/
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📋 Project Timeline

- **Phase 1** (2-3 weeks): Data generation + Feature engineering + Baseline model
- **Phase 2** (2 weeks): Model improvement + Explainability + Dashboard
- **Phase 3** (1-2 weeks): API development + Containerization + Integration
- **Phase 4** (Optional): Real-time streaming + Production hardening

## 👥 Team

- **Developer**: [Your Name]
- **Supervisor**: [Supervisor Name]
- **Institution**: [University Name]

## 📄 License

This project is for educational purposes as part of a college major project.

## 🤝 Contributing

This is an academic project. For questions or suggestions, please contact the developer.

---

**Note**: This system is designed for educational purposes and should be thoroughly tested before any production use.
