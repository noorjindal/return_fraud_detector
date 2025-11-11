import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Button, 
  Alert, 
  Row, 
  Col, 
  Divider,
  Tag,
  Progress,
  Spin,
  Result
} from 'antd';
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const FraudScorer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prepare the request data
      const requestData = {
        user_id: values.user_id || 'user_001234',
        order_id: values.order_id || 'order_567890',
        user_age_days: values.user_age_days || 30,
        num_orders: values.num_orders || 5,
        avg_order_value: values.avg_order_value || 100,
        device_count: values.device_count || 1,
        return_rate: values.return_rate || 0.1,
        recent_returns_30d: values.recent_returns_30d || 0,
        recent_returns_90d: values.recent_returns_90d || 1,
        recent_returns_365d: values.recent_returns_365d || 2,
        order_value: values.order_value || 150,
        item_count: values.item_count || 2,
        product_risk_score: values.product_risk_score || 0.5,
        shipping_method_express: values.shipping_method_express || 0,
        billing_shipping_mismatch: values.billing_shipping_mismatch || 0,
        days_to_return: values.days_to_return || 3,
        return_reason_suspicious: values.return_reason_suspicious || 0,
        refund_type_cash: values.refund_type_cash || 1,
        refund_type_store_credit: values.refund_type_store_credit || 0,
        is_high_value: values.is_high_value || 0,
        email_domain_risk: values.email_domain_risk || 0,
        hour_of_day: values.hour_of_day || 14,
        is_weekend: values.is_weekend || 0
      };

      const response = await axios.post('http://localhost:8000/score', requestData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while scoring the return request');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 0.8) return { level: 'High Risk', color: '#ff4d4f', status: 'error' };
    if (score >= 0.5) return { level: 'Medium Risk', color: '#faad14', status: 'warning' };
    return { level: 'Low Risk', color: '#52c41a', status: 'success' };
  };

  const getRiskIcon = (score) => {
    if (score >= 0.8) return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    if (score >= 0.5) return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
  };

  const renderResult = () => {
    if (!result) return null;

    const { level, color, status } = getRiskLevel(result.risk_score);
    const riskPercentage = (result.risk_score * 100).toFixed(1);

    return (
      <Card 
        title="Fraud Risk Assessment" 
        style={{ marginTop: 24 }}
        className={`fraud-result ${result.risk_score >= 0.8 ? 'high-risk' : result.risk_score >= 0.5 ? 'medium-risk' : 'low-risk'}`}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'center' }}>
              <div className={`risk-score ${result.risk_score >= 0.8 ? 'high' : result.risk_score >= 0.5 ? 'medium' : 'low'}`}>
                {riskPercentage}%
              </div>
              <div style={{ fontSize: '18px', marginBottom: '16px' }}>
                {getRiskIcon(result.risk_score)} {level}
              </div>
              <Progress
                type="circle"
                percent={parseFloat(riskPercentage)}
                strokeColor={color}
                size={120}
                format={() => `${riskPercentage}%`}
              />
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div>
              <h4>Assessment Details</h4>
              <p><strong>Flagged for Review:</strong> {result.is_flagged ? 'Yes' : 'No'}</p>
              <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
              <p><strong>Model Version:</strong> {result.model_version}</p>
              <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
              
              <Divider />
              
              <h4>Top Risk Factors</h4>
              {result.top_risk_factors && result.top_risk_factors.length > 0 ? (
                <div className="risk-factors">
                  {result.top_risk_factors.map((factor, index) => (
                    <div key={index} className="risk-factor-item">
                      <div>
                        <div className="risk-factor-name">{factor.feature}</div>
                        <div className="risk-factor-value">Value: {factor.value}</div>
                      </div>
                      <Tag 
                        className={`risk-factor-importance ${factor.risk_level}`}
                      >
                        {factor.risk_level}
                      </Tag>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No significant risk factors identified.</p>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div>
      <Card title="Return Fraud Risk Scorer" style={{ marginBottom: 24 }}>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Enter the details of a return request to assess its fraud risk. 
          The system will analyze various factors and provide a risk score.
        </p>
        
        {error && (
          <Alert
            message="Scoring Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="fraud-scorer-form"
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="User ID"
                name="user_id"
                rules={[{ required: true, message: 'Please enter user ID' }]}
              >
                <Input placeholder="e.g., user_001234" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Order ID"
                name="order_id"
                rules={[{ required: true, message: 'Please enter order ID' }]}
              >
                <Input placeholder="e.g., order_567890" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">User Information</Divider>
          
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Account Age (days)"
                name="user_age_days"
                rules={[{ required: true, message: 'Please enter account age' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Number of Orders"
                name="num_orders"
                rules={[{ required: true, message: 'Please enter number of orders' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Average Order Value"
                name="avg_order_value"
                rules={[{ required: true, message: 'Please enter average order value' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Device Count"
                name="device_count"
                rules={[{ required: true, message: 'Please enter device count' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Return Rate (0-1)"
                name="return_rate"
                rules={[{ required: true, message: 'Please enter return rate' }]}
              >
                <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Recent Returns (30d)"
                name="recent_returns_30d"
                rules={[{ required: true, message: 'Please enter recent returns' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Order Information</Divider>
          
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Order Value"
                name="order_value"
                rules={[{ required: true, message: 'Please enter order value' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Item Count"
                name="item_count"
                rules={[{ required: true, message: 'Please enter item count' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Product Risk Score (0-1)"
                name="product_risk_score"
                rules={[{ required: true, message: 'Please enter product risk score' }]}
              >
                <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Return Information</Divider>
          
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Days to Return"
                name="days_to_return"
                rules={[{ required: true, message: 'Please enter days to return' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
                <Form.Item
                  label="Hour of Day (0-23)"
                  name="hour_of_day"
                  rules={[{ required: true, message: 'Please enter hour of day' }]}
                >
                  <InputNumber min={0} max={23} style={{ width: '100%' }} />
                </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Is Weekend (0/1)"
                name="is_weekend"
                rules={[{ required: true, message: 'Please enter weekend flag' }]}
              >
                <InputNumber min={0} max={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={6}>
              <Form.Item
                label="Express Shipping (0/1)"
                name="shipping_method_express"
                rules={[{ required: true, message: 'Please enter shipping method' }]}
              >
                <InputNumber min={0} max={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Address Mismatch (0/1)"
                name="billing_shipping_mismatch"
                rules={[{ required: true, message: 'Please enter address mismatch' }]}
              >
                <InputNumber min={0} max={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Suspicious Reason (0/1)"
                name="return_reason_suspicious"
                rules={[{ required: true, message: 'Please enter return reason' }]}
              >
                <InputNumber min={0} max={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="High Value (0/1)"
                name="is_high_value"
                rules={[{ required: true, message: 'Please enter high value flag' }]}
              >
                <InputNumber min={0} max={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: 'center', marginTop: 32 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              icon={<SearchOutlined />}
              loading={loading}
            >
              {loading ? 'Analyzing...' : 'Score Return Request'}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {renderResult()}
    </div>
  );
};

export default FraudScorer;
