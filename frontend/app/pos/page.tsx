'use client';

import { useRouter } from 'next/navigation';
import { usePOS } from './hooks/usePOS';
import Catalog from './components/Catalog';
import Cart from './components/Cart';
import ModifierModal from './components/ModifierModal';
import PaymentModal from './components/PaymentModal';
import TicketModal from '../../components/TicketModal';

export default function POSPage() {
  const router = useRouter();
  const { state, actions } = usePOS();

  const calcularTotalCarrito = () => {
    return state.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const handleAbrirCobro = () => {
    if (state.carrito.length === 0 && state.mesaActivaId) {
      actions.liberarMesaVacia();
    } else {
      actions.setModalPagoAbierto(true);
    }
  };

  if (state.loading) return <div className="p-10 text-center text-xl">Cargando catálogo...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* PANEL IZQUIERDO: CATÁLOGO */}
      <Catalog 
        categorias={state.categorias}
        productos={state.productos}
        categoriaActiva={state.categoriaActiva}
        onCategoriaChange={actions.setCategoriaActiva}
        onProductoClick={actions.handleProductoClick}
      />

      {/* PANEL DERECHO: TICKET */}
      <Cart 
        carrito={state.carrito}
        mesas={state.mesas}
        clientes={state.clientes}
        mesaActivaId={state.mesaActivaId}
        clienteActivoId={state.clienteActivoId}
        total={calcularTotalCarrito()}
        onMesaChange={actions.handleMesaChange}
        onClienteChange={actions.setClienteActivoId}
        onGuardar={actions.guardarMesa}
        onCobrar={handleAbrirCobro}
      />

      {/* MODALES */}
      <ModifierModal 
        producto={state.productoModificando}
        modificadores={state.modificadoresDisponibles}
        seleccionados={state.modificadoresSeleccionados}
        onToggle={(mod) => {
          const existe = state.modificadoresSeleccionados.find(m => m.id === mod.id);
          if (existe) actions.setModificadoresSeleccionados(state.modificadoresSeleccionados.filter(m => m.id !== mod.id));
          else actions.setModificadoresSeleccionados([...state.modificadoresSeleccionados, mod]);
        }}
        onConfirm={actions.confirmarModificadores}
        onClose={() => actions.setProductoModificando(null)}
      />

      <PaymentModal 
        isOpen={state.modalPagoAbierto}
        total={calcularTotalCarrito()}
        onClose={() => actions.setModalPagoAbierto(false)}
        onConfirm={actions.procesarPago}
      />

      <TicketModal 
        isOpen={!!state.ventaExitosa} 
        onClose={() => actions.setVentaExitosa(null)} 
        venta={state.ventaExitosa} 
      />

    </div>
  );
}