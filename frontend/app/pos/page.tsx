'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Categoria {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoriaId?: string;
  categoria?: Categoria; // <-- Agregamos esto
}

interface ItemCarrito extends Producto {
  cantidad: number;
}

export default function POSPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('ALL');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const cargarDatos = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch('http://localhost:3000/productos', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3000/categorias', { headers: { Authorization: `Bearer ${token}` } })
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
  }, [router]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          alert('No hay más stock de este producto');
          return prev;
        }
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      if (producto.stock <= 0) {
        alert('Producto agotado');
        return prev;
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const handleCobrar = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const pedidoData = {
      total: calcularTotal(),
      detalles: carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio
      }))
    };

    try {
      const res = await fetch('http://localhost:3000/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pedidoData)
      });

      if (res.ok) {
        alert('¡Venta guardada con éxito!');
        setCarrito([]);
        fetch('http://localhost:3000/productos', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json()).then(data => setProductos(data));
      } else {
        alert('Error al guardar la venta');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Cargando catálogo...</div>;

  // ACÁ ESTÁ EL ARREGLO: Validamos si tiene la relación o el ID directo
  const productosFiltrados = categoriaActiva === 'ALL' 
    ? productos 
    : productos.filter(p => p.categoriaId === categoriaActiva || p.categoria?.id === categoriaActiva);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-2/3 flex flex-col border-r border-gray-300">
        
        <div className="bg-white p-4 shadow-sm flex gap-2 overflow-x-auto">
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

        <div className="p-6 overflow-y-auto flex-1">
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
                onClick={() => agregarAlCarrito(prod)}
                disabled={prod.stock <= 0}
                className={`p-4 rounded-lg shadow transition border flex flex-col justify-between h-32 ${prod.stock <= 0 ? 'bg-gray-200 opacity-50 cursor-not-allowed' : 'bg-white hover:shadow-lg border-gray-200'}`}
              >
                <div className="text-left w-full">
                  <span className="font-bold text-gray-800 text-lg block">{prod.nombre}</span>
                  <span className="text-sm text-gray-500">Stock: {prod.stock}</span>
                </div>
                <span className="text-green-600 font-bold self-end text-xl">${prod.precio}</span>
              </button>
            ))}
            {productosFiltrados.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                No hay productos en esta categoría.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-1/3 bg-white shadow-xl flex flex-col">
        <div className="p-4 bg-gray-800 text-white">
          <h2 className="text-xl font-bold">Ticket Actual</h2>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {carrito.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">No hay productos seleccionados</p>
          ) : (
            <ul className="space-y-3">
              {carrito.map(item => (
                <li key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{item.nombre}</p>
                    <p className="text-sm text-gray-500">{item.cantidad} x ${item.precio}</p>
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
          <button 
            className="w-full bg-green-600 text-white py-3 rounded-lg text-xl font-bold hover:bg-green-700 disabled:bg-gray-300"
            disabled={carrito.length === 0}
            onClick={handleCobrar}
          >
            Cobrar
          </button>
        </div>
      </div>
    </div>
  );
}