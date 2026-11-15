'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '../../lib/api';

export default function MasterLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code2FA, setCode2FA] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = { email, password };
      if (require2FA) payload.code2FA = code2FA;

      const data = await fetcher('/auth/master-login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.require2FA) {
        setRequire2FA(true);
        setLoading(false);
        return;
      }

      if (data && data.access_token && data.user) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('usuario', JSON.stringify(data.user));
        router.push('/super-admin');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d4af37] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d4af37] opacity-[0.03] blur-[120px] rounded-full"></div>

      <div className="relative z-10 bg-[#121212]/80 backdrop-blur-xl p-10 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.05)] w-full max-w-md border border-[#2a2a2a]">
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#8c6b1d] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <span className="text-4xl text-[#0a0a0a] font-serif font-bold">M</span>
          </div>
          <h1 className="text-3xl font-light text-[#f5f5f5] tracking-[0.2em] uppercase">Master Access</h1>
          <p className="text-[#d4af37] text-xs tracking-[0.3em] uppercase mt-3 font-semibold">Sistema Restringido</p>
        </div>
        
        {error && (
          <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] p-3 rounded-lg mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleMasterLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Credencial Maestra</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#f5f5f5] p-4 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] focus:outline-none transition-all placeholder-gray-600"
              placeholder="admin@tuapp.com"
              required
              disabled={require2FA}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Clave de Encriptación</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#f5f5f5] p-4 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] focus:outline-none transition-all placeholder-gray-600 tracking-widest"
              placeholder="••••••••"
              required
              disabled={require2FA}
            />
          </div>

          {require2FA && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3 ml-1">Código de Seguridad (2FA)</label>
              <input
                type="text"
                value={code2FA}
                onChange={(e) => setCode2FA(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#d4af37] text-[#d4af37] p-4 rounded-xl focus:ring-1 focus:ring-[#d4af37] text-center text-2xl tracking-[0.5em] font-mono shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#b8962e] text-[#0a0a0a] py-4 rounded-xl font-bold uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 mt-4 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            {loading ? 'Verificando...' : require2FA ? 'Validar Código' : 'Desbloquear Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}