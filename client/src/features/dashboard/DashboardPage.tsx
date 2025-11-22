import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { User, Calendar, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BotControlPanel from './components/BotControlPanel';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('welcome')}</p>
        </div>
        <Button onClick={logout} variant="outline">
          <LogOut className="h-4 w-4 mr-2" />
          {t('logout')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('email')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{user.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('accountCreated')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {t('welcomeTitle')}
          </CardTitle>
          <CardDescription>{t('welcomeDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{t('searchMessage')}</p>
          <p className="text-muted-foreground">{t('comingSoon')}</p>
        </CardContent>
      </Card>

      {/* Bot Control Panel */}
      <BotControlPanel />
    </div>
  );
};

export default DashboardPage;
