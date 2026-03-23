import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const onLogin = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!isEmailValid) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (cooldown > 0) {
      setError(`Too many attempts. Please wait ${cooldown}s or use Forgot Password.`);
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = credential;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        await signOut(auth);
        setError('Email not verified. Verification email resent.');
        return;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        emailVerified: true,
        lastLoginAt: new Date().toISOString(),
      }).catch(() => {
        // Document might not exist if manually removed.
      });

      setSuccess('Login successful. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (loginError) {
      if (loginError.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (loginError.code === 'auth/too-many-requests') {
        setCooldown(30);
        setError('Too many login attempts. Wait 30 seconds, then try again or reset password.');
      } else {
        setError(loginError.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async () => {
    setError('');
    setSuccess('');

    if (!isEmailValid) {
      setError('Enter your email first to reset password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent. Check your inbox.');
    } catch (resetError) {
      setError(resetError.message || 'Could not send password reset email.');
    }
  };

  const onGoogleLogin = async () => {
    setError('');
    setSuccess('');

    if (cooldown > 0) {
      setError(`Too many attempts. Please wait ${cooldown}s and try again.`);
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const { user } = credential;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: (user.email || '').toLowerCase(),
          emailVerified: user.emailVerified,
          lastLoginAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {
        // Firestore write failures should not block authenticated user sign-in.
      });

      setSuccess('Google login successful. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (googleError) {
      if (googleError.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed. Please try again.');
      } else if (googleError.code === 'auth/too-many-requests') {
        setCooldown(30);
        setError('Too many requests. Wait 30 seconds, then try Google login again.');
      } else {
        setError(googleError.message || 'Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-7 shadow-glow backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Login with your verified account.</p>

        <form className="mt-6 space-y-4" onSubmit={onLogin} noValidate>
          <Alert type="error" message={error} />
          <Alert type="success" message={success} />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value.trim())}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : cooldown > 0 ? `Try again in ${cooldown}s` : 'Login'}
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs uppercase tracking-wide text-slate-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={loading || cooldown > 0}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Continue with Google
          </button>

          <button
            type="button"
            onClick={onForgotPassword}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Forgot Password
          </button>

          {loading && <LoadingSpinner text="Verifying secure session..." />}
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New user?{' '}
          <Link className="font-semibold text-brand-700 hover:underline" to="/signup">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
