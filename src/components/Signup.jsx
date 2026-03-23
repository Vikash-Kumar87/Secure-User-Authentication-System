import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState('');

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      return 'Password must include at least one uppercase letter and one number.';
    }
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setWarning('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(credential.user, { displayName: form.name.trim() });
      await sendEmailVerification(credential.user);

      try {
        await setDoc(doc(db, 'users', credential.user.uid), {
          uid: credential.user.uid,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          emailVerified: false,
          createdAt: serverTimestamp(),
        });
      } catch (firestoreError) {
        if (firestoreError.code === 'permission-denied' || firestoreError.code === 'firestore/permission-denied') {
          setWarning('Account created, but Firestore blocked profile save. Update Firestore rules to allow users/{uid} write for authenticated user.');
        } else {
          setWarning('Account created, but profile save failed in Firestore.');
        }
      }

      setSuccess('Signup successful. Verify your email before logging in.');
      setForm({ name: '', email: '', password: '', confirmPassword: '' });

      setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (signupError) {
      if (signupError.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try logging in.');
      } else {
        setError(signupError.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignup = async () => {
    setError('');
    setSuccess('');
    setWarning('');
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
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      ).catch((firestoreError) => {
        if (firestoreError.code === 'permission-denied' || firestoreError.code === 'firestore/permission-denied') {
          setWarning('Google account created, but Firestore blocked profile save.');
        }
      });

      setSuccess('Google signup successful. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (googleError) {
      if (googleError.code === 'auth/popup-closed-by-user') {
        setError('Google sign-up popup was closed. Please try again.');
      } else {
        setError(googleError.message || 'Google sign-up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-7 shadow-glow backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-800">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Secure signup with email verification.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <Alert type="error" message={error} />
          <Alert type="success" message={success} />
          <Alert type="error" message={warning} />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Full name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="At least 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              autoComplete="new-password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Sign up'}
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
            onClick={onGoogleSignup}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Continue with Google
          </button>

          {loading && <LoadingSpinner text="Creating secure account..." />}
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-brand-700 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
