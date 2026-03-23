import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="absolute top-1/2 -right-16 h-72 w-72 rounded-full bg-sky-200/60 blur-3xl" />
      </div>

      <main className="relative">
        <Routes>
          <Route
            path="/"
            element={<Navigate to={user && user.emailVerified ? '/dashboard' : '/login'} replace />}
          />
          <Route
            path="/login"
            element={user && user.emailVerified ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user && user.emailVerified ? <Navigate to="/dashboard" replace /> : <Signup />}
          />

          <Route element={<ProtectedRoute user={user} authLoading={authLoading} />}>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
