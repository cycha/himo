import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Feature Components
import SearchPage from './features/ads/SearchPage';
import LoginForm from './features/auth/LoginForm';
import SignupForm from './features/auth/SignupForm';
import DashboardPage from './features/dashboard/DashboardPage';
import PrivateRoute from './components/PrivateRoute';

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
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Home className="h-6 w-6 text-white" />
              <span className="text-white text-xl font-bold">HIMO</span>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center gap-6 flex-1 ml-12">
              <Link 
                to="/" 
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  location.pathname === '/' ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Home className="h-4 w-4" />
                Search
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/dashboard"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Button onClick={logout} variant="default" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-slate-800">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
