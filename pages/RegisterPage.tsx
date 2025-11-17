import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { GoogleIcon } from '../components/icons';
import { authService } from '../supabase/services';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast("Passwords don't match!", 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await authService.signUp(email, password, name);
      addToast('Registration successful! Please check your email to verify your account.', 'success');
      navigate('/login');
    } catch (error: any) {
      addToast(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      // Note: The redirect will be handled by Supabase
    } catch (error: any) {
      addToast(error.message || 'Google sign up failed. Please try again.', 'error');
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
          <h2 className="text-2xl font-bold text-center mb-1 text-zinc-900 dark:text-slate-50">Create an Account</h2>
           <p className="text-zinc-600 dark:text-zinc-400 text-center mb-6">Start tracking your finances today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
                required
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
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
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                required
                placeholder="••••••••"
                minLength={6}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
                required
                placeholder="••••••••"
                minLength={6}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full !py-3" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
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
              <Button variant="secondary" className="w-full !py-3 flex items-center justify-center" onClick={handleGoogleSignUp} disabled={loading}>
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  Sign up with Google
              </Button>
          </div>

          <p className="text-center mt-6 text-zinc-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
