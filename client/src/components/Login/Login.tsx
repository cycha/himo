import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import type { LoginForm } from '../../types';
import './Login.css';

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (values: LoginForm) => api.login(values),
    onSuccess: () => {
      message.success('Login successful!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    },
  });

  const onFinish = (values: LoginForm) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="Login to Himo">
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loginMutation.isPending}
            >
              Log in
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Don't have an account? <Link to="/signup">Sign up now</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
