'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Proveedor {
  id: string;
  nombre: string;
}

interface Insumo {
  id: string;
  nombre: string;
  unidadMedida: string;
  costo: number;
}

interface ItemCompra {
  insumoId: string;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
}

export default function ComprasPage() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [proveedorId, setProveedorId] = useState('');
  const [insumoId, setInsumoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  
  // Estado del carrito de compras
  const [carrito, setCarrito] = useState<ItemCompra[]>([]);

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
      const [resProv, resIns] = await Promise.all([
        fetch('http://localhost:3000/proveedores', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/insumos', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const provs = await resProv.json();
      const inss = await resIns.json();
      setProveedores(provs);
      setInsumos(inss);
      
      if (provs.length > 0) setProveedorId(provs[0].id);
      if (inss.length > 0) {
        setInsumoId(inss[0].id);
        setCostoUnitario(inss[0].costo.toString());
      }
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInsumoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setInsumoId(id);
    const insumoSeleccionado = insumos.find(i => i.id === id);
    if (insumoSeleccionado) {
      setCostoUnitario(insumoSeleccionado.costo.toString());
    }
  };

  const agregarAlCarrito = (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoId || !cantidad || !costoUnitario) return;

    const insumoObj = insumos.find(i => i.id === insumoId);
    if (!insumoObj) return;

    const nuevoItem: ItemCompra = {
      insumoId: insumoId,
      nombre: insumoObj.nombre,
      cantidad: Number(cantidad),
      costoUnitario: Number(costoUnitario)
    };

    // Si el insumo ya está en el carrito, sumamos la cantidad
    const existeIndex = carrito.findIndex(item => item.insumoId === insumoId);
    if (existeIndex >= 0) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[existeIndex].cantidad += Number(cantidad);
      nuevoCarrito[existeIndex].costoUnitario = Number(costoUnitario); // Actualizamos al último costo
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([...carrito, nuevoItem]);
    }

    setCantidad('');
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.cantidad * item.costoUnitario), 0);
  };

  const handleRegistrarCompra = async () => {
    if (!proveedorId) {
      alert('Por favor, seleccioná un proveedor.');
      return;
    }
    if (carrito.length === 0) {
      alert('Agregá al menos un insumo a la compra.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          total: calcularTotal(),
          proveedorId: proveedorId,
          detalles: carrito.map(item => ({
            insumoId: item.insumoId,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario
          }))
        })
      });

      if (res.ok) {
        alert('¡Compra registrada con éxito! El stock de los insumos fue actualizado.');
        setCarrito([]);
        // Recargamos los insumos para ver el nuevo stock (opcional, pero buena práctica)
        const resIns = await fetch('http://localhost:3000/insumos', { headers: { Authorization: `Bearer ${token}` } });
        setInsumos(await resIns.json());
      } else {
        alert('Error al registrar la compra.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Registrar Compra</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
            Volver al Dashboard
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="lg:w-1/2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">1. Seleccionar Proveedor</h2>
              <select 
                value={proveedorId} 
                onChange={e => setProveedorId(e.target.value)}
                className="w-full border p-3 rounded text-gray-800 font-bold bg-gray-50"
              >
                <option value="">Seleccione un proveedor...</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">2. Agregar Insumos</h2>
              <form onSubmit={agregarAlCarrito} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Insumo</label>
                  <select 
                    value={insumoId} 
                    onChange={handleInsumoChange}
                    className="w-full border p-2 rounded text-gray-800"
                  >
                    {insumos.map(ins => (
                      <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidadMedida})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                    <input 
                      type="number" step="0.01" required value={cantidad} onChange={e => setCantidad(e.target.value)}
                      className="w-full border p-2 rounded text-gray-800"
                      placeholder="Ej: 10"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Costo Unitario</label>
                    <input 
                      type="number" step="0.01" required value={costoUnitario} onChange={e => setCostoUnitario(e.target.value)}
                      className="w-full border p-2 rounded text-gray-800"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-gray-800 text-white font-bold p-2 rounded hover:bg-gray-900">
                  + Agregar a la Compra
                </button>
              </form>
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold">Resumen de la Factura</h2>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                {carrito.length === 0 ? (
                  <p className="text-gray-400 text-center mt-10">No hay insumos agregados</p>
                ) : (
                  <ul className="space-y-3">
                    {carrito.map(item => (
                      <li key={item.insumoId} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{item.nombre}</p>
                          <p className="text-sm text-gray-500">{item.cantidad} x ${item.costoUnitario}</p>
                        </div>
                        <span className="font-bold text-gray-700">${item.cantidad * item.costoUnitario}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t">
                <div className="flex justify-between text-2xl font-bold mb-4 text-gray-800">
                  <span>Total:</span>
                  <span>${calcularTotal()}</span>
                </div>
                <button 
                  onClick={handleRegistrarCompra}
                  disabled={carrito.length === 0 || !proveedorId}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Registrar Compra y Actualizar Stock
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}