import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else {
          setProfile({ name: user.displayName || 'User', email: user.email });
        }
      } catch (fetchError) {
        setError(fetchError.message || 'Could not load user profile.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const onLogout = async () => {
    setError('');
    setMessage('');
    try {
      await signOut(auth);
      setMessage('Logged out successfully.');
      setTimeout(() => navigate('/login'), 500);
    } catch (logoutError) {
      setError(logoutError.message || 'Failed to log out.');
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-12">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-glow">
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-8 text-white md:px-10">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm text-white/90">Protected content, only for verified users.</p>
        </div>

        <div className="space-y-5 px-6 py-8 md:px-10">
          <Alert type="success" message={message} />
          <Alert type="error" message={error} />

          {loading ? (
            <LoadingSpinner text="Fetching your profile..." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{profile?.name || 'N/A'}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{profile?.email || user.email}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Email Verification</p>
                <p className="mt-1 text-lg font-semibold text-emerald-700">
                  {user.emailVerified ? 'Verified' : 'Not Verified'}
                </p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">UID</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-700">{user.uid}</p>
              </article>
            </div>
          )}

          <button
            onClick={onLogout}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
