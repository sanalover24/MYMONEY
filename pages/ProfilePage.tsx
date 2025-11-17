import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SunIcon, MoonIcon, RefreshCwIcon, XIcon, MonitorIcon } from '../components/icons';
import { useToast } from '../context/ToastContext';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import { calculatePasswordStrength } from '../utils/validation';
import { ThemeSetting } from '../context/ThemeContext';
import { authService, profileService } from '../supabase/services';
import { supabase } from '../supabase/config';

const ProfilePage: React.FC = () => {
  const { user, resetToDefaults } = useData();
  const { addToast } = useToast();
  const { themeSetting, setThemeSetting } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState('');
  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    // Reset confirmation text when modal is closed
    if (!isConfirmingReset) {
      setResetConfirmationText('');
    }
  }, [isConfirmingReset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const userId = (await authService.getCurrentUser())?.id;
      if (!userId) throw new Error('User not authenticated');
      
      await profileService.updateProfile(userId, { name, email });
      
      // Update theme setting if available
      const updates: any = {};
      if (themeSetting) {
        updates.theme_setting = themeSetting;
      }
      if (Object.keys(updates).length > 0) {
        await profileService.updateProfile(userId, updates);
      }
      
      addToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      addToast(error.message || 'Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill in all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    
    // Enforce password strength
    const strength = calculatePasswordStrength(newPassword);
    if (strength.score < 4) {
        addToast('Password is too weak. Please meet at least 4 criteria.', 'error');
        return;
    }

    setLoading(true);
    try {
      // Verify current password by attempting to re-authenticate
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || !currentUser.email) {
        throw new Error('User not authenticated');
      }

      // Try to sign in with current password to verify it
      try {
        await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: currentPassword,
        });
      } catch (error: any) {
        addToast('Incorrect current password.', 'error');
        setLoading(false);
        return;
      }

      // Update password
      await authService.updatePassword(newPassword);
      addToast('Your password has been securely updated.', 'success');
      
      // Clear fields for security
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      addToast(error.message || 'Error updating password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (resetConfirmationText === 'RESET') {
        try {
          await resetToDefaults();
          setIsConfirmingReset(false);
          addToast('All data has been reset to defaults.', 'success');
        } catch (error: any) {
          addToast(error.message || 'Error resetting data', 'error');
        }
    } else {
        addToast('Confirmation text does not match.', 'error');
    }
  };
  
  const inputClasses = "mt-1 block w-full px-3 py-2 border rounded-lg bg-white/70 dark:bg-zinc-700/50 border-white/50 dark:border-zinc-600/50 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500";

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <Card>
          <p className="text-center text-zinc-600 dark:text-zinc-400">Loading profile...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <div className="animate-fade-in-up">
            <Card>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Profile Settings</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClasses}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClasses}
                            disabled={loading}
                        />
                    </div>
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 sm:mb-0">
                            Theme
                        </label>
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center bg-slate-100/50 dark:bg-zinc-900/50 rounded-lg p-1 space-y-1 sm:space-y-0 sm:space-x-1">
                            {[
                                { setting: 'light', icon: SunIcon, label: 'Light' },
                                { setting: 'dark', icon: MoonIcon, label: 'Dark' },
                                { setting: 'system', icon: MonitorIcon, label: 'System' },
                            ].map(item => (
                                <button
                                    key={item.setting}
                                    type="button"
                                    onClick={() => setThemeSetting(item.setting as ThemeSetting)}
                                    disabled={loading}
                                    className={`flex items-center justify-center w-full sm:w-24 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800
                                        ${themeSetting === item.setting
                                            ? 'bg-white/80 dark:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50'
                                        }`
                                    }
                                    aria-label={`Set theme to ${item.label}`}
                                >
                                    <item.icon className="w-5 h-5 mr-2" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="flex justify-end pt-2 border-t dark:border-zinc-700">
                        <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Profile'}</Button>
                    </div>
                </form>
            </Card>
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <Card>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="current-password">Current Password</label>
                <input type="password" id="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClasses} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="new-password">New Password</label>
                <input type="password" id="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClasses} disabled={loading} />
              </div>
              <div className="pb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="confirm-password">Confirm New Password</label>
                <input type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClasses} disabled={loading} />
              </div>
              {newPassword && <PasswordStrengthMeter password={newPassword} />}
              <div className="flex justify-end pt-4 border-t dark:border-zinc-700">
                <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Change Password'}</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Danger Zone</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">These actions are permanent and cannot be undone.</p>
                <div className="flex justify-between items-center p-4 border border-rose-500/30 rounded-lg bg-rose-50/50 dark:bg-rose-900/20">
                    <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Reset All Data</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Restore all transactions and categories to their default state.</p>
                    </div>
                    <Button variant="danger" onClick={() => setIsConfirmingReset(true)} disabled={loading}>
                        <RefreshCwIcon className="w-4 h-4 mr-2" /> Reset
                    </Button>
                </div>
            </Card>
        </div>
        
        {isConfirmingReset && (
            <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsConfirmingReset(false)}>
                <Card className="w-full max-w-md animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center pb-4 border-b dark:border-zinc-700">
                        <h2 className="text-xl font-bold text-rose-600 dark:text-rose-500">Confirm Data Reset</h2>
                        <button onClick={() => setIsConfirmingReset(false)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200" disabled={loading}>
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="pt-6 space-y-4">
                        <p className="text-zinc-600 dark:text-zinc-400">
                           This will permanently delete all your current transactions and categories and replace them with the default sample data.
                        </p>
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                           To confirm, please type <code className="bg-slate-100 dark:bg-zinc-700 text-rose-600 dark:text-rose-500 font-bold px-2 py-1 rounded-md">RESET</code> in the box below.
                        </p>
                        <div>
                            <input
                                type="text"
                                value={resetConfirmationText}
                                onChange={(e) => setResetConfirmationText(e.target.value)}
                                className={inputClasses}
                                placeholder="RESET"
                                disabled={loading}
                            />
                        </div>
                        <div className="flex justify-end pt-4 gap-3 border-t dark:border-zinc-700">
                            <Button variant="secondary" onClick={() => setIsConfirmingReset(false)} disabled={loading}>Cancel</Button>
                            <Button variant="danger" onClick={handleConfirmReset} disabled={resetConfirmationText !== 'RESET' || loading}>
                                {loading ? 'Resetting...' : "I understand, reset my data"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}
    </div>
  );
};

export default ProfilePage;
