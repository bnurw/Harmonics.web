import React, { useState } from 'react';
import { X, Mail, Lock, User, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'verify'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verificationTokenInput, setVerificationTokenInput] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('You must accept the terms and agreement.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birthday, email, password, termsAccepted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed.');
      setSuccessMessage('Account created successfully! Please verify your email using the token provided or switch to login.');
      if (data.verificationToken) {
        setVerificationTokenInput(data.verificationToken);
      }
      setMode('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationTokenInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed.');
      setSuccessMessage('Email verified successfully! You can now log in.');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset request failed.');
      setSuccessMessage(data.message || 'Password reset instructions sent.');
      if (data.resetToken) {
        setResetTokenInput(data.resetToken);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetTokenInput, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed.');
      setSuccessMessage('Password reset successfully! You can now log in.');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-md p-8 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-950 tracking-tight">
            {mode === 'login' && 'Sign in to Harmonics'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'verify' && 'Verify your email'}
            {mode === 'reset' && 'Reset your password'}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {mode === 'login' && 'Enter your credentials to access your account'}
            {mode === 'signup' && 'Name → Birthday → Email → Password → Agreement'}
            {mode === 'verify' && 'Enter verification token to activate your account'}
            {mode === 'reset' && 'Enter your email to receive password reset instructions'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-700">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setMode('reset'); setError(null); setSuccessMessage(null); }}
                  className="text-xs text-neutral-500 hover:text-neutral-950"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-xl bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center pt-4">
              <span className="text-xs text-neutral-500">Don&apos;t have an account? </span>
              <button 
                type="button" 
                onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
                className="text-xs font-medium text-neutral-950 hover:underline"
              >
                Sign up
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivers"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Birthday</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input 
                  type="date" 
                  required
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 text-neutral-950 focus:ring-0"
              />
              <label htmlFor="terms" className="text-xs text-neutral-600 leading-tight">
                I agree to the Harmonics Terms of Service, Privacy Policy, and Community Guidelines.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-xl bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-neutral-500">Already have an account? </span>
              <button 
                type="button" 
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className="text-xs font-medium text-neutral-950 hover:underline"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Verification Token</label>
              <input 
                type="text" 
                required
                value={verificationTokenInput}
                onChange={(e) => setVerificationTokenInput(e.target.value)}
                placeholder="Paste token or dev preview token"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono focus:outline-none focus:border-neutral-950 transition-colors"
              />
              <p className="text-[11px] text-neutral-400 mt-1">In development preview, the verification token is auto-filled above.</p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-xl bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className="text-xs text-neutral-600 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <div className="space-y-4">
            {!resetTokenInput ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Email address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 transition-colors"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetExecute} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Reset Token</label>
                  <input 
                    type="text" 
                    required
                    value={resetTokenInput}
                    onChange={(e) => setResetTokenInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono focus:outline-none focus:border-neutral-950 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 transition-colors"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Update Password'}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className="text-xs text-neutral-600 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
