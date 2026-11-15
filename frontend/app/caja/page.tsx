'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { fetcher } from '../../lib/api';

interface Caja {
  id: string;
  estado: string;
  montoInicial: number;
}

interface Resumen {
  montoInicial: number;
  ventasEfectivo: number;
  ingresos: number;
  egresos: number;
  saldoEsperado: number;
}

export default function CajaPage() {
  const router = useRouter();
  const [caja, setCaja] = useState<Caja | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para apertura
  const [montoInicial, setMontoInicial] = useState<string>('0');

  // Estados para movimientos
  const [tipoMovimiento, setTipoMovimiento] = useState<'INGRESO' | 'EGRESO'>('INGRESO');
  const [montoMovimiento, setMontoMovimiento] = useState('');
  const [motivoMovimiento, setMotivoMovimiento] = useState('');

  // Estado para cierre
  const [saldoFinal, setSaldoFinal] = useState('');

  const verificarCaja = async () => {
    try {
      setLoading(true);
      const data = await fetcher('/cajas/actual');
      setCaja(data);
      
      if (data) {
        const res = await fetcher('/cajas/resumen');
        setResumen(res);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'Sesión expirada') {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verificarCaja();
  }, []);

  const handleAbrirCaja = async () => {
    try {
      setError('');
      const nuevaCaja = await fetcher('/cajas/abrir', {
        method: 'POST',
        body: JSON.stringify({ montoInicial: Number(montoInicial) })
      });
      setCaja(nuevaCaja);
      toast.success('Caja abierta con éxito');
      verificarCaja(); // Recargar resumen
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al abrir la caja';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleRegistrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await fetcher('/cajas/movimientos', {
        method: 'POST',
        body: JSON.stringify({
          tipo: tipoMovimiento,
          monto: Number(montoMovimiento),
          motivo: motivoMovimiento
        })
      });
      toast.success(`Movimiento de ${tipoMovimiento.toLowerCase()} registrado`);
      setMontoMovimiento('');
      setMotivoMovimiento('');
      verificarCaja(); // Actualizar resumen
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar movimiento';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleCerrarCaja = async () => {
    if (!confirm('¿Estás seguro de cerrar la caja? No podrás registrar más ventas hasta abrir una nueva.')) return;
    try {
      setError('');
      await fetcher('/cajas/cerrar', {
        method: 'PATCH',
        body: JSON.stringify({ saldoFinal: Number(saldoFinal) })
      });
      toast.success('Caja cerrada correctamente');
      setCaja(null);
      setResumen(null);
      setSaldoFinal('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cerrar la caja';
      setError(msg);
      toast.error(msg);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando estado de la caja...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Caja</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Volver al Dashboard</Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {!caja ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
            <div className="text-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">Caja Cerrada</h2>
              <p className="text-gray-500 text-sm">No hay un turno activo</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Monto Inicial (Efectivo para vuelto)</label>
              <input
                type="number"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                className="w-full border p-2 rounded focus:ring focus:ring-green-200 text-gray-800"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panel de Resumen */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Resumen del Turno</h2>
              
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Monto Inicial:</span>
                  <span className="font-semibold">${resumen?.montoInicial || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ventas en Efectivo:</span>
                  <span className="font-semibold text-green-600">+${resumen?.ventasEfectivo || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingresos Extra:</span>
                  <span className="font-semibold text-green-600">+${resumen?.ingresos || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Egresos / Sangrías:</span>
                  <span className="font-semibold text-red-600">-${resumen?.egresos || 0}</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-lg font-bold text-blue-700">
                  <span>Efectivo Esperado:</span>
                  <span>${resumen?.saldoEsperado || 0}</span>
                </div>
              </div>

              <div className="mt-8 border-t pt-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Cerrar Caja</h3>
                <label className="block text-sm font-medium mb-2 text-gray-700">Conteo Real de Efectivo</label>
                <input
                  type="number"
                  value={saldoFinal}
                  onChange={(e) => setSaldoFinal(e.target.value)}
                  className="w-full border p-2 rounded focus:ring focus:ring-red-200 text-gray-800 mb-3"
                  placeholder="Ingrese el monto contado"
                />
                <button
                  onClick={handleCerrarCaja}
                  disabled={!saldoFinal}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 font-bold disabled:bg-gray-300"
                >
                  Confirmar Cierre de Caja
                </button>
              </div>
            </div>

            {/* Panel de Movimientos */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Registrar Movimiento</h2>
              <form onSubmit={handleRegistrarMovimiento} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Tipo</label>
                  <select
                    value={tipoMovimiento}
                    onChange={(e) => setTipoMovimiento(e.target.value as 'INGRESO' | 'EGRESO')}
                    className="w-full border p-2 rounded text-gray-800"
                  >
                    <option value="INGRESO">Ingreso Extra</option>
                    <option value="EGRESO">Egreso / Retiro (Sangría)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Monto</label>
                  <input
                    type="number"
                    required
                    value={montoMovimiento}
                    onChange={(e) => setMontoMovimiento(e.target.value)}
                    className="w-full border p-2 rounded text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Motivo</label>
                  <input
                    type="text"
                    required
                    value={motivoMovimiento}
                    onChange={(e) => setMotivoMovimiento(e.target.value)}
                    className="w-full border p-2 rounded text-gray-800"
                    placeholder="Ej: Pago a proveedor, cambio de billetes..."
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-2 rounded font-bold text-white ${tipoMovimiento === 'INGRESO' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  Registrar {tipoMovimiento === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}