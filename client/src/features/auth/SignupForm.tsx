import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useSignup } from '../../hooks/api/useAuth';

const SignupForm: React.FC = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const signupMutation = useSignup();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError(t('signup.passwordMismatch'));
      return;
    }
    if (email && password) {
      setPasswordError('');
      signupMutation.mutate({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('signup.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('signup.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('signup.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('signup.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">{t('signup.passwordHint')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('signup.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('signup.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={signupMutation.isPending || password !== confirmPassword}
            >
              {signupMutation.isPending ? t('signup.creatingAccount') : t('signup.signupButton')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t('signup.haveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('signup.loginLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
