'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
}

interface ItemCarrito extends Producto {
  cantidad: number;
}

export default function POSPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch('http://localhost:3000/productos', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if(!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const handleCobrar = async () => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    if (!token || !usuarioStr) return;

    const usuario = JSON.parse(usuarioStr);

    const pedidoData = {
      total: calcularTotal(),
      empresaId: usuario.empresaId,
      detalles: carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio
      }))
    };

    try {
      const res = await fetch('http://localhost:3000/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pedidoData)
      });

      if (res.ok) {
        alert('¡Venta guardada con éxito!');
        setCarrito([]); // Vaciamos el ticket
      } else {
        alert('Error al guardar la venta');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Cargando catálogo...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Panel Izquierdo: Catálogo de Productos */}
      <div className="w-2/3 p-6 overflow-y-auto border-r border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Punto de Venta</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
            Volver al Dashboard
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map(prod => (
            <button 
              key={prod.id}
              onClick={() => agregarAlCarrito(prod)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition border border-gray-200 flex flex-col justify-between h-32"
            >
              <span className="font-bold text-gray-800 text-lg text-left">{prod.nombre}</span>
              <span className="text-green-600 font-bold self-end text-xl">${prod.precio}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Derecho: Carrito / Ticket */}
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