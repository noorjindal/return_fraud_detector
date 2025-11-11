import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Alert, Spin, Table, Tag, Button } from 'antd';
import { 
  RiseOutlined, 
  FallOutlined, 
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReturns: 0,
    flaggedReturns: 0,
    fraudRate: 0,
    avgRiskScore: 0
  });
  const [recentFlags, setRecentFlags] = useState([]);
  const [apiHealth, setApiHealth] = useState('checking');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Check API health
      const healthResponse = await axios.get('http://localhost:8000/health');
      setApiHealth(healthResponse.data.model_loaded ? 'healthy' : 'unhealthy');
      
      // Load metrics
      const metricsResponse = await axios.get('http://localhost:8000/metrics');
      
      // Simulate dashboard data (in real implementation, this would come from your database)
      setStats({
        totalReturns: 1247,
        flaggedReturns: 89,
        fraudRate: 7.1,
        avgRiskScore: 0.34
      });
      
      // Simulate recent flags
      setRecentFlags([
        {
          key: '1',
          user_id: 'user_001234',
          order_id: 'order_567890',
          risk_score: 0.87,
          timestamp: '2024-01-15T10:30:00Z',
          status: 'pending'
        },
        {
          key: '2',
          user_id: 'user_002345',
          order_id: 'order_678901',
          risk_score: 0.92,
          timestamp: '2024-01-15T09:15:00Z',
          status: 'reviewed'
        },
        {
          key: '3',
          user_id: 'user_003456',
          order_id: 'order_789012',
          risk_score: 0.78,
          timestamp: '2024-01-15T08:45:00Z',
          status: 'pending'
        }
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setApiHealth('error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Pending Review' },
      reviewed: { color: 'blue', text: 'Under Review' },
      approved: { color: 'green', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getRiskLevel = (score) => {
    if (score >= 0.8) return { level: 'High', color: '#ff4d4f' };
    if (score >= 0.5) return { level: 'Medium', color: '#faad14' };
    return { level: 'Low', color: '#52c41a' };
  };

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120,
    },
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 120,
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk_score',
      key: 'risk_score',
      width: 100,
      render: (score) => (
        <span style={{ 
          color: getRiskLevel(score).color,
          fontWeight: 'bold'
        }}>
          {(score * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      title: 'Risk Level',
      dataIndex: 'risk_score',
      key: 'risk_level',
      width: 100,
      render: (score) => {
        const { level, color } = getRiskLevel(score);
        return <Tag color={color}>{level}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button size="small" type="link">
          Review
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Returns"
              value={stats.totalReturns}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Flagged Returns"
              value={stats.flaggedReturns}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Fraud Rate"
              value={stats.fraudRate}
              suffix="%"
              prefix={<FallOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Avg Risk Score"
              value={stats.avgRiskScore}
              precision={2}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="System Status" 
            extra={
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadDashboardData}
                size="small"
              >
                Refresh
              </Button>
            }
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {apiHealth === 'healthy' ? (
                <div>
                  <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                  <p style={{ marginTop: '16px', fontSize: '16px', color: '#52c41a' }}>
                    System Operational
                  </p>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Model loaded and ready for predictions
                  </p>
                </div>
              ) : (
                <div>
                  <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
                  <p style={{ marginTop: '16px', fontSize: '16px', color: '#ff4d4f' }}>
                    System Error
                  </p>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Unable to connect to API
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent High-Risk Flags">
            <Table
              columns={columns}
              dataSource={recentFlags}
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Quick Actions">
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Button type="primary" size="large">
                Score New Return
              </Button>
              <Button size="large">
                View All Flags
              </Button>
              <Button size="large">
                Generate Report
              </Button>
              <Button size="large">
                Model Performance
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
