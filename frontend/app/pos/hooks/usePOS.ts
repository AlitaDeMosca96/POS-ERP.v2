import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface Categoria { id: string; nombre: string; }
export interface Mesa { id: string; nombre: string; estado: string; }
export interface Cliente { id: string; nombre: string; }
export interface Modificador { id: string; nombre: string; precioExtra: number; }
export interface Producto { id: string; nombre: string; precio: number; stock: number; categoriaId?: string; }
export interface ItemCarrito extends Producto { cantidad: number; notas?: string; }

export function usePOS() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const sucursalActiva = typeof window !== 'undefined' ? localStorage.getItem('sucursalActiva') : '';

  // Estados Generales
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Selección
  const [mesaActivaId, setMesaActivaId] = useState<string>('');
  const [clienteActivoId, setClienteActivoId] = useState<string>('');
  const [pedidoActualId, setPedidoActualId] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('ALL');

  // Estados de Modales
  const [productoModificando, setProductoModificando] = useState<Producto | null>(null);
  const [modificadoresDisponibles, setModificadoresDisponibles] = useState<Modificador[]>([]);
  const [modificadoresSeleccionados, setModificadoresSeleccionados] = useState<Modificador[]>([]);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState<any>(null);

  useEffect(() => {
    if (!token) { router.push('/'); return; }

    const cargarDatos = async () => {
      try {
        const urlMesas = sucursalActiva ? `${apiUrl}/mesas?sucursalId=${sucursalActiva}` : `${apiUrl}/mesas`;
        const [resProd, resCat, resMesas, resCli] = await Promise.all([
          fetch(`${apiUrl}/productos`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/categorias`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(urlMesas, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/clientes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProductos(await resProd.json());
        setCategorias(await resCat.json());
        setMesas(await resMesas.json());
        setClientes(await resCli.json());
        setLoading(false);
      } catch (error) { console.error(error); setLoading(false); }
    };
    cargarDatos();
  }, [router, token, sucursalActiva, apiUrl]);

  const handleMesaChange = async (nuevaMesaId: string) => {
    setMesaActivaId(nuevaMesaId);
    setCarrito([]);
    setPedidoActualId(null);
    if (!nuevaMesaId) return;

    try {
      const res = await fetch(`${apiUrl}/pedidos/mesa/${nuevaMesaId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const texto = await res.text();
        if (texto) {
          const pedidoAbierto = JSON.parse(texto);
          if (pedidoAbierto && pedidoAbierto.id) {
            setPedidoActualId(pedidoAbierto.id);
            setCarrito(pedidoAbierto.detalles.map((det: any) => ({
              id: det.producto.id, nombre: det.producto.nombre, precio: Number(det.precioUnitario),
              cantidad: Number(det.cantidad), stock: 999, notas: det.notas
            })));
          }
        }
      }
    } catch (error) { console.error(error); }
  };

  const handleProductoClick = async (producto: Producto) => {
    try {
      const res = await fetch(`${apiUrl}/modificadores/producto/${producto.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const mods = await res.json();
      if (mods.length > 0) {
        setProductoModificando(producto);
        setModificadoresDisponibles(mods);
        setModificadoresSeleccionados([]);
      } else {
        agregarAlCarrito(producto, producto.precio, '');
      }
    } catch (error) { agregarAlCarrito(producto, producto.precio, ''); }
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

  const confirmarModificadores = () => {
    if (!productoModificando) return;
    const extra = modificadoresSeleccionados.reduce((acc, mod) => acc + Number(mod.precioExtra), 0);
    agregarAlCarrito(productoModificando, Number(productoModificando.precio) + extra, modificadoresSeleccionados.map(m => m.nombre).join(', '));
    setProductoModificando(null);
  };

  const liberarMesaVacia = async () => {
    try {
      if (pedidoActualId) {
        await fetch(`${apiUrl}/pedidos/${pedidoActualId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ estado: 'PAGADO' }) });
      }
      await fetch(`${apiUrl}/mesas/${mesaActivaId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ estado: 'LIBRE' }) });
      setMesaActivaId(''); setPedidoActualId(null);
      const urlMesas = sucursalActiva ? `${apiUrl}/mesas?sucursalId=${sucursalActiva}` : `${apiUrl}/mesas`;
      setMesas(await (await fetch(urlMesas, { headers: { Authorization: `Bearer ${token}` } })).json());
    } catch (error) { console.error(error); }
  };

  const procesarPago = async (datosPago: any) => {
    const pedidoData = {
      pedidoId: pedidoActualId,
      estado: 'PAGADO',
      sucursalId: sucursalActiva || null,
      ...datosPago,
      detalles: carrito.map(item => ({ productoId: item.id, cantidad: item.cantidad, notas: item.notas }))
    };

    try {
      const res = await fetch(`${apiUrl}/pedidos`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(pedidoData) });
      if (res.ok) {
        setVentaExitosa(await res.json());
        setCarrito([]); setMesaActivaId(''); setClienteActivoId(''); setPedidoActualId(null); setModalPagoAbierto(false);
        const urlMesas = sucursalActiva ? `${apiUrl}/mesas?sucursalId=${sucursalActiva}` : `${apiUrl}/mesas`;
        const [resProd, resMesas] = await Promise.all([
          fetch(`${apiUrl}/productos`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(urlMesas, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProductos(await resProd.json());
        setMesas(await resMesas.json());
      } else { alert('Error al procesar pago'); }
    } catch (error) { console.error(error); }
  };

  const guardarMesa = async () => {
    const pedidoData = {
      pedidoId: pedidoActualId,
      estado: 'ABIERTO',
      mesaId: mesaActivaId || null,
      clienteId: clienteActivoId || null,
      sucursalId: sucursalActiva || null,
      detalles: carrito.map(item => ({ productoId: item.id, cantidad: item.cantidad, notas: item.notas }))
    };
    try {
      const res = await fetch(`${apiUrl}/pedidos`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(pedidoData) });
      if (res.ok) {
        alert('Mesa guardada correctamente');
        setCarrito([]); setMesaActivaId(''); setClienteActivoId(''); setPedidoActualId(null);
        const urlMesas = sucursalActiva ? `${apiUrl}/mesas?sucursalId=${sucursalActiva}` : `${apiUrl}/mesas`;
        const [resProd, resMesas] = await Promise.all([
          fetch(`${apiUrl}/productos`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(urlMesas, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProductos(await resProd.json());
        setMesas(await resMesas.json());
      }
    } catch (error) { console.error(error); }
  };

  return {
    state: { productos, categorias, mesas, clientes, carrito, loading, mesaActivaId, clienteActivoId, categoriaActiva, productoModificando, modificadoresDisponibles, modificadoresSeleccionados, modalPagoAbierto, ventaExitosa },
    actions: { setClienteActivoId, setCategoriaActiva, setModalPagoAbierto, setVentaExitosa, setProductoModificando, setModificadoresSeleccionados, handleMesaChange, handleProductoClick, confirmarModificadores, liberarMesaVacia, procesarPago, guardarMesa }
  };
}