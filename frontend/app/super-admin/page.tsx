'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Empresa {
  id: string;
  nombre: string;
  cuit: string;
  activa: boolean;
  usuarios: number;
  totalVentas: number;
  fechaAlta: string;
  plan?: string;
}

interface Plan {
  id: string;
  nombre: string;
  precioMensual: number;
  limiteSucursales: number;
  limiteUsuarios: number;
  activo: boolean;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  
  const [modalEmpresaAbierto, setModalEmpresaAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cuit, setCuit] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [planId, setPlanId] = useState('');

  const [modalPlanAbierto, setModalPlanAbierto] = useState(false);
  const [planNombre, setPlanNombre] = useState('');
  const [planPrecio, setPlanPrecio] = useState('');
  const [planLimiteSucursales, setPlanLimiteSucursales] = useState('1');
  const [planLimiteUsuarios, setPlanLimiteUsuarios] = useState('5');

  const [qrData, setQrData] = useState<string | null>(null);
  const [codigo2FA, setCodigo2FA] = useState('');
  const [mensajeSeguridad, setMensajeSeguridad] = useState<{ tipo: 'error' | 'exito', texto: string } | null>(null);
  const [cargandoSeguridad, setCargandoSeguridad] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/master-login');
      return;
    }
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.rol !== 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
    }
    cargarDatos();
  }, [router, token]);

  const cargarDatos = async () => {
    try {
      const [resEmp, resPlanes] = await Promise.all([
        fetch('http://localhost:3000/super-admin/empresas', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/planes', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (resEmp.ok) setEmpresas(await resEmp.json());
      if (resPlanes.ok) {
        const planesData = await resPlanes.json();
        setPlanes(planesData);
        if (planesData.length > 0) setPlanId(planesData[0].id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCrearEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/super-admin/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, cuit, adminNombre, adminEmail, adminPassword, planId })
      });

      if (res.ok) {
        alert('¡Empresa creada con éxito!');
        setModalEmpresaAbierto(false);
        setNombre(''); setCuit(''); setAdminNombre(''); setAdminEmail(''); setAdminPassword('');
        cargarDatos();
      } else {
        alert('Error al crear la empresa');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCrearPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/planes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: planNombre,
          precioMensual: Number(planPrecio),
          limiteSucursales: Number(planLimiteSucursales),
          limiteUsuarios: Number(planLimiteUsuarios)
        })
      });

      if (res.ok) {
        alert('¡Plan creado con éxito!');
        setModalPlanAbierto(false);
        setPlanNombre(''); setPlanPrecio(''); setPlanLimiteSucursales('1'); setPlanLimiteUsuarios('5');
        cargarDatos();
      } else {
        alert('Error al crear el plan');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleEstado = async (id: string, estadoActual: boolean) => {
    const accion = estadoActual ? 'SUSPENDER' : 'ACTIVAR';
    if (!confirm(`¿Estás seguro de ${accion} esta empresa?`)) return;
    
    try {
      const res = await fetch(`http://localhost:3000/super-admin/empresas/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleImpersonar = async (id: string) => {
    if (!confirm('¿Entrar como soporte a esta empresa?')) return;
    
    try {
      const res = await fetch(`http://localhost:3000/super-admin/empresas/${id}/impersonar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.removeItem('sucursalActiva');
        alert('Entrando como soporte...');
        router.push('/dashboard');
      } else {
        alert('No se encontró un administrador para esta empresa.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/master-login');
  };

  const handleGenerarQR = async () => {
    setCargandoSeguridad(true);
    setMensajeSeguridad(null);
    try {
      const res = await fetch('http://localhost:3000/auth/2fa/generate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQrData(data.qrCodeDataUrl);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoSeguridad(false);
    }
  };

  const handleActivar2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargandoSeguridad(true);
    try {
      const res = await fetch('http://localhost:3000/auth/2fa/turn-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: codigo2FA })
      });
      if (res.ok) {
        setMensajeSeguridad({ tipo: 'exito', texto: '¡2FA activado con éxito!' });
        setQrData(null);
        setCodigo2FA('');
      } else {
        setMensajeSeguridad({ tipo: 'error', texto: 'Código inválido.' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoSeguridad(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] text-[#D4AF37] flex items-center justify-center text-xl tracking-widest uppercase">Iniciando Búnker...</div>;

  const totalEmpresas = empresas.length;
  const totalUsuarios = empresas.reduce((acc, emp) => acc + emp.usuarios, 0);
  const recaudacionTotal = empresas.reduce((acc, emp) => acc + emp.totalVentas, 0);

  const renderContenido = () => {
    switch (seccionActiva) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 group-hover:bg-[#D4AF37]/50 transition-colors"></div>
                <h3 className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-widest">Empresas Activas</h3>
                <p className="text-4xl font-light text-white">{totalEmpresas}</p>
              </div>
              <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 group-hover:bg-[#D4AF37]/50 transition-colors"></div>
                <h3 className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-widest">Usuarios Globales</h3>
                <p className="text-4xl font-light text-white">{totalUsuarios}</p>
              </div>
              <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D4AF37] to-[#B8860B]"></div>
                <h3 className="text-[#D4AF37]/70 text-xs font-medium mb-1 uppercase tracking-widest">Volumen Red</h3>
                <p className="text-4xl font-light text-[#D4AF37]">${recaudacionTotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-light text-white uppercase tracking-widest">Clientes Recientes</h2>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/50 text-gray-500 text-xs border-b border-gray-800 uppercase tracking-wider">
                    <th className="p-4 font-medium">Empresa / CUIT</th>
                    <th className="p-4 font-medium text-center">Plan</th>
                    <th className="p-4 font-medium text-center">Usuarios</th>
                    <th className="p-4 font-medium text-right">Ventas Totales</th>
                    <th className="p-4 font-medium text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map(emp => (
                    <tr key={emp.id} className="border-b border-gray-800/50 hover:bg-[#111] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-gray-200 text-base">{emp.nombre}</p>
                        <p className="text-xs text-gray-600">{emp.cuit}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">{emp.plan}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-gray-900 text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-800">{emp.usuarios}</span>
                      </td>
                      <td className="p-4 text-right font-light text-[#D4AF37]">${emp.totalVentas.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${emp.activa ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' : 'bg-red-900/20 text-red-400 border-red-900'}`}>
                          {emp.activa ? 'ACTIVA' : 'SUSPENDIDA'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      case 'clientes':
        return (
          <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
             <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-light text-white uppercase tracking-widest">Directorio de Empresas</h2>
              <button onClick={() => setModalEmpresaAbierto(true)} className="bg-[#111] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold py-2 px-6 rounded transition-all text-xs uppercase tracking-widest">+ Nueva Empresa</button>
            </div>
             <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/50 text-gray-500 text-xs border-b border-gray-800 uppercase tracking-wider">
                  <th className="p-4 font-medium">Empresa / CUIT</th>
                  <th className="p-4 font-medium text-center">Plan</th>
                  <th className="p-4 font-medium text-center">Usuarios</th>
                  <th className="p-4 font-medium text-right">Ventas</th>
                  <th className="p-4 font-medium text-center">Estado</th>
                  <th className="p-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map(emp => (
                  <tr key={emp.id} className="border-b border-gray-800/50 hover:bg-[#111] transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-gray-200 text-base">{emp.nombre}</p>
                      <p className="text-xs text-gray-600">{emp.cuit}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">{emp.plan}</span>
                    </td>
                    <td className="p-4 text-center"><span className="bg-gray-900 text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-800">{emp.usuarios}</span></td>
                    <td className="p-4 text-right font-light text-[#D4AF37]">${emp.totalVentas.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${emp.activa ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' : 'bg-red-900/20 text-red-400 border-red-900'}`}>
                        {emp.activa ? 'ACTIVA' : 'SUSPENDIDA'}
                      </span>
                    </td>
                    <td className="p-4 text-center flex flex-col gap-2 items-center">
                      <button onClick={() => handleImpersonar(emp.id)} className="text-xs bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-3 py-1 rounded transition w-full">Entrar (Soporte)</button>
                      <button onClick={() => handleToggleEstado(emp.id, emp.activa)} className={`text-xs px-3 py-1 rounded transition w-full border ${emp.activa ? 'bg-red-900/20 border-red-900 text-red-400 hover:bg-red-900/40' : 'bg-green-900/20 border-green-900 text-green-400 hover:bg-green-900/40'}`}>{emp.activa ? 'Suspender' : 'Activar'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'planes':
        return (
          <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
             <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-light text-white uppercase tracking-widest">Planes de Suscripción</h2>
              <button onClick={() => setModalPlanAbierto(true)} className="bg-[#111] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold py-2 px-6 rounded transition-all text-xs uppercase tracking-widest">+ Nuevo Plan</button>
            </div>
             <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/50 text-gray-500 text-xs border-b border-gray-800 uppercase tracking-wider">
                  <th className="p-4 font-medium">Nombre del Plan</th>
                  <th className="p-4 font-medium text-right">Precio Mensual</th>
                  <th className="p-4 font-medium text-center">Límite Sucursales</th>
                  <th className="p-4 font-medium text-center">Límite Usuarios</th>
                  <th className="p-4 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {planes.map(plan => (
                  <tr key={plan.id} className="border-b border-gray-800/50 hover:bg-[#111] transition-colors">
                    <td className="p-4 font-medium text-gray-200 text-base">{plan.nombre}</td>
                    <td className="p-4 text-right font-light text-[#D4AF37]">${Number(plan.precioMensual).toFixed(2)}</td>
                    <td className="p-4 text-center text-gray-400">{plan.limiteSucursales === -1 ? 'Ilimitadas' : plan.limiteSucursales}</td>
                    <td className="p-4 text-center text-gray-400">{plan.limiteUsuarios === -1 ? 'Ilimitados' : plan.limiteUsuarios}</td>
                    <td className="p-4 text-center">
                      <span className="bg-green-900/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-900">ACTIVO</span>
                    </td>
                  </tr>
                ))}
                {planes.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No hay planes creados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'seguridad':
        return (
          <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-4">
              <div className="w-12 h-12 bg-[#111] border border-[#D4AF37]/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl text-white font-light uppercase tracking-widest">Doble Factor (2FA)</h3>
                <p className="text-gray-500 text-sm">Añadí una capa extra de seguridad a tu cuenta maestra.</p>
              </div>
            </div>

            {mensajeSeguridad && (
              <div className={`p-4 rounded-lg mb-6 text-sm ${mensajeSeguridad.tipo === 'exito' ? 'bg-green-900/20 border border-green-500/50 text-green-400' : 'bg-red-900/20 border border-red-500/50 text-red-400'}`}>
                {mensajeSeguridad.texto}
              </div>
            )}

            {!qrData ? (
              <div className="text-center">
                <p className="text-gray-400 mb-6">Al activar el 2FA, se te pedirá un código de 6 dígitos generado por una app como Google Authenticator cada vez que inicies sesión.</p>
                <button onClick={handleGenerarQR} disabled={cargandoSeguridad} className="bg-[#D4AF37] text-black font-bold py-3 px-8 rounded-lg hover:bg-[#E5C158] transition shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50">
                  {cargandoSeguridad ? 'Generando...' : 'Configurar 2FA'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-gray-300 mb-4">1. Escaneá este código QR con tu app de autenticación.</p>
                <div className="bg-white p-4 rounded-xl mb-6">
                  <img src={qrData} alt="QR 2FA" className="w-48 h-48" />
                </div>
                <p className="text-gray-300 mb-2">2. Ingresá el código de 6 dígitos que aparece en tu app.</p>
                <form onSubmit={handleActivar2FA} className="flex gap-2 w-full max-w-xs">
                  <input type="text" placeholder="000000" maxLength={6} value={codigo2FA} onChange={e => setCodigo2FA(e.target.value)} className="flex-1 bg-black border border-gray-700 text-white p-3 rounded text-center tracking-[0.5em] text-xl focus:border-[#D4AF37] outline-none" />
                  <button type="submit" disabled={cargandoSeguridad || codigo2FA.length !== 6} className="bg-[#D4AF37] text-black font-bold px-6 rounded hover:bg-[#E5C158] transition disabled:opacity-50">Activar</button>
                </form>
                <button onClick={() => setQrData(null)} className="mt-6 text-sm text-gray-500 hover:text-white underline">Cancelar configuración</button>
              </div>
            )}
          </div>
        );
      default:
        const titulos: Record<string, string> = {
          operaciones: 'Operaciones del Sistema',
          equipo: 'Equipo Interno',
          partners: 'Partners y Revendedores',
          config: 'Configuración del SaaS'
        };
        return (
          <div className="bg-[#0a0a0a] p-12 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center h-[60vh]">
            <div className="w-20 h-20 bg-[#111] border border-[#D4AF37]/30 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-xl text-white font-light uppercase tracking-widest mb-2">{titulos[seccionActiva]}</h3>
            <p className="text-gray-500 max-w-md">Módulo en construcción. Próximamente podrás gestionar todo desde acá.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-gray-300 font-sans selection:bg-[#D4AF37] selection:text-black overflow-hidden">
      
      <aside className="w-64 bg-[#0a0a0a] border-r border-[#D4AF37]/20 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20">
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded flex items-center justify-center font-bold text-black font-serif shadow-lg mr-3">M</div>
          <h1 className="text-lg font-bold text-white tracking-widest uppercase">Master<span className="text-[#D4AF37] font-light">Ctrl</span></h1>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <button onClick={() => setSeccionActiva('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm tracking-wide ${seccionActiva === 'dashboard' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </button>
          <button onClick={() => setSeccionActiva('clientes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm tracking-wide ${seccionActiva === 'clientes' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Clientes SaaS
          </button>
          <button onClick={() => setSeccionActiva('planes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm tracking-wide ${seccionActiva === 'planes' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            Planes y Suscripciones
          </button>
          <button onClick={() => setSeccionActiva('seguridad')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm tracking-wide ${seccionActiva === 'seguridad' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Seguridad y Auditoría
          </button>
          <button onClick={() => setSeccionActiva('operaciones')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm tracking-wide ${seccionActiva === 'operaciones' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Operaciones
          </button>
          <button onClick={() => setSeccionActiva('equipo')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm tracking-wide ${seccionActiva === 'equipo' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Equipo Interno
          </button>
          <button onClick={() => setSeccionActiva('partners')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm tracking-wide ${seccionActiva === 'partners' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Partners
          </button>
          <button onClick={() => setSeccionActiva('config')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm tracking-wide ${seccionActiva === 'config' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-900 rounded transition text-xs uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Desconectar
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-light text-white uppercase tracking-widest">
              {seccionActiva === 'dashboard' && 'Dashboard Global'}
              {seccionActiva === 'clientes' && 'Gestión de Clientes'}
              {seccionActiva === 'planes' && 'Planes y Facturación'}
              {seccionActiva === 'seguridad' && 'Centro de Seguridad'}
              {seccionActiva === 'operaciones' && 'Operaciones y Sistema'}
              {seccionActiva === 'equipo' && 'Equipo Interno'}
              {seccionActiva === 'partners' && 'Red de Partners'}
              {seccionActiva === 'config' && 'Configuración Global'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Monitoreo en tiempo real de tu red</p>
          </div>
          <div className="flex items-center gap-2 bg-[#111] border border-gray-800 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400 font-medium">SISTEMA ONLINE</span>
          </div>
        </header>

        {renderContenido()}

      </main>

      {modalEmpresaAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#D4AF37]/30">
            <div className="bg-black p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-light text-white uppercase tracking-widest">Alta de Cliente</h3>
              <button onClick={() => setModalEmpresaAbierto(false)} className="text-gray-500 hover:text-white text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleCrearEmpresa} className="p-6 space-y-5">
              <div className="space-y-3">
                <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider border-b border-gray-800 pb-1">Datos de la Empresa</h4>
                <input type="text" placeholder="Nombre del Restaurante" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                <input type="text" placeholder="CUIT" required value={cuit} onChange={e => setCuit(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                
                <div className="pt-2">
                  <label className="block text-xs text-gray-500 mb-1">Plan de Suscripción</label>
                  <select 
                    value={planId} 
                    onChange={e => setPlanId(e.target.value)}
                    className="w-full bg-black border border-gray-800 text-[#D4AF37] p-3 rounded focus:border-[#D4AF37] outline-none transition-all"
                  >
                    {planes.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} - ${p.precioMensual}/mes</option>
                    ))}
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
                <button type="button" onClick={() => setModalEmpresaAbierto(false)} className="w-1/3 bg-transparent border border-gray-600 text-gray-400 font-bold py-3 rounded hover:text-white hover:border-white transition">Cancelar</button>
                <button type="submit" className="w-2/3 bg-[#D4AF37] text-black font-bold py-3 rounded hover:bg-[#E5C158] transition shadow-[0_0_15px_rgba(212,175,55,0.3)]">Crear Empresa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalPlanAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#D4AF37]/30">
            <div className="bg-black p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-light text-white uppercase tracking-widest">Nuevo Plan de Suscripción</h3>
              <button onClick={() => setModalPlanAbierto(false)} className="text-gray-500 hover:text-white text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleCrearPlan} className="p-6 space-y-5">
              <div className="space-y-3">
                <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider border-b border-gray-800 pb-1">Configuración del Plan</h4>
                <input type="text" placeholder="Nombre del Plan (Ej: Básico)" required value={planNombre} onChange={e => setPlanNombre(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                <input type="number" placeholder="Precio Mensual ($)" required value={planPrecio} onChange={e => setPlanPrecio(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Límite Sucursales</label>
                    <input type="number" placeholder="-1 para ilimitado" required value={planLimiteSucursales} onChange={e => setPlanLimiteSucursales(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Límite Usuarios</label>
                    <input type="number" placeholder="-1 para ilimitado" required value={planLimiteUsuarios} onChange={e => setPlanLimiteUsuarios(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalPlanAbierto(false)} className="w-1/3 bg-transparent border border-gray-600 text-gray-400 font-bold py-3 rounded hover:text-white hover:border-white transition">Cancelar</button>
                <button type="submit" className="w-2/3 bg-[#D4AF37] text-black font-bold py-3 rounded hover:bg-[#E5C158] transition shadow-[0_0_15px_rgba(212,175,55,0.3)]">Crear Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}