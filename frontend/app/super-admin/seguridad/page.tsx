'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { verificarSesion } from '../../../lib/auth';

export default function SeguridadPage() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = verificarSesion('SUPER_ADMIN');
    if (!user) return;
  }, [router]);

  const generate2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetcher('/auth/2fa/generate', { method: 'POST' });
      setQrCode(data.otpauthUrl);
      setSecret(data.secret);
    } catch (err: any) {
      setError('Error al generar el código. Iniciá sesión de nuevo.');
      if (err.message === 'Sesión expirada') router.push('/master-login');
    } finally {
      setLoading(false);
    }
  };

  const activate2FA = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await fetcher('/auth/2fa/turn-on', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setIsEnabled(true);
      setSuccess('¡2FA Activado correctamente! A partir de ahora se te pedirá el código al iniciar sesión.');
    } catch (err: any) {
      setError(err.message || 'Código incorrecto. Verificá la hora de tu celular.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-white font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-[#2a2a2a] pb-4">
          <div>
            <h1 className="text-3xl font-light text-[#d4af37] tracking-widest uppercase">Seguridad 2FA</h1>
            <p className="text-gray-400 text-sm mt-1">Configurá tu autenticación de dos factores.</p>
          </div>
          <Link href="/super-admin" className="text-sm text-[#d4af37] hover:text-[#b8962e] transition-colors uppercase tracking-wider font-semibold">
            &larr; Volver al Panel
          </Link>
        </div>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg mb-6">{success}</div>}

        <div className="bg-[#121212] border border-[#2a2a2a] p-8 rounded-2xl shadow-lg">
          {isEnabled ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-green-400">2FA Activado</h2>
              <p className="text-gray-400 mt-2">Tu cuenta está protegida con doble factor.</p>
            </div>
          ) : !qrCode ? (
            <div className="text-center py-10">
              <p className="text-gray-300 mb-6">El 2FA está desactivado. Te recomendamos activarlo para evitar accesos no autorizados.</p>
              <button
                onClick={generate2FA}
                disabled={loading}
                className="bg-[#d4af37] text-[#0a0a0a] px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-[#b8962e] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50"
              >
                {loading ? 'Generando QR...' : 'Generar Código QR'}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-400 mb-4 text-center">1. Escaneá este código con Google Authenticator</p>
                <div className="bg-white p-4 rounded-xl">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} alt="QR Code" width={200} height={200} />
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">O ingresá este código manual: <br/> <span className="font-mono text-[#d4af37] select-all">{secret}</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-4">2. Ingresá el código de 6 dígitos de tu app</p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#d4af37] p-4 rounded-xl focus:ring-1 focus:ring-[#d4af37] text-center text-2xl tracking-[0.5em] font-mono mb-4"
                  placeholder="000000"
                  maxLength={6}
                />
                <button
                  onClick={activate2FA}
                  disabled={loading || code.length !== 6}
                  className="w-full bg-[#d4af37] text-[#0a0a0a] py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-[#b8962e] transition-all disabled:opacity-50"
                >
                  {loading ? 'Validando...' : 'Activar 2FA'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}