"""
FastAPI inference service for Return Fraud Detection System.
Provides real-time fraud scoring and model explainability.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import pandas as pd
import joblib
import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model and metadata
model = None
feature_names = None
feature_importance = None
model_metadata = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    global model, feature_names, feature_importance, model_metadata
    
    model_path = "models/fraud_detection_model.joblib"
    metadata_path = "models/fraud_detection_model_metadata.json"
    
    try:
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            logger.info(f"Model loaded from {model_path}")
            
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    model_metadata = json.load(f)
                feature_names = model_metadata['feature_names']
                feature_importance = np.array(model_metadata['feature_importance'])
                logger.info("Model metadata loaded successfully")
            else:
                logger.warning("Model metadata not found")
        else:
            logger.error(f"Model file not found: {model_path}")
            
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
    
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="Return Fraud Detection API",
    description="Real-time fraud scoring for return requests",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response
class ReturnRequest(BaseModel):
    """Return request data structure."""
    user_id: str = Field(..., description="Unique user identifier")
    order_id: str = Field(..., description="Order identifier")
    
    # User features
    user_age_days: int = Field(..., ge=0, description="Account age in days")
    num_orders: int = Field(..., ge=0, description="Total number of orders")
    avg_order_value: float = Field(..., ge=0, description="Average order value")
    device_count: int = Field(..., ge=1, description="Number of devices used")
    return_rate: float = Field(..., ge=0, le=1, description="Historical return rate")
    recent_returns_30d: int = Field(..., ge=0, description="Returns in last 30 days")
    recent_returns_90d: int = Field(..., ge=0, description="Returns in last 90 days")
    recent_returns_365d: int = Field(..., ge=0, description="Returns in last 365 days")
    
    # Order features
    order_value: float = Field(..., ge=0, description="Current order value")
    item_count: int = Field(..., ge=1, description="Number of items in order")
    product_risk_score: float = Field(..., ge=0, le=1, description="Product category risk score")
    shipping_method_express: int = Field(..., ge=0, le=1, description="Express shipping flag")
    billing_shipping_mismatch: int = Field(..., ge=0, le=1, description="Address mismatch flag")
    
    # Return features
    days_to_return: int = Field(..., ge=0, description="Days between delivery and return")
    return_reason_suspicious: int = Field(..., ge=0, le=1, description="Suspicious return reason flag")
    refund_type_cash: int = Field(..., ge=0, le=1, description="Cash refund preference")
    refund_type_store_credit: int = Field(..., ge=0, le=1, description="Store credit preference")
    
    # Behavioral features
    is_high_value: int = Field(..., ge=0, le=1, description="High value order flag")
    email_domain_risk: int = Field(..., ge=0, le=1, description="Suspicious email domain flag")
    hour_of_day: int = Field(..., ge=0, le=23, description="Hour of return request")
    is_weekend: int = Field(..., ge=0, le=1, description="Weekend return flag")


class FraudScoreResponse(BaseModel):
    """Fraud score response structure."""
    risk_score: float = Field(..., description="Fraud risk score (0-1)")
    is_flagged: bool = Field(..., description="Whether the return is flagged for review")
    confidence: float = Field(..., description="Model confidence in prediction")
    top_risk_factors: List[Dict[str, Any]] = Field(..., description="Top contributing risk factors")
    timestamp: str = Field(..., description="Prediction timestamp")
    model_version: str = Field(..., description="Model version used")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool
    timestamp: str


class MetricsResponse(BaseModel):
    """Model metrics response."""
    model_info: Dict[str, Any]
    feature_importance: List[Dict[str, Any]]


# Utility functions
def get_top_risk_factors(features: np.ndarray, feature_names: List[str], 
                        feature_importance: np.ndarray, top_n: int = 5) -> List[Dict[str, Any]]:
    """Get top risk factors contributing to the prediction."""
    if feature_importance is None:
        return []
    
    # Get feature values and importance
    feature_data = list(zip(feature_names, features, feature_importance))
    
    # Sort by importance and get top features
    feature_data.sort(key=lambda x: x[2], reverse=True)
    top_features = feature_data[:top_n]
    
    risk_factors = []
    for name, value, importance in top_features:
        risk_factors.append({
            'feature': name,
            'value': float(value),
            'importance': float(importance),
            'risk_level': 'high' if importance > np.percentile(feature_importance, 75) else 'medium'
        })
    
    return risk_factors


def validate_features(request: ReturnRequest) -> np.ndarray:
    """Validate and convert request to feature array."""
    if feature_names is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Convert request to dictionary
    request_dict = request.dict()
    
    # Create feature array in correct order
    features = []
    for feature_name in feature_names:
        if feature_name in request_dict:
            features.append(request_dict[feature_name])
        else:
            # Handle missing features with default values
            features.append(0.0)
    
    return np.array(features).reshape(1, -1)


# API Endpoints
@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Return Fraud Detection API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy" if model is not None else "unhealthy",
        model_loaded=model is not None,
        timestamp=datetime.now().isoformat()
    )


@app.post("/score", response_model=FraudScoreResponse)
async def score_return_request(request: ReturnRequest):
    """Score a return request for fraud risk."""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Validate and prepare features
        features = validate_features(request)
        
        # Make prediction
        risk_score = float(model.predict(features)[0])
        
        # Determine if flagged (threshold can be tuned)
        threshold = 0.5
        is_flagged = risk_score > threshold
        
        # Calculate confidence (distance from threshold)
        confidence = abs(risk_score - threshold) * 2
        
        # Get top risk factors
        top_risk_factors = get_top_risk_factors(
            features[0], feature_names, feature_importance
        )
        
        return FraudScoreResponse(
            risk_score=risk_score,
            is_flagged=is_flagged,
            confidence=min(1.0, confidence),
            top_risk_factors=top_risk_factors,
            timestamp=datetime.now().isoformat(),
            model_version=model_metadata.get('training_date', 'unknown') if model_metadata else 'unknown'
        )
        
    except Exception as e:
        logger.error(f"Error scoring request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")


@app.get("/metrics", response_model=MetricsResponse)
async def get_model_metrics():
    """Get model performance metrics and feature importance."""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Model information
    model_info = {
        "model_type": "LightGBM",
        "training_date": model_metadata.get('training_date', 'unknown') if model_metadata else 'unknown',
        "feature_count": len(feature_names) if feature_names else 0,
        "random_state": model_metadata.get('random_state', 'unknown') if model_metadata else 'unknown'
    }
    
    # Feature importance
    feature_importance_data = []
    if feature_names and feature_importance is not None:
        for name, importance in zip(feature_names, feature_importance):
            feature_importance_data.append({
                "feature": name,
                "importance": float(importance)
            })
        
        # Sort by importance
        feature_importance_data.sort(key=lambda x: x['importance'], reverse=True)
    
    return MetricsResponse(
        model_info=model_info,
        feature_importance=feature_importance_data
    )


@app.post("/batch_score")
async def batch_score_return_requests(requests: List[ReturnRequest]):
    """Score multiple return requests in batch."""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        results = []
        
        for request in requests:
            # Validate and prepare features
            features = validate_features(request)
            
            # Make prediction
            risk_score = float(model.predict(features)[0])
            
            # Determine if flagged
            threshold = 0.5
            is_flagged = risk_score > threshold
            
            results.append({
                "user_id": request.user_id,
                "order_id": request.order_id,
                "risk_score": risk_score,
                "is_flagged": is_flagged,
                "timestamp": datetime.now().isoformat()
            })
        
        return {
            "results": results,
            "total_processed": len(results),
            "flagged_count": sum(1 for r in results if r['is_flagged'])
        }
        
    except Exception as e:
        logger.error(f"Error in batch scoring: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch scoring error: {str(e)}")


@app.get("/feature_importance")
async def get_feature_importance():
    """Get feature importance rankings."""
    if model is None or feature_names is None or feature_importance is None:
        raise HTTPException(status_code=500, detail="Model or feature data not loaded")
    
    # Create feature importance data
    importance_data = []
    for name, importance in zip(feature_names, feature_importance):
        importance_data.append({
            "feature": name,
            "importance": float(importance)
        })
    
    # Sort by importance
    importance_data.sort(key=lambda x: x['importance'], reverse=True)
    
    return {
        "feature_importance": importance_data,
        "total_features": len(feature_names)
    }


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    return {
        "error": exc.detail,
        "status_code": exc.status_code,
        "timestamp": datetime.now().isoformat()
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}")
    return {
        "error": "Internal server error",
        "status_code": 500,
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run the API server
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )