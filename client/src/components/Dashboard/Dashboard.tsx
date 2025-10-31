import React from 'react';
import { Button, Card } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const handleLogout = () => {
    api.logout();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <Card
        title="Dashboard"
        extra={
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        }
      >
        <h2>Welcome, {profile?.data.email}!</h2>
        <p>Account created: {new Date(profile?.data.created_at || '').toLocaleDateString()}</p>
        <p>This is your dashboard. More features coming soon!</p>
      </Card>
    </div>
  );
};

export default Dashboard;
