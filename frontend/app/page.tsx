'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetcher('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data && data.access_token && data.user) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('usuario', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError('El servidor no devolvió los datos correctamente.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">POS-ERP</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 font-bold"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}