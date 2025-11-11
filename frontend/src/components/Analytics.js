import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Button, Select, DatePicker } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [dateRange, setDateRange] = useState([moment().subtract(7, 'days'), moment()]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate analytics data (in real implementation, this would come from your database)
      const mockData = {
        fraudTrends: [
          { date: '2024-01-08', fraud_count: 12, total_returns: 145, fraud_rate: 8.3 },
          { date: '2024-01-09', fraud_count: 8, total_returns: 132, fraud_rate: 6.1 },
          { date: '2024-01-10', fraud_count: 15, total_returns: 158, fraud_rate: 9.5 },
          { date: '2024-01-11', fraud_count: 11, total_returns: 167, fraud_rate: 6.6 },
          { date: '2024-01-12', fraud_count: 18, total_returns: 189, fraud_rate: 9.5 },
          { date: '2024-01-13', fraud_count: 14, total_returns: 156, fraud_rate: 9.0 },
          { date: '2024-01-14', fraud_count: 16, total_returns: 178, fraud_rate: 9.0 }
        ],
        riskDistribution: [
          { name: 'Low Risk (0-0.3)', value: 45, color: '#52c41a' },
          { name: 'Medium Risk (0.3-0.7)', value: 35, color: '#faad14' },
          { name: 'High Risk (0.7-1.0)', value: 20, color: '#ff4d4f' }
        ],
        topRiskFactors: [
          { factor: 'High Order Value', count: 45, percentage: 23.5 },
          { factor: 'New Account', count: 38, percentage: 19.8 },
          { factor: 'Address Mismatch', count: 32, percentage: 16.7 },
          { factor: 'Suspicious Email', count: 28, percentage: 14.6 },
          { factor: 'Multiple Returns', count: 25, percentage: 13.1 },
          { factor: 'Express Shipping', count: 20, percentage: 10.4 }
        ],
        hourlyDistribution: [
          { hour: '00:00', fraud_count: 2, total_returns: 8 },
          { hour: '02:00', fraud_count: 1, total_returns: 5 },
          { hour: '04:00', fraud_count: 0, total_returns: 3 },
          { hour: '06:00', fraud_count: 1, total_returns: 12 },
          { hour: '08:00', fraud_count: 3, total_returns: 25 },
          { hour: '10:00', fraud_count: 5, total_returns: 45 },
          { hour: '12:00', fraud_count: 8, total_returns: 67 },
          { hour: '14:00', fraud_count: 12, total_returns: 89 },
          { hour: '16:00', fraud_count: 10, total_returns: 78 },
          { hour: '18:00', fraud_count: 7, total_returns: 56 },
          { hour: '20:00', fraud_count: 4, total_returns: 34 },
          { hour: '22:00', fraud_count: 2, total_returns: 18 }
        ],
        modelPerformance: {
          accuracy: 0.94,
          precision: 0.87,
          recall: 0.82,
          f1_score: 0.84,
          auc: 0.91
        }
      };

      setAnalyticsData(mockData);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const renderFraudTrends = () => (
    <Card title="Fraud Trends Over Time" style={{ marginBottom: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={analyticsData.fraudTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              name === 'fraud_rate' ? `${value}%` : value,
              name === 'fraud_rate' ? 'Fraud Rate' : name === 'fraud_count' ? 'Fraud Count' : 'Total Returns'
            ]}
          />
          <Bar dataKey="fraud_count" fill="#ff4d4f" name="Fraud Count" />
          <Line type="monotone" dataKey="fraud_rate" stroke="#1890ff" strokeWidth={2} name="Fraud Rate" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderRiskDistribution = () => (
    <Card title="Risk Score Distribution" style={{ marginBottom: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={analyticsData.riskDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {analyticsData.riskDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderTopRiskFactors = () => (
    <Card title="Top Risk Factors" style={{ marginBottom: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analyticsData.topRiskFactors} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="factor" type="category" width={120} />
          <Tooltip formatter={(value) => [`${value}`, 'Count']} />
          <Bar dataKey="count" fill="#1890ff" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderHourlyDistribution = () => (
    <Card title="Fraud by Hour of Day" style={{ marginBottom: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analyticsData.hourlyDistribution}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="fraud_count" fill="#ff4d4f" name="Fraud Count" />
          <Bar dataKey="total_returns" fill="#d9d9d9" name="Total Returns" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderModelPerformance = () => (
    <Card title="Model Performance Metrics">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {(analyticsData.modelPerformance.accuracy * 100).toFixed(1)}%
            </div>
            <div style={{ color: '#666' }}>Accuracy</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {(analyticsData.modelPerformance.precision * 100).toFixed(1)}%
            </div>
            <div style={{ color: '#666' }}>Precision</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
              {(analyticsData.modelPerformance.recall * 100).toFixed(1)}%
            </div>
            <div style={{ color: '#666' }}>Recall</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
              {(analyticsData.modelPerformance.auc * 100).toFixed(1)}%
            </div>
            <div style={{ color: '#666' }}>AUC</div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Analytics Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={loadAnalyticsData}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <h3 style={{ margin: 0 }}>Analytics Dashboard</h3>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: '100%' }}
            >
              <Option value="7d">Last 7 Days</Option>
              <Option value="30d">Last 30 Days</Option>
              <Option value="90d">Last 90 Days</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ flex: 1 }}
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadAnalyticsData}
              >
                Refresh
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          {renderRiskDistribution()}
        </Col>
        <Col xs={24} lg={12}>
          {renderModelPerformance()}
        </Col>
      </Row>

      {renderFraudTrends()}
      {renderTopRiskFactors()}
      {renderHourlyDistribution()}
    </div>
  );
};

export default Analytics;
