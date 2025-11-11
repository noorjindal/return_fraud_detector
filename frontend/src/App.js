import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Card, Row, Col, Statistic, Alert, Spin } from 'antd';
import {
  DashboardOutlined,
  SearchOutlined,
  BarChartOutlined,
  SettingOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import FraudScorer from './components/FraudScorer';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await axios.get('http://localhost:8000/health');
      setApiStatus(response.data.model_loaded ? 'healthy' : 'unhealthy');
    } catch (error) {
      setApiStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'healthy':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'unhealthy':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <AlertOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <Spin size="small" />;
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'scorer',
      icon: <SearchOutlined />,
      label: 'Fraud Scorer',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'scorer':
        return <FraudScorer />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          theme="dark"
        >
          <div className="logo" style={{ 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? '16px' : '20px',
            fontWeight: 'bold'
          }}>
            {collapsed ? 'FD' : 'Fraud Detection'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key)}
          />
        </Sider>
        
        <Layout>
          <Header style={{ 
            background: '#fff', 
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: 0, color: '#1890ff' }}>
              Return Fraud Detection System
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getStatusIcon()}
                <span>API Status: {apiStatus}</span>
              </div>
              <button 
                onClick={checkApiHealth}
                style={{
                  padding: '4px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
          </Header>
          
          <Content style={{ 
            margin: '24px 16px', 
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)'
          }}>
            {apiStatus === 'error' && (
              <Alert
                message="API Connection Error"
                description="Unable to connect to the fraud detection API. Please ensure the API server is running on port 8000."
                type="error"
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}
            
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
