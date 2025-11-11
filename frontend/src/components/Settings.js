import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Switch, 
  Button, 
  Alert, 
  Divider,
  Row,
  Col,
  Tabs,
  Table,
  Tag,
  Space
} from 'antd';
import { 
  SaveOutlined, 
  ReloadOutlined, 
  SettingOutlined,
  ApiOutlined,
  DatabaseOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/metrics');
      setModelInfo(response.data.model_info);
      setFeatureImportance(response.data.feature_importance.slice(0, 10)); // Top 10 features
    } catch (err) {
      console.error('Error loading model info:', err);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      // In a real implementation, this would save settings to a backend
      console.log('Saving settings:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const renderModelSettings = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        fraud_threshold: 0.5,
        confidence_threshold: 0.7,
        auto_flag_enabled: true,
        email_notifications: true,
        slack_notifications: false,
        max_batch_size: 1000,
        retry_attempts: 3,
        timeout_seconds: 30
      }}
    >
      <Card title="Model Configuration" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Fraud Detection Threshold"
              name="fraud_threshold"
              tooltip="Risk score threshold above which returns are flagged"
            >
              <InputNumber
                min={0}
                max={1}
                step={0.01}
                style={{ width: '100%' }}
                formatter={value => `${(value * 100).toFixed(0)}%`}
                parser={value => value.replace('%', '') / 100}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Confidence Threshold"
              name="confidence_threshold"
              tooltip="Minimum confidence required for automatic flagging"
            >
              <InputNumber
                min={0}
                max={1}
                step={0.01}
                style={{ width: '100%' }}
                formatter={value => `${(value * 100).toFixed(0)}%`}
                parser={value => value.replace('%', '') / 100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Auto-Flagging"
              name="auto_flag_enabled"
              valuePropName="checked"
              tooltip="Automatically flag high-risk returns"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Require Manual Review"
              name="manual_review_required"
              valuePropName="checked"
              tooltip="Require manual review for all flagged returns"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="Notification Settings" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 0]}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Email Notifications"
              name="email_notifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Slack Notifications"
              name="slack_notifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="SMS Notifications"
              name="sms_notifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Notification Email"
          name="notification_email"
        >
          <Input placeholder="admin@company.com" />
        </Form.Item>
      </Card>

      <Card title="API Configuration" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 0]}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Max Batch Size"
              name="max_batch_size"
              tooltip="Maximum number of requests in a batch"
            >
              <InputNumber min={1} max={10000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Retry Attempts"
              name="retry_attempts"
              tooltip="Number of retry attempts for failed requests"
            >
              <InputNumber min={0} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Timeout (seconds)"
              name="timeout_seconds"
              tooltip="Request timeout in seconds"
            >
              <InputNumber min={1} max={300} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Form.Item>
        <Space>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            Save Settings
          </Button>
          <Button 
            onClick={() => form.resetFields()}
            icon={<ReloadOutlined />}
            size="large"
          >
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const renderModelInfo = () => (
    <div>
      <Card title="Model Information" style={{ marginBottom: 24 }}>
        {modelInfo ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div>
                <strong>Model Type:</strong> {modelInfo.model_type}
              </div>
              <div>
                <strong>Training Date:</strong> {new Date(modelInfo.training_date).toLocaleString()}
              </div>
              <div>
                <strong>Feature Count:</strong> {modelInfo.feature_count}
              </div>
              <div>
                <strong>Random State:</strong> {modelInfo.random_state}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={loadModelInfo}
                style={{ marginBottom: 16 }}
              >
                Refresh Model Info
              </Button>
            </Col>
          </Row>
        ) : (
          <div>Loading model information...</div>
        )}
      </Card>

      <Card title="Feature Importance">
        <Table
          dataSource={featureImportance}
          columns={[
            {
              title: 'Rank',
              dataIndex: 'rank',
              key: 'rank',
              width: 60,
              render: (_, __, index) => index + 1,
            },
            {
              title: 'Feature',
              dataIndex: 'feature',
              key: 'feature',
            },
            {
              title: 'Importance',
              dataIndex: 'importance',
              key: 'importance',
              render: (value) => (
                <Tag color={value > 100 ? 'red' : value > 50 ? 'orange' : 'green'}>
                  {value.toFixed(2)}
                </Tag>
              ),
            },
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );

  const renderSystemStatus = () => (
    <div>
      <Card title="System Health" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <ApiOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <div style={{ marginTop: '8px', fontWeight: 'bold' }}>API Status</div>
              <div style={{ color: '#52c41a' }}>Healthy</div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <DatabaseOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Database</div>
              <div style={{ color: '#52c41a' }}>Connected</div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <SecurityScanOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Security</div>
              <div style={{ color: '#52c41a' }}>Active</div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Performance Metrics">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>2.3ms</div>
              <div style={{ color: '#666' }}>Avg Response Time</div>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>99.9%</div>
              <div style={{ color: '#666' }}>Uptime</div>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>1,247</div>
              <div style={{ color: '#666' }}>Requests Today</div>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>89</div>
              <div style={{ color: '#666' }}>Flags Today</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );

  return (
    <div>
      {saved && (
        <Alert
          message="Settings Saved"
          description="Your settings have been saved successfully."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Tabs defaultActiveKey="model" type="card">
        <TabPane tab="Model Settings" key="model" icon={<SettingOutlined />}>
          {renderModelSettings()}
        </TabPane>
        <TabPane tab="Model Information" key="info" icon={<ApiOutlined />}>
          {renderModelInfo()}
        </TabPane>
        <TabPane tab="System Status" key="status" icon={<SecurityScanOutlined />}>
          {renderSystemStatus()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;
