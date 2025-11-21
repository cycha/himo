import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';
import { useAuth } from '../../context/AuthContext';
import type { LoginForm, SignupForm, AuthResponse } from '../../types';

export const useLogin = (): UseMutationResult<AuthResponse, Error, LoginForm> => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation('auth');

  return useMutation({
    mutationFn: async (credentials: LoginForm) => {
      await login(credentials.email, credentials.password);
      // Return a dummy response since login() updates context
      return {} as AuthResponse;
    },
    onSuccess: () => {
      toast.success(t('login.success'));
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || t('login.error'));
    },
  });
};

export const useSignup = (): UseMutationResult<AuthResponse, Error, SignupForm> => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useTranslation('auth');

  return useMutation({
    mutationFn: async (data: SignupForm) => {
      await signup(data.email, data.password);
      // Return a dummy response since signup() updates context
      return {} as AuthResponse;
    },
    onSuccess: () => {
      toast.success(t('signup.success'));
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
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            t('signup.error')
        );
      }
    },
  });
};
