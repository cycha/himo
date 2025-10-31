import React from 'react';
import { Card, Button, Statistic, Row, Col } from 'antd';
import { LogoutOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <Card
        title="Dashboard"
        extra={
          <Button icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Email"
                value={user.email}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Account Created"
                value={user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 16 }}>
          <h3>Welcome to Himo! 🏠</h3>
          <p>Search for real estate ads and find your dream property.</p>
          <p>More features coming soon!</p>
        </Card>
      </Card>
    </div>
  );
};

export default DashboardPage;
