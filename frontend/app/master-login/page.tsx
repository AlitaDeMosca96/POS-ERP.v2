'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [require2FA, setRequire2FA] = useState(false); // <-- NUEVO ESTADO
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body: any = { email, password };
      if (twoFactorCode) {
        body.twoFactorCode = twoFactorCode;
      }

      const response = await fetch('http://localhost:3000/auth/master-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Si el backend pide el código 2FA, activamos el campo
        if (errorData.message === 'Se requiere código 2FA') {
          setRequire2FA(true);
          setError('Ingresá el código de 6 dígitos de tu app.');
          setLoading(false);
          return;
        }
        // Si el código es incorrecto o las credenciales están mal
        throw new Error(errorData.message || 'Credenciales inválidas');
      }

      const data = await response.json();
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      router.push('/super-admin');

    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas o acceso no autorizado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
      
      <div className="w-full max-w-md z-10">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#111] border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <span className="text-[#D4AF37] text-3xl font-bold font-serif">M</span>
          </div>
          <h1 className="text-2xl font-light text-white tracking-[0.2em] uppercase">Master Access</h1>
          <p className="text-[#D4AF37]/60 text-sm mt-2 tracking-widest">SISTEMA RESTRINGIDO</p>
        </div>

        <form onSubmit={handleMasterLogin} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Credencial Maestra</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-800 text-white p-4 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder-gray-700"
              placeholder="admin@tuapp.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Clave de Encriptación</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-800 text-white p-4 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder-gray-700 tracking-[0.3em]"
              placeholder="••••••••"
            />
          </div>

          {/* CAMPO 2FA DINÁMICO */}
          {require2FA && (
            <div className="space-y-1 animate-pulse">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider ml-1">Código de Autenticación</label>
              <input
                type="text"
                required
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full bg-[#111] border border-[#D4AF37]/50 text-[#D4AF37] p-4 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-center tracking-[0.5em] text-2xl font-mono"
                placeholder="000000"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold py-4 rounded-xl hover:from-[#E5C158] hover:to-[#D4AF37] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 mt-4 uppercase tracking-widest text-sm"
          >
            {loading ? 'Verificando...' : require2FA ? 'Validar Código' : 'Desbloquear Sistema'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-600">
            Este intento de acceso está siendo monitoreado y registrado.<br/>
            Las IPs no autorizadas serán bloqueadas.
          </p>
        </div>
      </div>
    </div>
  );
}