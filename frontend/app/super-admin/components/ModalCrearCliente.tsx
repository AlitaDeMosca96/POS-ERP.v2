'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface ModalCrearClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planes: { id: string; nombre: string; precioMensual: number }[];
}

export default function ModalCrearCliente({ isOpen, onClose, onSuccess, planes }: ModalCrearClienteProps) {
  const [nombre, setNombre] = useState('');
  const [cuit, setCuit] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [planId, setPlanId] = useState(planes[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${apiUrl}/super-admin/empresas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, cuit, adminNombre, adminEmail, adminPassword, planId })
      });
      
      if (res.ok) {
        toast.success('¡Empresa creada con éxito!');
        setNombre(''); setCuit(''); setAdminNombre(''); setAdminEmail(''); setAdminPassword('');
        onSuccess();
        onClose();
      } else {
        toast.error('Error al crear empresa');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-sm">
      <div className="bg-[#0a0a0a] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#D4AF37]/30">
        <div className="bg-black p-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-light text-white uppercase tracking-widest">Alta de Cliente</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-3">
            <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider border-b border-gray-800 pb-1">Datos de la Empresa</h4>
            <input type="text" placeholder="Nombre del Restaurante" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
            <input type="text" placeholder="CUIT" required value={cuit} onChange={e => setCuit(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
            <div className="pt-2">
              <label className="block text-xs text-gray-500 mb-1">Plan de Suscripción</label>
              <select value={planId} onChange={e => setPlanId(e.target.value)} className="w-full bg-black border border-gray-800 text-[#D4AF37] p-3 rounded focus:border-[#D4AF37] outline-none transition-all">
                {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} - ${p.precioMensual}/mes</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider border-b border-gray-800 pb-1">Usuario Administrador</h4>
            <input type="text" placeholder="Nombre del Dueño" required value={adminNombre} onChange={e => setAdminNombre(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
            <input type="email" placeholder="Email (para login)" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
            <input type="password" placeholder="Contraseña temporal" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
          </div>
          
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="w-1/3 bg-transparent border border-gray-600 text-gray-400 font-bold py-3 rounded hover:text-white hover:border-white transition">Cancelar</button>
            <button type="submit" className="w-2/3 bg-[#D4AF37] text-black font-bold py-3 rounded hover:bg-[#E5C158] transition shadow-[0_0_15px_rgba(212,175,55,0.3)]">Crear Empresa</button>
          </div>
        </form>
      </div>
    </div>
  );
}