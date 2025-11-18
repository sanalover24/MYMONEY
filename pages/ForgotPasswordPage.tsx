import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabase/config';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });

      if (error) throw error;
      
      setEmailSent(true);
      addToast('Password reset email sent! Please check your inbox.', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to send reset email. Please try again.', 'error');
    } finally {
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
          <h2 className="text-2xl font-bold text-center mb-1 text-zinc-900 dark:text-slate-50">Reset Password</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-6">
            {emailSent 
              ? 'Check your email for a password reset link.'
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
          
          {!emailSent ? (
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

              <Button type="submit" className="w-full !py-3" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>. 
                  Please check your email and click the link to reset your password.
                </p>
              </div>
              <Button 
                variant="secondary" 
                className="w-full !py-3" 
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                Send Another Email
              </Button>
            </div>
          )}

          <p className="text-center mt-6 text-zinc-600 dark:text-zinc-400">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

