'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  costo: number;
  stock: number;
}

export default function ProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [costo, setCosto] = useState('');
  const [stock, setStock] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    cargarProductos();
  }, [router, token]);

  const cargarProductos = () => {
    fetch('http://localhost:3000/productos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setLoading(false);
      });
  };

  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoProducto = {
      nombre,
      precio: Number(precio),
      costo: Number(costo),
      stock: Number(stock),
    };

    try {
      const res = await fetch('http://localhost:3000/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nuevoProducto)
      });

      if (res.ok) {
        alert('Producto creado con éxito');
        setNombre(''); setPrecio(''); setCosto(''); setStock('');
        cargarProductos(); // Recargamos la tabla
      } else {
        alert('Error al crear el producto. Revisá la consola.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
            Volver al Dashboard
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Agregar Nuevo Producto</h2>
          <form onSubmit={handleCrearProducto} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text" placeholder="Nombre" required value={nombre} onChange={e => setNombre(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <input
              type="number" placeholder="Precio Venta" required value={precio} onChange={e => setPrecio(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <input
              type="number" placeholder="Costo" required value={costo} onChange={e => setCosto(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <input
              type="number" placeholder="Stock Inicial" required value={stock} onChange={e => setStock(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <button type="submit" className="bg-green-600 text-white font-bold p-2 rounded hover:bg-green-700">
              Guardar
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Costo</th>
                <th className="p-4 font-semibold">Precio</th>
                <th className="p-4 font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(prod => (
                <tr key={prod.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 font-medium">{prod.nombre}</td>
                  <td className="p-4 text-gray-500">${prod.costo}</td>
                  <td className="p-4 text-green-600 font-bold">${prod.precio}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${prod.stock > 5 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {prod.stock} un.
                    </span>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">No hay productos cargados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}