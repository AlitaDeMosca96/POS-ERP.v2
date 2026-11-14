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
  costo: number;
  stock: number;
  categoria?: Categoria;
}

interface Insumo {
  id: string;
  nombre: string;
  unidadMedida: string;
}

interface RecetaItem {
  id: string;
  cantidad: number;
  insumo: Insumo;
}

interface Modificador {
  id: string;
  nombre: string;
  precioExtra: number;
}

export default function ProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados Formulario Producto
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [costo, setCosto] = useState('');
  const [stock, setStock] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  // --- ESTADOS MODAL RECETA ---
  const [productoReceta, setProductoReceta] = useState<Producto | null>(null);
  const [recetaActual, setRecetaActual] = useState<RecetaItem[]>([]);
  const [nuevoInsumoId, setNuevoInsumoId] = useState('');
  const [nuevaCantidad, setNuevaCantidad] = useState('1');

  // --- ESTADOS MODAL MODIFICADORES ---
  const [productoModificador, setProductoModificador] = useState<Producto | null>(null);
  const [modificadoresActuales, setModificadoresActuales] = useState<Modificador[]>([]);
  const [nuevoModNombre, setNuevoModNombre] = useState('');
  const [nuevoModPrecio, setNuevoModPrecio] = useState('0');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    cargarDatos();
  }, [router, token]);

  const cargarDatos = async () => {
    try {
      const [resProd, resCat, resIns] = await Promise.all([
        fetch('/api/productos', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categorias', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/insumos', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProductos(await resProd.json());
      const cats = await resCat.json();
      setCategorias(cats);
      setInsumos(await resIns.json());
      if (cats.length > 0) setCategoriaId(cats[0].id);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCrearCategoria = async () => {
    const nombreCat = prompt('Ingrese el nombre de la nueva categoría:');
    if (!nombreCat) return;

    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: nombreCat })
      });
      if (res.ok) cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoProducto = {
      nombre,
      precio: Number(precio),
      costo: Number(costo),
      stock: Number(stock),
      categoriaId: categoriaId || null,
    };

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(nuevoProducto)
      });

      if (res.ok) {
        alert('Producto creado con éxito');
        setNombre(''); setPrecio(''); setCosto(''); setStock('');
        cargarDatos();
      } else {
        alert('Error al crear el producto.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- LÓGICA DE RECETAS ---
  const abrirModalReceta = async (prod: Producto) => {
    setProductoReceta(prod);
    try {
      const res = await fetch(`/api/recetas/producto/${prod.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecetaActual(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleAgregarInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoReceta || !nuevoInsumoId) return;

    try {
      const res = await fetch('/api/recetas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productoId: productoReceta.id,
          insumoId: nuevoInsumoId,
          cantidad: Number(nuevaCantidad)
        })
      });

      if (res.ok) {
        const resRec = await fetch(`/api/recetas/producto/${productoReceta.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecetaActual(await resRec.json());
        setNuevaCantidad('1');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminarInsumo = async (recetaId: string) => {
    if (!confirm('¿Quitar este insumo de la receta?')) return;
    try {
      await fetch(`/api/recetas/${recetaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (productoReceta) {
        const resRec = await fetch(`/api/recetas/producto/${productoReceta.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecetaActual(await resRec.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- LÓGICA DE MODIFICADORES ---
  const abrirModalModificadores = async (prod: Producto) => {
    setProductoModificador(prod);
    try {
      const res = await fetch(`/api/modificadores/producto/${prod.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModificadoresActuales(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleAgregarModificador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoModificador || !nuevoModNombre) return;

    try {
      const res = await fetch('/api/modificadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: nuevoModNombre,
          precioExtra: Number(nuevoModPrecio),
          productoId: productoModificador.id
        })
      });

      if (res.ok) {
        const resMods = await fetch(`/api/modificadores/producto/${productoModificador.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setModificadoresActuales(await resMods.json());
        setNuevoModNombre('');
        setNuevoModPrecio('0');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminarModificador = async (modId: string) => {
    if (!confirm('¿Eliminar este modificador?')) return;
    try {
      await fetch(`/api/modificadores/${modId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (productoModificador) {
        const resMods = await fetch(`/api/modificadores/producto/${productoModificador.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setModificadoresActuales(await resMods.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
          <div className="flex gap-4">
            <button onClick={handleCrearCategoria} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold">
              + Nueva Categoría
            </button>
            <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline py-2">
              Volver al Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Agregar Nuevo Producto</h2>
          <form onSubmit={handleCrearProducto} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input type="text" placeholder="Nombre" required value={nombre} onChange={e => setNombre(e.target.value)} className="border p-2 rounded text-gray-800" />
            <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} className="border p-2 rounded text-gray-800">
              <option value="">Sin Categoría</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
            <input type="number" placeholder="Precio Venta" required value={precio} onChange={e => setPrecio(e.target.value)} className="border p-2 rounded text-gray-800" />
            <input type="number" placeholder="Costo" required value={costo} onChange={e => setCosto(e.target.value)} className="border p-2 rounded text-gray-800" />
            <input type="number" placeholder="Stock Inicial" required value={stock} onChange={e => setStock(e.target.value)} className="border p-2 rounded text-gray-800" />
            <button type="submit" className="bg-green-600 text-white font-bold p-2 rounded hover:bg-green-700">Guardar</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Categoría</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(prod => (
                <tr key={prod.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 font-medium">{prod.nombre}</td>
                  <td className="p-4">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                      {prod.categoria?.nombre || 'General'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${prod.stock > 5 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {prod.stock} un.
                    </span>
                  </td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button onClick={() => abrirModalReceta(prod)} className="bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1 rounded font-bold text-sm transition">
                      Receta
                    </button>
                    <button onClick={() => abrirModalModificadores(prod)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded font-bold text-sm transition">
                      Modificadores
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE RECETA (ESCANDALLO) */}
      {productoReceta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-teal-700 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Receta: {productoReceta.nombre}</h3>
              <button onClick={() => setProductoReceta(null)} className="text-teal-200 hover:text-white font-bold text-2xl">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAgregarInsumo} className="flex gap-2 mb-6 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Insumo</label>
                  <select value={nuevoInsumoId} onChange={e => setNuevoInsumoId(e.target.value)} className="w-full border p-2 rounded text-gray-800" required>
                    <option value="">Seleccione un insumo...</option>
                    {insumos.map(ins => <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidadMedida})</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                  <input type="number" step="0.01" required value={nuevaCantidad} onChange={e => setNuevaCantidad(e.target.value)} className="w-full border p-2 rounded text-gray-800" />
                </div>
                <button type="submit" className="bg-teal-600 text-white font-bold px-4 py-2 rounded hover:bg-teal-700 h-[42px]">Agregar</button>
              </form>

              <h4 className="font-bold text-gray-700 mb-2">Insumos actuales:</h4>
              {recetaActual.length === 0 ? (
                <p className="text-gray-500 text-sm italic bg-gray-50 p-4 rounded text-center">Este producto todavía no tiene insumos asignados.</p>
              ) : (
                <ul className="space-y-2">
                  {recetaActual.map(item => (
                    <li key={item.id} className="flex justify-between items-center bg-gray-50 border p-3 rounded">
                      <span className="font-medium text-gray-800">{item.insumo?.nombre || 'Insumo no encontrado'}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{item.cantidad} {item.insumo?.unidadMedida.toLowerCase() || 'un.'}</span>
                        <button onClick={() => handleEliminarInsumo(item.id)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE MODIFICADORES */}
      {productoModificador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Modificadores: {productoModificador.nombre}</h3>
              <button onClick={() => setProductoModificador(null)} className="text-blue-200 hover:text-white font-bold text-2xl">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAgregarModificador} className="flex gap-2 mb-6 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Nombre del Modificador (Ej: Sin cebolla)</label>
                  <input type="text" value={nuevoModNombre} onChange={e => setNuevoModNombre(e.target.value)} className="w-full border p-2 rounded text-gray-800" required placeholder="Ej: Con queso extra" />
                </div>
                <div className="w-32">
                  <label className="block text-sm text-gray-600 mb-1">Precio Extra</label>
                  <input type="number" step="0.01" value={nuevoModPrecio} onChange={e => setNuevoModPrecio(e.target.value)} className="w-full border p-2 rounded text-gray-800" required />
                </div>
                <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 h-[42px]">Agregar</button>
              </form>

              <h4 className="font-bold text-gray-700 mb-2">Opciones disponibles:</h4>
              {modificadoresActuales.length === 0 ? (
                <p className="text-gray-500 text-sm italic bg-gray-50 p-4 rounded text-center">Este producto no tiene modificadores configurados.</p>
              ) : (
                <ul className="space-y-2">
                  {modificadoresActuales.map(mod => (
                    <li key={mod.id} className="flex justify-between items-center bg-gray-50 border p-3 rounded">
                      <span className="font-medium text-gray-800">{mod.nombre}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-green-600 font-bold">+${mod.precioExtra}</span>
                        <button onClick={() => handleEliminarModificador(mod.id)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}