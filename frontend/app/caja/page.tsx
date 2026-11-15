'use client';

import { useEffect, useState } from 'react';
import { fetcher } from '../../lib/api';
import Link from 'next/link';

export default function CajaPage() {
  const [caja, setCaja] = useState<any>(null);
  const [montoInicial, setMontoInicial] = useState<number | string>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    verificarCaja();
  }, []);

  const verificarCaja = async () => {
    try {
      setLoading(true);
      setError('');
      // CORREGIDO: Usamos /cajas/actual en plural
      const data = await fetcher('/cajas/actual');
      setCaja(data);
    } catch (err: any) {
      console.error("Error al verificar caja:", err);
      if (err.message !== 'Sesión expirada') {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCaja = async () => {
    try {
      setError('');
      // CORREGIDO: Usamos /cajas/abrir en plural
      const nuevaCaja = await fetcher('/cajas/abrir', {
        method: 'POST',
        body: JSON.stringify({ montoInicial: Number(montoInicial) })
      });
      
      setCaja(nuevaCaja);
      alert('Caja abierta con éxito');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al abrir la caja');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando estado de la caja...</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Caja</h1>
        <Link href="/dashboard" className="text-blue-500 hover:underline">Volver al Dashboard</Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {!caja ? (
        <div className="bg-white p-6 rounded shadow border">
          <div className="text-center mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold">Caja Cerrada</h2>
            <p className="text-gray-500 text-sm">No hay un turno activo</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Monto Inicial (Efectivo para vuelto)</label>
            <input
              type="number"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              className="w-full border p-2 rounded focus:ring focus:ring-green-200"
              placeholder="0"
            />
          </div>

          <button
            onClick={handleAbrirCaja}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold"
          >
            Abrir Caja
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow border text-center">
          <h2 className="text-xl font-semibold text-green-600 mb-2">Caja Abierta</h2>
          <p className="text-gray-600">Turno iniciado correctamente.</p>
          <div className="mt-4">
            <button 
              onClick={() => alert('Acá iría la pantalla para cobrar o cerrar caja')}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Ir a Cobrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}