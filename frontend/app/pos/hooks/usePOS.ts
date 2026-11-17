import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export interface Categoria { id: string; nombre: string; }
export interface Mesa { id: string; nombre: string; estado: string; }
export interface Cliente { id: string; nombre: string; }
export interface Modificador { id: string; nombre: string; precioExtra: number; }
export interface Producto { id: string; nombre: string; precio: number; stock: number; categoriaId?: string; }
export interface ItemCarrito extends Producto { cantidad: number; notas?: string; modificadoresIds?: string[]; }

export function usePOS() {
  const router = useRouter();
  const { user } = useAuth();
  
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
        setClienteActivoId(pedidoAbierto.clienteId || '');
        setCarrito(pedidoAbierto.detalles.map((det: any) => ({
          id: det.producto.id, nombre: det.producto.nombre, precio: Number(det.precioUnitario),
          cantidad: Number(det.cantidad), stock: 999, notas: det.notas,
          modificadoresIds: [] // Si viene de la BD no tenemos los IDs exactos, el backend recalculará el precio base
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
        agregarAlCarrito(producto, producto.precio, '', []);
      }
    } catch (error) {
      agregarAlCarrito(producto, producto.precio, '', []);
    }
  };

  // CORREGIDO: Agregamos modificadoresIds y evitamos la mutación de estado (StrictMode)
  const agregarAlCarrito = (producto: Producto, precioFinal: number, notas: string, modificadoresIds: string[] = []) => {
    setCarrito(prev => {
      const existeIndex = prev.findIndex(item => item.id === producto.id && item.notas === notas);
      if (existeIndex >= 0) {
        return prev.map((item, idx) => 
          idx === existeIndex ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, precio: precioFinal, cantidad: 1, notas, modificadoresIds }];
    });
  };

  const quitarDelCarrito = (index: number) => {
    setCarrito(prev => prev.filter((_, i) => i !== index));
  };

  const cambiarCantidad = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return quitarDelCarrito(index);
    setCarrito(prev => prev.map((item, i) => i === index ? { ...item, cantidad: nuevaCantidad } : item));
  };

  const confirmarModificadores = () => {
    if (!productoModificando) return;
    const extra = modificadoresSeleccionados.reduce((acc, mod) => acc + Number(mod.precioExtra), 0);
    const ids = modificadoresSeleccionados.map(m => m.id);
    agregarAlCarrito(
      productoModificando, 
      Number(productoModificando.precio) + extra, 
      modificadoresSeleccionados.map(m => m.nombre).join(', '),
      ids
    );
    setProductoModificando(null);
  };

  const liberarMesaVacia = async () => {
    try {
      if (pedidoActualId) {
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
      mesaId: mesaActivaId || null, // CORREGIDO: Enviar mesa
      clienteId: clienteActivoId || null, // CORREGIDO: Enviar cliente
      ...datosPago,
      detalles: carrito.map(item => ({ 
        productoId: item.id, 
        cantidad: item.cantidad, 
        notas: item.notas,
        modificadoresIds: item.modificadoresIds || [] // CORREGIDO: Enviar modificadores
      }))
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
      detalles: carrito.map(item => ({ 
        productoId: item.id, 
        cantidad: item.cantidad, 
        notas: item.notas,
        modificadoresIds: item.modificadoresIds || []
      }))
    };
    try {
      await fetcher('/pedidos', { method: 'POST', body: JSON.stringify(pedidoData) });
      alert('Mesa guardada correctamente');
      setCarrito([]); setMesaActivaId(''); setClienteActivoId(''); setPedidoActualId(null);
      
      const urlMesas = sucursalActiva ? `/mesas?sucursalId=${sucursalActiva}` : '/mesas';
      const [prods, mess] = await Promise.all([ fetcher('/productos'), fetcher(urlMesas) ]);
      setProductos(prods || []);
      setMesas(mess || []);
    } catch (error: any) { alert(`Error: ${error.message}`); }
  };

  return {
    state: { productos, categorias, mesas, clientes, carrito, loading, mesaActivaId, clienteActivoId, categoriaActiva, productoModificando, modificadoresDisponibles, modificadoresSeleccionados, modalPagoAbierto, ventaExitosa },
    actions: { setClienteActivoId, setCategoriaActiva, setModalPagoAbierto, setVentaExitosa, setProductoModificando, setModificadoresSeleccionados, handleMesaChange, handleProductoClick, confirmarModificadores, liberarMesaVacia, procesarPago, guardarMesa, quitarDelCarrito, cambiarCantidad }
  };
}