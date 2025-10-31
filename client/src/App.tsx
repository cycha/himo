import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, Layout, Menu, Button } from 'antd';
import { HomeOutlined, LoginOutlined, UserAddOutlined, DashboardOutlined, LogoutOutlined } from '@ant-design/icons';
import api from './services/api';
import './App.css';

// Components
import Search from './components/Search/Search';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import PrivateRoute from './components/PrivateRoute';

const { Header, Content } = Layout;

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = api.isAuthenticated();

  const handleLogout = () => {
    api.logout();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <HomeOutlined style={{ fontSize: '24px', color: 'white', marginRight: '16px' }} />
          <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>HIMO</span>
        </div>
        
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ flex: 1, marginLeft: '50px' }}
          items={[
            {
              key: '/',
              icon: <HomeOutlined />,
              label: <Link to="/">Search</Link>,
            },
            ...(isAuthenticated
              ? [
                  {
                    key: '/dashboard',
                    icon: <DashboardOutlined />,
                    label: <Link to="/dashboard">Dashboard</Link>,
                  },
                ]
              : []),
          ]}
        />

        <div>
          {isAuthenticated ? (
            <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button type="text" icon={<LoginOutlined />} style={{ color: 'white' }}>
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button type="primary" icon={<UserAddOutlined />} style={{ marginLeft: '8px' }}>
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </Header>

      <Content style={{ padding: '0' }}>
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 4,
          },
        }}
      >
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ConfigProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
