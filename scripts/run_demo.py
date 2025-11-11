#!/usr/bin/env python3
"""
Demo script for Return Fraud Detection System.
Shows how to use the API to score return requests.
"""

import requests
import json
import random
from datetime import datetime

# API base URL
API_BASE = "http://localhost:8000"

def check_api_health():
    """Check if the API is running."""
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Status: {data['status']}")
            print(f"✅ Model Loaded: {data['model_loaded']}")
            return True
        else:
            print(f"❌ API Health Check Failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure it's running on port 8000")
        return False

def generate_sample_request():
    """Generate a sample return request for testing."""
    return {
        "user_id": f"user_{random.randint(100000, 999999)}",
        "order_id": f"order_{random.randint(100000, 999999)}",
        "user_age_days": random.randint(1, 1000),
        "num_orders": random.randint(1, 50),
        "avg_order_value": random.uniform(20, 500),
        "device_count": random.randint(1, 5),
        "return_rate": random.uniform(0, 0.5),
        "recent_returns_30d": random.randint(0, 10),
        "recent_returns_90d": random.randint(0, 20),
        "recent_returns_365d": random.randint(0, 50),
        "order_value": random.uniform(10, 1000),
        "item_count": random.randint(1, 10),
        "product_risk_score": random.uniform(0, 1),
        "shipping_method_express": random.choice([0, 1]),
        "billing_shipping_mismatch": random.choice([0, 1]),
        "days_to_return": random.randint(1, 30),
        "return_reason_suspicious": random.choice([0, 1]),
        "refund_type_cash": random.choice([0, 1]),
        "refund_type_store_credit": random.choice([0, 1]),
        "is_high_value": random.choice([0, 1]),
        "email_domain_risk": random.choice([0, 1]),
        "hour_of_day": random.randint(0, 23),
        "is_weekend": random.choice([0, 1])
    }

def score_return_request(request_data):
    """Score a return request using the API."""
    try:
        response = requests.post(f"{API_BASE}/score", json=request_data)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Scoring failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def display_result(result):
    """Display the scoring result in a formatted way."""
    if not result:
        return
    
    print("\n" + "="*60)
    print("🔍 FRAUD RISK ASSESSMENT RESULT")
    print("="*60)
    
    # Risk score and level
    risk_score = result['risk_score']
    risk_percentage = risk_score * 100
    
    if risk_score >= 0.8:
        risk_level = "🔴 HIGH RISK"
        color = "\033[91m"  # Red
    elif risk_score >= 0.5:
        risk_level = "🟡 MEDIUM RISK"
        color = "\033[93m"  # Yellow
    else:
        risk_level = "🟢 LOW RISK"
        color = "\033[92m"  # Green
    
    print(f"Risk Score: {color}{risk_percentage:.1f}%{'\033[0m'}")
    print(f"Risk Level: {risk_level}")
    print(f"Flagged for Review: {'Yes' if result['is_flagged'] else 'No'}")
    print(f"Confidence: {result['confidence']:.1%}")
    print(f"Timestamp: {result['timestamp']}")
    
    # Top risk factors
    if result['top_risk_factors']:
        print(f"\n🎯 Top Risk Factors:")
        for i, factor in enumerate(result['top_risk_factors'][:5], 1):
            print(f"  {i}. {factor['feature']}: {factor['value']} (importance: {factor['importance']:.2f})")

def run_batch_demo():
    """Run a batch scoring demo."""
    print("\n🔄 Running batch scoring demo...")
    
    # Generate multiple requests
    requests_data = [generate_sample_request() for _ in range(5)]
    
    try:
        response = requests.post(f"{API_BASE}/batch_score", json=requests_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Batch processed: {result['total_processed']} requests")
            print(f"✅ Flagged: {result['flagged_count']} requests")
            
            # Show individual results
            for i, req_result in enumerate(result['results'], 1):
                print(f"\nRequest {i}:")
                print(f"  User: {req_result['user_id']}")
                print(f"  Order: {req_result['order_id']}")
                print(f"  Risk Score: {req_result['risk_score']:.3f}")
                print(f"  Flagged: {'Yes' if req_result['is_flagged'] else 'No'}")
        else:
            print(f"❌ Batch scoring failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Batch request failed: {e}")

def get_model_metrics():
    """Get model performance metrics."""
    try:
        response = requests.get(f"{API_BASE}/metrics")
        if response.status_code == 200:
            data = response.json()
            print("\n📊 MODEL METRICS")
            print("="*40)
            print(f"Model Type: {data['model_info']['model_type']}")
            print(f"Feature Count: {data['model_info']['feature_count']}")
            print(f"Training Date: {data['model_info']['training_date']}")
            
            if data['feature_importance']:
                print(f"\n🔝 Top 5 Most Important Features:")
                for i, feature in enumerate(data['feature_importance'][:5], 1):
                    print(f"  {i}. {feature['feature']}: {feature['importance']:.2f}")
        else:
            print(f"❌ Failed to get metrics: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Metrics request failed: {e}")

def main():
    """Main demo function."""
    print("🎭 Return Fraud Detection System - Demo")
    print("="*50)
    
    # Check API health
    if not check_api_health():
        print("\n💡 To start the API server, run:")
        print("   python src/api/app.py")
        return
    
    # Get model metrics
    get_model_metrics()
    
    # Single request demo
    print(f"\n🎯 Single Request Demo")
    print("-" * 30)
    
    # Generate and score a request
    request_data = generate_sample_request()
    print(f"Scoring request for user: {request_data['user_id']}")
    print(f"Order value: ${request_data['order_value']:.2f}")
    print(f"Account age: {request_data['user_age_days']} days")
    
    result = score_return_request(request_data)
    display_result(result)
    
    # Batch demo
    run_batch_demo()
    
    print(f"\n✅ Demo completed!")
    print(f"\n💡 Next steps:")
    print(f"   - Visit http://localhost:3000 for the web dashboard")
    print(f"   - Check the API docs at http://localhost:8000/docs")
    print(f"   - Explore the Jupyter notebooks in the notebooks/ directory")

if __name__ == "__main__":
    main()
