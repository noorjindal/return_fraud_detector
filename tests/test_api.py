"""
Test suite for the Return Fraud Detection API.
"""

import pytest
import requests
import json
import time
from typing import Dict, Any

# Test configuration
API_BASE_URL = "http://localhost:8000"
TEST_TIMEOUT = 30

class TestFraudDetectionAPI:
    """Test cases for the fraud detection API."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup for each test."""
        self.api_url = API_BASE_URL
        self.test_request = {
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
    
    def test_api_health(self):
        """Test API health endpoint."""
        response = requests.get(f"{self.api_url}/health", timeout=TEST_TIMEOUT)
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert "model_loaded" in data
        assert "timestamp" in data
    
    def test_api_root(self):
        """Test API root endpoint."""
        response = requests.get(f"{self.api_url}/", timeout=TEST_TIMEOUT)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_score_single_request(self):
        """Test scoring a single return request."""
        response = requests.post(
            f"{self.api_url}/score", 
            json=self.test_request,
            timeout=TEST_TIMEOUT
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "risk_score" in data
        assert "is_flagged" in data
        assert "confidence" in data
        assert "top_risk_factors" in data
        assert "timestamp" in data
        assert "model_version" in data
        
        # Validate data types
        assert isinstance(data["risk_score"], (int, float))
        assert isinstance(data["is_flagged"], bool)
        assert isinstance(data["confidence"], (int, float))
        assert isinstance(data["top_risk_factors"], list)
    
    def test_score_high_risk_request(self):
        """Test scoring a high-risk return request."""
        high_risk_request = self.test_request.copy()
        high_risk_request.update({
            "user_age_days": 5,  # New account
            "order_value": 1000.0,  # High value
            "billing_shipping_mismatch": 1,  # Address mismatch
            "return_reason_suspicious": 1,  # Suspicious reason
            "email_domain_risk": 1,  # Suspicious email
            "is_high_value": 1
        })
        
        response = requests.post(
            f"{self.api_url}/score",
            json=high_risk_request,
            timeout=TEST_TIMEOUT
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["risk_score"] > 0.5  # Should be high risk
        assert data["is_flagged"] == True
    
    def test_score_low_risk_request(self):
        """Test scoring a low-risk return request."""
        low_risk_request = self.test_request.copy()
        low_risk_request.update({
            "user_age_days": 365,  # Established account
            "order_value": 50.0,  # Low value
            "billing_shipping_mismatch": 0,
            "return_reason_suspicious": 0,
            "email_domain_risk": 0,
            "is_high_value": 0
        })
        
        response = requests.post(
            f"{self.api_url}/score",
            json=low_risk_request,
            timeout=TEST_TIMEOUT
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["risk_score"] < 0.5  # Should be low risk
        assert data["is_flagged"] == False
    
    def test_batch_scoring(self):
        """Test batch scoring multiple requests."""
        batch_requests = [
            self.test_request,
            {**self.test_request, "user_id": "test_user_002", "order_id": "test_order_002"},
            {**self.test_request, "user_id": "test_user_003", "order_id": "test_order_003"}
        ]
        
        response = requests.post(
            f"{self.api_url}/batch_score",
            json=batch_requests,
            timeout=TEST_TIMEOUT
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "total_processed" in data
        assert "flagged_count" in data
        assert len(data["results"]) == 3
        assert data["total_processed"] == 3
    
    def test_model_metrics(self):
        """Test model metrics endpoint."""
        response = requests.get(f"{self.api_url}/metrics", timeout=TEST_TIMEOUT)
        assert response.status_code == 200
        
        data = response.json()
        assert "model_info" in data
        assert "feature_importance" in data
        
        model_info = data["model_info"]
        assert "model_type" in model_info
        assert "feature_count" in model_info
        assert "training_date" in model_info
    
    def test_feature_importance(self):
        """Test feature importance endpoint."""
        response = requests.get(f"{self.api_url}/feature_importance", timeout=TEST_TIMEOUT)
        assert response.status_code == 200
        
        data = response.json()
        assert "feature_importance" in data
        assert "total_features" in data
        assert isinstance(data["feature_importance"], list)
        assert len(data["feature_importance"]) > 0
    
    def test_invalid_request(self):
        """Test handling of invalid requests."""
        invalid_request = {"invalid": "data"}
        
        response = requests.post(
            f"{self.api_url}/score",
            json=invalid_request,
            timeout=TEST_TIMEOUT
        )
        assert response.status_code == 422  # Validation error
    
    def test_missing_required_fields(self):
        """Test handling of requests with missing required fields."""
        incomplete_request = {
            "user_id": "test_user",
            "order_id": "test_order"
            # Missing other required fields
        }
        
        response = requests.post(
            f"{self.api_url}/score",
            json=incomplete_request,
            timeout=TEST_TIMEOUT
        )
        assert response.status_code == 422  # Validation error
    
    def test_edge_case_values(self):
        """Test edge case values."""
        edge_case_request = self.test_request.copy()
        edge_case_request.update({
            "user_age_days": 0,  # Minimum value
            "order_value": 0.01,  # Very small value
            "return_rate": 0.0,  # No returns
            "device_count": 1,  # Minimum devices
            "hour_of_day": 0,  # Midnight
            "is_weekend": 0  # Weekday
        })
        
        response = requests.post(
            f"{self.api_url}/score",
            json=edge_case_request,
            timeout=TEST_TIMEOUT
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "risk_score" in data
        assert 0 <= data["risk_score"] <= 1
    
    def test_performance(self):
        """Test API performance with multiple requests."""
        start_time = time.time()
        
        # Send 10 requests
        for i in range(10):
            request = self.test_request.copy()
            request["user_id"] = f"perf_test_user_{i}"
            request["order_id"] = f"perf_test_order_{i}"
            
            response = requests.post(
                f"{self.api_url}/score",
                json=request,
                timeout=TEST_TIMEOUT
            )
            assert response.status_code == 200
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Should complete 10 requests in reasonable time
        assert total_time < 10.0  # Less than 1 second per request on average
        print(f"Performance test: 10 requests completed in {total_time:.2f} seconds")

# Utility functions for manual testing
def create_test_client():
    """Create a test client for manual testing."""
    return requests.Session()

def run_manual_tests():
    """Run manual tests that require human verification."""
    print("Running manual tests...")
    
    # Test API health
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test scoring
    test_request = {
        "user_id": "manual_test_user",
        "order_id": "manual_test_order",
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
        response = requests.post(f"{API_BASE_URL}/score", json=test_request)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Scoring test: Risk score = {data['risk_score']:.3f}")
            print(f"   Flagged: {data['is_flagged']}")
        else:
            print(f"❌ Scoring test failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Scoring test failed: {e}")
        return False
    
    print("✅ Manual tests completed successfully!")
    return True

if __name__ == "__main__":
    # Run manual tests when script is executed directly
    run_manual_tests()
