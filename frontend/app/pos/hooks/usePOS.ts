import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export interface Categoria { id: string; nombre: string; }
export interface Mesa { id: string; nombre: string; estado: string; }
export interface Cliente { id: string; nombre: string; }
export interface Modificador { id: string; nombre: string; precioExtra: number; }
export interface Producto { id: string; nombre: string; precio: number; stock: number; categoriaId?: string; }
export interface ItemCarrito extends Producto { cantidad: number; notas?: string; }

export function usePOS() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Usamos la sucursal del usuario autenticado (viene del backend), no del localStorage
  const sucursalActiva = user?.sucursalId || '';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);

  const [mesaActivaId, setMesaActivaId] = useState<string>('');
  const [clienteActivoId, setClienteActivoId] = useState<string>('');
  const [pedidoActualId, setPedidoActualId] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('ALL');

  const [productoModificando, setProductoModificando] = useState<Producto | null>(null);
  const [modificadoresDisponibles, setModificadoresDisponibles] = useState<Modificador[]>([]);
  const [modificadoresSeleccionados, setModificadoresSeleccionados] = useState<Modificador[]>([]);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState<any>(null);

  useEffect(() => {
    // Si no hay usuario, no cargar nada (el AuthContext redirige)
    if (!user) return;

    const cargarDatos = async () => {
      try {
        const urlMesas = sucursalActiva ? `/mesas?sucursalId=${sucursalActiva}` : '/mesas';
        const [prods, cats, mess, clis] = await Promise.all([
          fetcher('/productos'),
          fetcher('/categorias'),
          fetcher(urlMesas),
          fetcher('/clientes')
        ]);
        setProductos(prods || []);
        setCategorias(cats || []);
        setMesas(mess || []);
        setClientes(clis || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [sucursalActiva, user]);

  const handleMesaChange = async (nuevaMesaId: string) => {
    setMesaActivaId(nuevaMesaId);
    setCarrito([]);
    setPedidoActualId(null);
    if (!nuevaMesaId) return;

    try {
      const pedidoAbierto = await fetcher(`/pedidos/mesa/${nuevaMesaId}`);
      if (pedidoAbierto && pedidoAbierto.id) {
        setPedidoActualId(pedidoAbierto.id);
        setCarrito(pedidoAbierto.detalles.map((det: any) => ({
          id: det.producto.id, nombre: det.producto.nombre, precio: Number(det.precioUnitario),
          cantidad: Number(det.cantidad), stock: 999, notas: det.notas
        })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleProductoClick = async (producto: Producto) => {
    try {
      const mods = await fetcher(`/modificadores/producto/${producto.id}`);
      if (mods && mods.length > 0) {
        setProductoModificando(producto);
        setModificadoresDisponibles(mods);
        setModificadoresSeleccionados([]);
      } else {
        agregarAlCarrito(producto, producto.precio, '');
      }
    } catch (error) {
      agregarAlCarrito(producto, producto.precio, '');
    }
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
        // CORREGIDO: Usamos anular, no PATCH estado. El DTO restringido ya no acepta estado.
        await fetcher(`/pedidos/${pedidoActualId}/anular`, { 
          method: 'PATCH', 
          body: JSON.stringify({ motivo: 'Mesa liberada sin consumo' }) 
        });
      }
      await fetcher(`/mesas/${mesaActivaId}`, { method: 'PATCH', body: JSON.stringify({ estado: 'LIBRE' }) });
      setMesaActivaId(''); setPedidoActualId(null);
      
      const urlMesas = sucursalActiva ? `/mesas?sucursalId=${sucursalActiva}` : '/mesas';
      setMesas(await fetcher(urlMesas) || []);
    } catch (error) { 
      console.error(error); 
    }
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
      const ventaData = await fetcher('/pedidos', { method: 'POST', body: JSON.stringify(pedidoData) });
      setVentaExitosa(ventaData);
      setCarrito([]); setMesaActivaId(''); setClienteActivoId(''); setPedidoActualId(null); setModalPagoAbierto(false);
      
      const urlMesas = sucursalActiva ? `/mesas?sucursalId=${sucursalActiva}` : '/mesas';
      const [prods, mess] = await Promise.all([ fetcher('/productos'), fetcher(urlMesas) ]);
      setProductos(prods || []);
      setMesas(mess || []);
    } catch (error: any) { alert(`Error: ${error.message}`); }
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
      await fetcher('/pedidos', { method: 'POST', body: JSON.stringify(pedidoData) });
      alert('Mesa guardada correctamente');
      setCarrito([]); setMesaActivaId(''); setClienteActivoId(''); setPedidoActualId(null);
      
      const urlMesas = sucursalActiva ? `/mesas?sucursalId=${sucursalActiva}` : '/mesas';
      const [prods, mess] = await Promise.all([ fetcher('/productos'), fetcher(urlMesas) ]);
      setProductos(prods || []);
      setMesas(mess || []);
    } catch (error) { console.error(error); }
  };

  return {
    state: { productos, categorias, mesas, clientes, carrito, loading, mesaActivaId, clienteActivoId, categoriaActiva, productoModificando, modificadoresDisponibles, modificadoresSeleccionados, modalPagoAbierto, ventaExitosa },
    actions: { setClienteActivoId, setCategoriaActiva, setModalPagoAbierto, setVentaExitosa, setProductoModificando, setModificadoresSeleccionados, handleMesaChange, handleProductoClick, confirmarModificadores, liberarMesaVacia, procesarPago, guardarMesa }
  };
}