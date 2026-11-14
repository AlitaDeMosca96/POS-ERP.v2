'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TicketModal from '../../components/TicketModal';

interface Categoria { id: string; nombre: string; }
interface Mesa { id: string; nombre: string; estado: string; }
interface Cliente { id: string; nombre: string; }
interface Modificador { id: string; nombre: string; precioExtra: number; }
interface Producto { id: string; nombre: string; precio: number; stock: number; categoriaId?: string; }
interface ItemCarrito extends Producto { cantidad: number; notas?: string; }

export default function POSPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  const [mesaActivaId, setMesaActivaId] = useState<string>('');
  const [clienteActivoId, setClienteActivoId] = useState<string>('');
  const [pedidoActualId, setPedidoActualId] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('ALL');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);

  const [productoModificando, setProductoModificando] = useState<Producto | null>(null);
  const [modificadoresDisponibles, setModificadoresDisponibles] = useState<Modificador[]>([]);
  const [modificadoresSeleccionados, setModificadoresSeleccionados] = useState<Modificador[]>([]);

  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState<string>('');

  // --- DELIVERY ---
  const [esDelivery, setEsDelivery] = useState(false);
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [costoEnvio, setCostoEnvio] = useState('0');

  // --- FACTURACIÓN ---
  const [tipoFactura, setTipoFactura] = useState<'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C'>('FACTURA_B');
  const [cuitFactura, setCuitFactura] = useState('');
  const [razonSocialFactura, setRazonSocialFactura] = useState('');

  const [ventaExitosa, setVentaExitosa] = useState<any>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const sucursalActiva = typeof window !== 'undefined' ? localStorage.getItem('sucursalActiva') : '';

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    const cargarDatos = async () => {
      try {
        const urlMesas = sucursalActiva 
          ? `http://localhost:3000/mesas?sucursalId=${sucursalActiva}` 
          : 'http://localhost:3000/mesas';

        const [resProd, resCat, resMesas, resCli] = await Promise.all([
          fetch('http://localhost:3000/productos', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3000/categorias', { headers: { Authorization: `Bearer ${token}` } }),
          fetch(urlMesas, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3000/clientes', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProductos(await resProd.json());
        setCategorias(await resCat.json());
        setMesas(await resMesas.json());
        setClientes(await resCli.json());
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [router, token, sucursalActiva]);

  const handleMesaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaMesaId = e.target.value;
    setMesaActivaId(nuevaMesaId);
    setCarrito([]);
    setPedidoActualId(null);

    if (!nuevaMesaId) return;

    try {
      const res = await fetch(`http://localhost:3000/pedidos/mesa/${nuevaMesaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const texto = await res.text();
        if (texto) {
          const pedidoAbierto = JSON.parse(texto);
          if (pedidoAbierto && pedidoAbierto.id) {
            setPedidoActualId(pedidoAbierto.id);
            const itemsCarrito = pedidoAbierto.detalles.map((det: any) => ({
              id: det.producto.id,
              nombre: det.producto.nombre,
              precio: Number(det.precioUnitario),
              cantidad: Number(det.cantidad),
              stock: 999, 
              notas: det.notas
            }));
            setCarrito(itemsCarrito);
          }
        }
      }
    } catch (error) {
      console.error("Error al buscar pedido de mesa", error);
    }
  };

  const handleProductoClick = async (producto: Producto) => {
    try {
      const res = await fetch(`http://localhost:3000/modificadores/producto/${producto.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mods = await res.json();

      if (mods.length > 0) {
        setProductoModificando(producto);
        setModificadoresDisponibles(mods);
        setModificadoresSeleccionados([]);
      } else {
        agregarAlCarrito(producto, producto.precio, '');
      }
    } catch (error) {
      console.error(error);
      agregarAlCarrito(producto, producto.precio, '');
    }
  };

  const toggleModificador = (mod: Modificador) => {
    const existe = modificadoresSeleccionados.find(m => m.id === mod.id);
    if (existe) setModificadoresSeleccionados(modificadoresSeleccionados.filter(m => m.id !== mod.id));
    else setModificadoresSeleccionados([...modificadoresSeleccionados, mod]);
  };

  const confirmarModificadores = () => {
    if (!productoModificando) return;
    const precioExtraTotal = modificadoresSeleccionados.reduce((acc, mod) => acc + Number(mod.precioExtra), 0);
    const precioFinal = Number(productoModificando.precio) + precioExtraTotal;
    const notas = modificadoresSeleccionados.map(m => m.nombre).join(', ');
    agregarAlCarrito(productoModificando, precioFinal, notas);
    setProductoModificando(null);
  };

  const agregarAlCarrito = (producto: Producto, precioFinal: number, notas: string) => {
    setCarrito(prev => {
      const existeIndex = prev.findIndex(item => item.id === producto.id && item.notas === notas);
      if (existeIndex >= 0) {
        const nuevoCarrito = [...prev];
        nuevoCarrito[existeIndex].cantidad += 1;
        return nuevoCarrito;
      }
      return [...prev, { ...producto, precio: precioFinal, cantidad: 1, notas }];
    });
  };

  const calcularTotal = () => {
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    return subtotal + (esDelivery ? Number(costoEnvio) : 0);
  };

  const abrirModalCobro = () => {
    if (carrito.length === 0 && mesaActivaId) {
      liberarMesaVacia();
      return;
    }
    setMontoRecibido('');
    setMetodoPago('EFECTIVO');
    setEsDelivery(false);
    setDireccionEntrega('');
    setCostoEnvio('0');
    setTipoFactura('FACTURA_B'); // Default
    setCuitFactura('');
    setRazonSocialFactura('');
    setModalPagoAbierto(true);
  };

  const liberarMesaVacia = async () => {
    try {
      if (pedidoActualId) {
        await fetch(`http://localhost:3000/pedidos/${pedidoActualId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ estado: 'PAGADO' })
        });
      }
      await fetch(`http://localhost:3000/mesas/${mesaActivaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: 'LIBRE' })
      });
      alert('Mesa liberada correctamente');
      setMesaActivaId('');
      setPedidoActualId(null);
      
      const urlMesas = sucursalActiva ? `http://localhost:3000/mesas?sucursalId=${sucursalActiva}` : 'http://localhost:3000/mesas';
      const resMesas = await fetch(urlMesas, { headers: { Authorization: `Bearer ${token}` } });
      setMesas(await resMesas.json());
    } catch (error) {
      console.error(error);
    }
  };

  const confirmarPago = async () => {
    const total = calcularTotal();
    if (metodoPago === 'EFECTIVO' && Number(montoRecibido) < total) {
      alert('El monto recibido es menor al total a pagar.');
      return;
    }
    if (tipoFactura !== 'FACTURA_B' && !cuitFactura) {
      alert('Por favor, ingresá el CUIT para la Factura A o C.');
      return;
    }

    const pedidoData = {
      pedidoId: pedidoActualId,
      total: total,
      estado: 'PAGADO',
      metodoPago: metodoPago,
      mesaId: mesaActivaId || null,
      clienteId: clienteActivoId || null,
      sucursalId: sucursalActiva || null,
      direccionEntrega: esDelivery ? direccionEntrega : null,
      costoEnvio: esDelivery ? Number(costoEnvio) : 0,
      tipoFactura,
      cuitFactura: tipoFactura !== 'FACTURA_B' ? cuitFactura : null,
      razonSocialFactura: tipoFactura !== 'FACTURA_B' ? razonSocialFactura : null,
      detalles: carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        notas: item.notas
      }))
    };

    try {
      const res = await fetch('http://localhost:3000/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pedidoData)
      });

      if (res.ok) {
        const ventaData = await res.json();
        setVentaExitosa(ventaData);
        
        setCarrito([]);
        setMesaActivaId('');
        setClienteActivoId('');
        setPedidoActualId(null);
        setModalPagoAbierto(false);
        
        const urlMesas = sucursalActiva ? `http://localhost:3000/mesas?sucursalId=${sucursalActiva}` : 'http://localhost:3000/mesas';
        const [resProd, resMesas] = await Promise.all([
          fetch('http://localhost:3000/productos', { headers: { Authorization: `Bearer ${token}` } }),
          fetch(urlMesas, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProductos(await resProd.json());
        setMesas(await resMesas.json());
      } else {
        alert('Error al guardar el pedido');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGuardarMesa = async () => {
    const pedidoData = {
      pedidoId: pedidoActualId,
      total: calcularTotal(),
      estado: 'ABIERTO',
      mesaId: mesaActivaId || null,
      clienteId: clienteActivoId || null,
      sucursalId: sucursalActiva || null,
      detalles: carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        notas: item.notas
      }))
    };

    try {
      const res = await fetch('http://localhost:3000/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pedidoData)
      });

      if (res.ok) {
        alert('Mesa guardada/modificada correctamente');
        setCarrito([]);
        setMesaActivaId('');
        setClienteActivoId('');
        setPedidoActualId(null);
        
        const urlMesas = sucursalActiva ? `http://localhost:3000/mesas?sucursalId=${sucursalActiva}` : 'http://localhost:3000/mesas';
        const [resProd, resMesas] = await Promise.all([
          fetch('http://localhost:3000/productos', { headers: { Authorization: `Bearer ${token}` } }),
          fetch(urlMesas, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProductos(await resProd.json());
        setMesas(await resMesas.json());
      } else {
        alert('Error al guardar el pedido');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Cargando catálogo...</div>;

  const productosFiltrados = categoriaActiva === 'ALL' 
    ? productos 
    : productos.filter(p => p.categoriaId === categoriaActiva);

  const subtotalProductos = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const vuelto = Number(montoRecibido) - calcularTotal();

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-2/3 flex flex-col border-r border-gray-300">
        
        <div className="bg-white p-4 shadow-sm flex gap-2 overflow-x-auto no-print">
          <button
            onClick={() => setCategoriaActiva('ALL')}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${categoriaActiva === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${categoriaActiva === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1 no-print">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Punto de Venta</h1>
            <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
              Volver al Dashboard
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map(prod => (
              <button 
                key={prod.id}
                onClick={() => handleProductoClick(prod)}
                className="p-4 rounded-lg shadow transition border border-gray-200 flex flex-col justify-between h-32 bg-white hover:shadow-lg"
              >
                <div className="text-left w-full">
                  <span className="font-bold text-gray-800 text-lg block">{prod.nombre}</span>
                  <span className="text-sm text-gray-500">Stock: {prod.stock}</span>
                </div>
                <span className="text-green-600 font-bold self-end text-xl">${prod.precio}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-1/3 bg-white shadow-xl flex flex-col no-print">
        <div className="p-4 bg-gray-800 text-white flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Ticket Actual</h2>
          </div>
          
          <div className="flex gap-2">
            <select 
              value={mesaActivaId} 
              onChange={handleMesaChange}
              className="w-1/2 bg-gray-700 text-white p-1 rounded border border-gray-600 focus:outline-none text-sm"
            >
              <option value="">Mostrador</option>
              {mesas.map(m => (
                <option key={m.id} value={m.id}>{m.nombre} {m.estado === 'OCUPADA' ? '(Ocupada)' : ''}</option>
              ))}
            </select>

            <select 
              value={clienteActivoId} 
              onChange={e => setClienteActivoId(e.target.value)}
              className="w-1/2 bg-gray-700 text-white p-1 rounded border border-gray-600 focus:outline-none text-sm"
            >
              <option value="">Consumidor Final</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {carrito.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">No hay productos seleccionados</p>
          ) : (
            <ul className="space-y-3">
              {carrito.map((item, index) => (
                <li key={index} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{item.nombre}</p>
                    <p className="text-sm text-gray-500">{item.cantidad} x ${item.precio}</p>
                    {item.notas && <p className="text-xs text-blue-600 font-bold mt-1">({item.notas})</p>}
                  </div>
                  <span className="font-bold text-gray-700">${item.precio * item.cantidad}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between text-2xl font-bold mb-4 text-gray-800">
            <span>Total:</span>
            <span>${calcularTotal()}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="w-1/2 bg-yellow-500 text-white py-3 rounded-lg text-lg font-bold hover:bg-yellow-600 disabled:bg-gray-300"
              disabled={carrito.length === 0} 
              onClick={handleGuardarMesa}
            >
              Guardar Mesa
            </button>
            <button 
              className="w-1/2 bg-green-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-green-700 disabled:bg-gray-300"
              disabled={carrito.length === 0 && !mesaActivaId}
              onClick={abrirModalCobro}
            >
              {carrito.length === 0 && mesaActivaId ? 'Liberar Mesa' : 'Cobrar'}
            </button>
          </div>
        </div>
      </div>

      {productoModificando && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="text-xl font-bold">Opciones para: {productoModificando.nombre}</h3>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {modificadoresDisponibles.map(mod => (
                <label key={mod.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={modificadoresSeleccionados.some(m => m.id === mod.id)}
                      onChange={() => toggleModificador(mod)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="font-medium text-gray-800">{mod.nombre}</span>
                  </div>
                  <span className="text-green-600 font-bold">
                    {Number(mod.precioExtra) > 0 ? `+ $${mod.precioExtra}` : 'Gratis'}
                  </span>
                </label>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t flex gap-3">
              <button onClick={() => setProductoModificando(null)} className="w-1/2 bg-gray-300 text-gray-800 font-bold py-2 rounded hover:bg-gray-400">Cancelar</button>
              <button onClick={confirmarModificadores} className="w-1/2 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Agregar al Ticket</button>
            </div>
          </div>
        </div>
      )}

      {modalPagoAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-green-600 text-white p-4 text-center">
              <h3 className="text-2xl font-bold">Cobrar Ticket</h3>
              <p className="text-3xl font-light mt-2">Total: ${calcularTotal()}</p>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* FACTURACIÓN */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <label className="block text-sm font-bold text-gray-700 mb-2">Comprobante Fiscal</label>
                <select 
                  value={tipoFactura} 
                  onChange={e => setTipoFactura(e.target.value as any)}
                  className="w-full border p-2 rounded text-gray-800 font-medium mb-3"
                >
                  <option value="FACTURA_B">Factura B (Consumidor Final)</option>
                  <option value="FACTURA_A">Factura A (Responsable Inscripto)</option>
                  <option value="FACTURA_C">Factura C (Monotributista)</option>
                </select>

                {tipoFactura !== 'FACTURA_B' && (
                  <div className="space-y-3 mt-3">
                    <input 
                      type="text" 
                      placeholder="CUIT (Ej: 20123456789)" 
                      value={cuitFactura}
                      onChange={e => setCuitFactura(e.target.value)}
                      className="w-full border p-2 rounded text-gray-800"
                    />
                    <input 
                      type="text" 
                      placeholder="Razón Social" 
                      value={razonSocialFactura}
                      onChange={e => setRazonSocialFactura(e.target.value)}
                      className="w-full border p-2 rounded text-gray-800"
                    />
                  </div>
                )}
              </div>

              {/* DELIVERY */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={esDelivery}
                    onChange={(e) => setEsDelivery(e.target.checked)}
                    className="w-6 h-6 text-orange-600 rounded"
                  />
                  <span className="font-bold text-orange-800 text-lg">Es Delivery</span>
                </label>
                
                {esDelivery && (
                  <div className="mt-4 space-y-3">
                    <input 
                      type="text" 
                      value={direccionEntrega} 
                      onChange={e => setDireccionEntrega(e.target.value)} 
                      className="w-full border p-2 rounded text-gray-800" 
                      placeholder="Dirección de entrega..." 
                      required={esDelivery}
                    />
                    <input 
                      type="number" 
                      value={costoEnvio} 
                      onChange={e => setCostoEnvio(e.target.value)} 
                      className="w-full border p-2 rounded text-gray-800" 
                      placeholder="Costo de envío"
                    />
                  </div>
                )}
              </div>

              {/* PAGO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setMetodoPago('EFECTIVO')} className={`py-2 rounded border font-bold ${metodoPago === 'EFECTIVO' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Efectivo</button>
                  <button onClick={() => setMetodoPago('TARJETA')} className={`py-2 rounded border font-bold ${metodoPago === 'TARJETA' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Tarjeta</button>
                  <button onClick={() => setMetodoPago('TRANSFERENCIA')} className={`py-2 rounded border font-bold ${metodoPago === 'TRANSFERENCIA' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>QR / Transf.</button>
                </div>
              </div>

              {metodoPago === 'EFECTIVO' && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Recibido</label>
                    <input type="number" value={montoRecibido} onChange={e => setMontoRecibido(e.target.value)} className="w-full text-2xl border p-3 rounded text-gray-800 focus:ring-2 focus:ring-green-500 font-bold" placeholder="0.00" autoFocus />
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-600">Vuelto:</span>
                    <span className={vuelto >= 0 ? 'text-green-600' : 'text-red-600'}>${vuelto > 0 ? vuelto.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex gap-3">
              <button onClick={() => setModalPagoAbierto(false)} className="w-1/2 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300">Cancelar</button>
              <button 
                onClick={confirmarPago} 
                disabled={(metodoPago === 'EFECTIVO' && Number(montoRecibido) < calcularTotal()) || (esDelivery && !direccionEntrega)} 
                className="w-1/2 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      <TicketModal isOpen={!!ventaExitosa} onClose={() => setVentaExitosa(null)} venta={ventaExitosa} />
    </div>
  );
}