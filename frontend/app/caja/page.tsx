'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Caja {
  id: string;
  saldoInicial: number;
  estado: string;
  fechaApertura: string;
}

export default function CajaPage() {
  const router = useRouter();
  const [cajaAbierta, setCajaAbierta] = useState<Caja | null>(null);
  const [loading, setLoading] = useState(true);
  const [montoInput, setMontoInput] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    verificarCaja();
  }, [router, token]);

  const verificarCaja = async () => {
    try {
      const res = await fetch('http://localhost:3000/cajas/abierta', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const texto = await res.text();
        if (texto && texto !== 'null') {
          setCajaAbierta(JSON.parse(texto));
        } else {
          setCajaAbierta(null);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleAbrirCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/cajas/apertura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ saldoInicial: Number(montoInput) })
      });

      if (res.ok) {
        alert('Caja abierta con éxito');
        setMontoInput('');
        verificarCaja();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Error al abrir caja');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCerrarCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cajaAbierta) return;

    try {
      const res = await fetch(`http://localhost:3000/cajas/${cajaAbierta.id}/cierre`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ saldoFinal: Number(montoInput) })
      });

      if (res.ok) {
        alert('Caja cerrada con éxito');
        setMontoInput('');
        verificarCaja();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center">Verificando estado de la caja...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Caja</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline text-sm">
            Volver
          </button>
        </div>

        {cajaAbierta ? (
          <div>
            <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 border border-green-200 text-center">
              <p className="font-bold text-lg">Caja Abierta</p>
              <p className="text-sm">Saldo inicial: ${cajaAbierta.saldoInicial}</p>
              <p className="text-xs text-green-600 mt-1">Desde: {new Date(cajaAbierta.fechaApertura).toLocaleString()}</p>
            </div>

            <form onSubmit={handleCerrarCaja} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Final en Efectivo (Arqueo)</label>
                <input
                  type="number"
                  required
                  value={montoInput}
                  onChange={e => setMontoInput(e.target.value)}
                  className="w-full border p-2 rounded text-gray-800 focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: 15000"
                />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white font-bold p-3 rounded hover:bg-red-700 transition">
                Cerrar Caja
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 text-gray-600 p-4 rounded-lg mb-6 border border-gray-200 text-center">
              <p className="font-bold text-lg">Caja Cerrada</p>
              <p className="text-sm">No hay un turno activo</p>
            </div>

            <form onSubmit={handleAbrirCaja} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial (Efectivo para vuelto)</label>
                <input
                  type="number"
                  required
                  value={montoInput}
                  onChange={e => setMontoInput(e.target.value)}
                  className="w-full border p-2 rounded text-gray-800 focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: 5000"
                />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white font-bold p-3 rounded hover:bg-green-700 transition">
                Abrir Caja
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}