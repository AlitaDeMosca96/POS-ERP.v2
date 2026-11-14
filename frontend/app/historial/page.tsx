'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PedidoDetalle {
  id: string;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
  producto: { nombre: string };
}

interface Pedido {
  id: string;
  total: number;
  createdAt: string;
  metodoPago: string;
  tipoFactura?: string;
  cuitFactura?: string;
  razonSocialFactura?: string;
  mesa?: { nombre: string };
  cliente?: { nombre: string };
  detalles: PedidoDetalle[];
}

export default function HistorialPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('TODOS');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    fetch('/api/pedidos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router, token]);

  if (loading) return <div className="p-10 text-center">Cargando historial...</div>;

  // Aplicamos los filtros
  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtro por método de pago
    if (filtroMetodoPago !== 'TODOS' && pedido.metodoPago !== filtroMetodoPago) {
      return false;
    }

    // Filtro por texto (busca en cliente, mesa, cuit o productos)
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      
      const coincideCliente = pedido.cliente?.nombre.toLowerCase().includes(busquedaLower);
      const coincideMesa = pedido.mesa?.nombre.toLowerCase().includes(busquedaLower);
      const coincideCuit = pedido.cuitFactura?.includes(busqueda);
      const coincideRazon = pedido.razonSocialFactura?.toLowerCase().includes(busquedaLower);
      const coincideProducto = pedido.detalles.some(d => d.producto?.nombre.toLowerCase().includes(busquedaLower));

      if (!coincideCliente && !coincideMesa && !coincideCuit && !coincideRazon && !coincideProducto) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Historial de Ventas</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
            Volver al Dashboard
          </button>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Buscar por cliente, producto, CUIT..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full border p-2 rounded text-gray-800"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Pago:</label>
            <select
              value={filtroMetodoPago}
              onChange={e => setFiltroMetodoPago(e.target.value)}
              className="border p-2 rounded text-gray-800"
            >
              <option value="TODOS">Todos los medios</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia / QR</option>
            </select>
          </div>

          <button 
            onClick={() => { setBusqueda(''); setFiltroMetodoPago('TODOS'); }}
            className="text-sm text-gray-500 hover:text-gray-800 underline ml-auto"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Fecha / Hora</th>
                <th className="p-4 font-semibold">Comprobante</th>
                <th className="p-4 font-semibold">Cliente / Origen</th>
                <th className="p-4 font-semibold">Detalle</th>
                <th className="p-4 font-semibold">Pago</th>
                <th className="p-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => (
                <tr key={pedido.id} className="border-b hover:bg-gray-50 text-gray-800 text-sm">
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {new Date(pedido.createdAt).toLocaleString('es-AR')}
                  </td>
                  
                  {/* COLUMNA FACTURA */}
                  <td className="p-4">
                    <div className="font-bold">{pedido.tipoFactura ? pedido.tipoFactura.replace('_', ' ') : 'FACTURA B'}</div>
                    {pedido.cuitFactura && <div className="text-xs text-gray-500">CUIT: {pedido.cuitFactura}</div>}
                  </td>

                  {/* COLUMNA CLIENTE Y MESA */}
                  <td className="p-4">
                    <div className="font-medium">{pedido.cliente ? pedido.cliente.nombre : 'Consumidor Final'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {pedido.mesa ? `Mesa: ${pedido.mesa.nombre}` : 'Mostrador'}
                    </div>
                  </td>

                  <td className="p-4">
                    <ul className="list-disc list-inside text-xs text-gray-600">
                      {pedido.detalles.map((det, index) => (
                        <li key={index} className="mb-1">
                          {det.cantidad}x {det.producto?.nombre || 'Producto Eliminado'}
                          {det.notas && <span className="text-blue-500 ml-1">({det.notas})</span>}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      pedido.metodoPago === 'EFECTIVO' ? 'bg-green-100 text-green-700' : 
                      pedido.metodoPago === 'TARJETA' ? 'bg-blue-100 text-blue-700' : 
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {pedido.metodoPago}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-green-600">
                    ${Number(pedido.total).toFixed(2)}
                  </td>
                </tr>
              ))}
              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No se encontraron ventas que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}