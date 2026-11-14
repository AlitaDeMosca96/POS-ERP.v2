'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Categoria { id: string; nombre: string; }
interface Producto { id: string; nombre: string; precio: number; categoriaId?: string; }
interface ItemCarrito extends Producto { cantidad: number; }

export default function KioscoPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('ALL');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoExitoso, setPedidoExitoso] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    const cargarDatos = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch(`${apiUrl}/productos`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/categorias`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProductos(await resProd.json());
        setCategorias(await resCat.json());
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [router, token, apiUrl]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (productoId: string) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === productoId);
      if (existe && existe.cantidad > 1) {
        return prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item);
      }
      return prev.filter(item => item.id !== productoId);
    });
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const confirmarPedido = async () => {
    if (carrito.length === 0) return;

    const pedidoData = {
      estado: 'ABIERTO', // <-- PENDIENTE DE PAGO
      metodoPago: 'PENDIENTE', // <-- NO ASUME TARJETA
      mesaId: null,
      detalles: carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad
      }))
    };

    try {
      const res = await fetch(`${apiUrl}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pedidoData)
      });

      if (res.ok) {
        const ventaData = await res.json();
        setPedidoExitoso(ventaData.id.slice(0, 4).toUpperCase());
        setCarrito([]);
        setTimeout(() => setPedidoExitoso(null), 8000);
      } else {
        alert('Error al procesar el pedido');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-3xl font-bold">Cargando menú...</div>;

  if (pedidoExitoso) {
    return (
      <div className="min-h-screen bg-yellow-500 flex flex-col items-center justify-center text-white p-8">
        <svg className="w-32 h-32 mb-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 className="text-5xl font-bold mb-4">¡Pedido Registrado!</h1>
        <p className="text-2xl mb-8">Por favor, pasá por caja a abonar.</p>
        <div className="bg-white text-gray-900 px-12 py-6 rounded-2xl shadow-2xl">
          <p className="text-xl text-center font-medium mb-2">TU NÚMERO DE ORDEN</p>
          <p className="text-8xl font-black text-center tracking-widest">{pedidoExitoso}</p>
        </div>
      </div>
    );
  }

  const productosFiltrados = categoriaActiva === 'ALL' ? productos : productos.filter(p => p.categoriaId === categoriaActiva);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="w-2/3 flex flex-col">
        <div className="bg-white p-6 shadow-sm flex justify-between items-center z-10">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Bienvenido</h1>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-gray-700">Salir</button>
        </div>

        <div className="p-6 pb-2 flex gap-3 overflow-x-auto bg-gray-50">
          <button onClick={() => setCategoriaActiva('ALL')} className={`px-6 py-3 rounded-xl font-bold text-lg whitespace-nowrap transition ${categoriaActiva === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-100'}`}>Ver Todo</button>
          {categorias.map(cat => (
            <button key={cat.id} onClick={() => setCategoriaActiva(cat.id)} className={`px-6 py-3 rounded-xl font-bold text-lg whitespace-nowrap transition ${categoriaActiva === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-100'}`}>{cat.nombre}</button>
          ))}
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map(prod => (
              <button key={prod.id} onClick={() => agregarAlCarrito(prod)} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition border-2 border-transparent hover:border-blue-500 flex flex-col justify-between h-48 text-left group">
                <span className="font-bold text-gray-800 text-2xl leading-tight group-hover:text-blue-600 transition">{prod.nombre}</span>
                <span className="text-green-600 font-black text-3xl mt-4">${prod.precio}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-1/3 bg-white shadow-2xl flex flex-col z-20 border-l border-gray-200">
        <div className="p-6 bg-gray-800 text-white">
          <h2 className="text-2xl font-bold">Tu Pedido</h2>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <p className="text-xl">El carrito está vacío</p>
            </div>
          ) : (
            carrito.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">{item.nombre}</p>
                  <p className="text-gray-500 font-medium">${item.precio} c/u</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => quitarDelCarrito(item.id)} className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-xl flex items-center justify-center hover:bg-red-200 transition">-</button>
                  <span className="font-bold text-xl w-6 text-center">{item.cantidad}</span>
                  <button onClick={() => agregarAlCarrito(item)} className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-xl flex items-center justify-center hover:bg-blue-200 transition">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between text-3xl font-black mb-6 text-gray-800">
            <span>Total:</span>
            <span>${calcularTotal()}</span>
          </div>
          <button onClick={confirmarPedido} disabled={carrito.length === 0} className="w-full bg-green-600 text-white py-6 rounded-2xl text-2xl font-bold hover:bg-green-500 disabled:bg-gray-300 shadow-lg transition transform hover:scale-[1.02]">
            Confirmar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}