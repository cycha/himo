import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLogin } from '../../hooks/api/useAuth';
import type { LoginForm as LoginFormType } from '../../types';
import './Auth.css';

const LoginForm: React.FC = () => {
  const [form] = Form.useForm();
  const loginMutation = useLogin();

  const onFinish = (values: LoginFormType) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title="Login to Himo">
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

export default LoginForm;
