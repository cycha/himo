import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../components/ui/toast';
import api from '../../services/api';
import type { LoginForm, SignupForm, AuthResponse } from '../../types';

export const useLogin = (): UseMutationResult<AuthResponse, Error, LoginForm> => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginForm) => api.login(credentials),
    onSuccess: () => {
      toast.success('Login successful!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useSignup = (): UseMutationResult<AuthResponse, Error, SignupForm> => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignupForm) => api.signup(data),
    onSuccess: () => {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      // Handle validation errors from API
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details;
        validationErrors.forEach((err: any) => {
          toast.error(err.msg || err.message);
        });
      } else {
        toast.error(error.response?.data?.message || error.response?.data?.error || 'Signup failed');
      }
    },
  });
};
