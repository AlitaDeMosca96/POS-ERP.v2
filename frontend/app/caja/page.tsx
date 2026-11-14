'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetcher } from '../../lib/api';

interface Caja { id: string; saldoInicial: number; estado: string; fechaApertura: string; }
interface Movimiento { id: string; tipo: string; monto: number; motivo: string; fecha: string; }
interface Resumen { caja: Caja; movimientos: Movimiento[]; ingresos: number; sangrias: number; totalVentasEfectivo: number; saldoEsperado: number; }

export default function CajaPage() {
  const router = useRouter();
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [montoApertura, setMontoApertura] = useState('');
  const [montoCierre, setMontoCierre] = useState('');
  const [movTipo, setMovTipo] = useState('SANGRIA');
  const [movMonto, setMovMonto] = useState('');
  const [movMotivo, setMovMotivo] = useState('');

  const sucursalActiva = typeof window !== 'undefined' ? localStorage.getItem('sucursalActiva') : '';

  useEffect(() => { verificarCaja(); }, []);

  const verificarCaja = async () => {
    try {
      const caja = await fetcher('/cajas/abierta');
      if (caja && caja.id) {
        cargarResumen(caja.id);
      } else {
        setResumen(null);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const cargarResumen = async (cajaId: string) => {
    try {
      const data = await fetcher(`/cajas/${cajaId}/resumen`);
      setResumen(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetcher('/cajas/apertura', {
        method: 'POST',
        body: JSON.stringify({ saldoInicial: Number(montoApertura), sucursalId: sucursalActiva || null })
      });
      toast.success('Caja abierta con éxito');
      setMontoApertura('');
      setLoading(true);
      verificarCaja();
    } catch (error: any) { toast.error(error.message || 'Error al abrir la caja'); }
  };

  const handleCerrarCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumen) return;

    const diferencia = Number(montoCierre) - resumen.saldoEsperado;
    let msj = '¿Estás seguro de cerrar la caja?';
    if (diferencia < 0) msj = `¡ATENCIÓN! Hay un FALTANTE de $${Math.abs(diferencia)}. ¿Cerrar igual?`;
    if (diferencia > 0) msj = `Hay un SOBRANTE de $${diferencia}. ¿Cerrar igual?`;

    if (!confirm(msj)) return;

    try {
      const res = await fetcher(`/cajas/${resumen.caja.id}/cierre`, {
        method: 'PATCH',
        body: JSON.stringify({ saldoFinal: Number(montoCierre) })
      });
      
      if (res && res.diferencia !== 0) {
        alert(`Caja cerrada con una diferencia de $${res.diferencia}`);
      } else {
        toast.success('Caja cerrada con éxito');
      }
      
      setMontoCierre('');
      setLoading(true);
      verificarCaja();
    } catch (error: any) { toast.error(error.message || 'Error al cerrar caja'); }
  };

  const handleRegistrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumen) return;
    try {
      await fetcher('/cajas/movimientos', {
        method: 'POST',
        body: JSON.stringify({ tipo: movTipo, monto: Number(movMonto), motivo: movMotivo, cajaId: resumen.caja.id })
      });
      setMovMonto(''); setMovMotivo('');
      cargarResumen(resumen.caja.id);
    } catch (error: any) { toast.error(error.message || 'Error al registrar movimiento'); }
  };

  if (loading) return <div className="p-10 text-center">Verificando estado de la caja...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Caja</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">Volver al Dashboard</button>
        </div>

        {!resumen ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="bg-gray-50 text-gray-600 p-4 rounded-lg mb-6 text-center border border-gray-200">
              <p className="font-bold text-lg">Caja Cerrada</p>
              <p className="text-sm">No hay un turno activo</p>
            </div>
            <form onSubmit={handleAbrirCaja} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial (Efectivo para vuelto)</label>
                <input type="number" required value={montoApertura} onChange={e => setMontoApertura(e.target.value)} className="w-full border p-3 rounded text-gray-800 focus:ring-2 focus:ring-green-500" placeholder="Ej: 5000" />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white font-bold p-3 rounded hover:bg-green-700 transition text-lg">Abrir Caja</button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-green-700 mb-4 border-b pb-2">Resumen del Turno</h2>
                <div className="space-y-2 text-gray-600">
                  <p className="flex justify-between"><span>Saldo Inicial:</span> <span className="font-bold">${resumen.caja.saldoInicial}</span></p>
                  <p className="flex justify-between text-green-600"><span>Ventas en Efectivo:</span> <span className="font-bold">+${resumen.totalVentasEfectivo.toFixed(2)}</span></p>
                  <p className="flex justify-between text-blue-600"><span>Ingresos Manuales:</span> <span className="font-bold">+${resumen.ingresos}</span></p>
                  <p className="flex justify-between text-red-600"><span>Sangrías:</span> <span className="font-bold">-${resumen.sangrias}</span></p>
                  <div className="border-t pt-2 mt-2">
                    <p className="flex justify-between text-xl font-bold text-gray-800"><span>En Caja:</span> <span>${resumen.saldoEsperado.toFixed(2)}</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Registrar Movimiento</h2>
                <form onSubmit={handleRegistrarMovimiento} className="space-y-3">
                  <select value={movTipo} onChange={e => setMovTipo(e.target.value)} className="w-full border p-2 rounded text-gray-800">
                    <option value="SANGRIA">Sangría (Retiro)</option>
                    <option value="INGRESO">Ingreso (Agregar Efectivo)</option>
                  </select>
                  <input type="number" placeholder="Monto" required value={movMonto} onChange={e => setMovMonto(e.target.value)} className="w-full border p-2 rounded text-gray-800" />
                  <input type="text" placeholder="Motivo (Ej: Pago proveedor)" required value={movMotivo} onChange={e => setMovMotivo(e.target.value)} className="w-full border p-2 rounded text-gray-800" />
                  <button type="submit" className="w-full bg-gray-800 text-white font-bold p-2 rounded hover:bg-gray-900">Guardar Movimiento</button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                <h2 className="text-lg font-bold text-red-700 mb-4">Cierre de Caja (Arqueo)</h2>
                <form onSubmit={handleCerrarCaja} className="space-y-3">
                  <label className="text-sm text-gray-600 block">Contá el efectivo físico y poné el total:</label>
                  <input type="number" required value={montoCierre} onChange={e => setMontoCierre(e.target.value)} className="w-full border p-2 rounded text-gray-800 focus:ring-2 focus:ring-red-500" placeholder="Monto contado" />
                  <button type="submit" className="w-full bg-red-600 text-white font-bold p-2 rounded hover:bg-red-700">Cerrar Caja</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Movimientos Manuales</h2>
                {resumen.movimientos.length === 0 ? <p className="text-gray-500 text-center mt-10">No hay sangrías ni ingresos registrados.</p> : (
                  <ul className="space-y-3">
                    {resumen.movimientos.map(mov => (
                      <li key={mov.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                        <div>
                          <p className={`font-bold ${mov.tipo === 'INGRESO' ? 'text-blue-600' : 'text-red-600'}`}>{mov.tipo === 'INGRESO' ? 'Ingreso' : 'Sangría'}</p>
                          <p className="text-sm text-gray-600">{mov.motivo}</p>
                          <p className="text-xs text-gray-400">{new Date(mov.fecha).toLocaleTimeString()}</p>
                        </div>
                        <span className={`text-xl font-bold ${mov.tipo === 'INGRESO' ? 'text-blue-600' : 'text-red-600'}`}>{mov.tipo === 'INGRESO' ? '+' : '-'}${mov.monto}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}