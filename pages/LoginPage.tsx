import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { GoogleIcon, EyeIcon, EyeOffIcon } from '../components/icons';
import { authService } from '../supabase/services';
import { useToast } from '../context/ToastContext';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signIn(email, password);
      addToast('Login successful!', 'success');
      onLogin();
      navigate('/dashboard');
    } catch (error: any) {
      addToast(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      // Note: The redirect will be handled by Supabase
    } catch (error: any) {
      addToast(error.message || 'Google login failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-lg bg-slate-100/80 dark:bg-zinc-800/50 border border-slate-300/50 dark:border-transparent text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-zinc-500 dark:placeholder:text-zinc-400";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-zinc-800 dark:text-slate-50 tracking-wider">
          MYMONEY.
        </h1>
        <Card className="animate-fade-in-up">
          <h2 className="text-2xl font-bold text-center mb-1 text-zinc-900 dark:text-slate-50">Welcome Back</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-6">Sign in to continue to your account.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                required
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-zinc-500 dark:text-zinc-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 dark:border-zinc-600 bg-transparent text-brand-600 focus:ring-brand-500" disabled={loading} />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-900 dark:text-zinc-300">Remember me</label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-500">Forgot password?</Link>
              </div>
            </div>

            <Button type="submit" className="w-full !py-3" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="bg-white/60 dark:bg-black/30 px-2 text-zinc-500 dark:text-zinc-400 backdrop-blur-sm">OR</span>
              </div>
          </div>

          <div>
              <Button variant="secondary" className="w-full !py-3 flex items-center justify-center" onClick={handleGoogleLogin} disabled={loading}>
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  Sign in with Google
              </Button>
          </div>

          <p className="text-center mt-6 text-zinc-600 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Register
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
