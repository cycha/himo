import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../../services/api';
import type { LoginForm, SignupForm, AuthResponse } from '../../types';

export const useLogin = (): UseMutationResult<AuthResponse, Error, LoginForm> => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginForm) => api.login(credentials),
    onSuccess: () => {
      message.success('Login successful!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useSignup = (): UseMutationResult<AuthResponse, Error, SignupForm> => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignupForm) => api.signup(data),
    onSuccess: () => {
      message.success('Account created successfully!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Signup failed');
    },
  });
};
