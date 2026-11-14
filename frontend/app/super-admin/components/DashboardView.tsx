'use client';

import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

interface Metrics {
  mrr: number;
  empresasActivas: number;
  empresasSuspendidas: number;
  totalUsuarios: number;
  servidor: { usoMemoria: string; memoriaTotal: string; cargaCpu: string; plataforma: string; uptimeHoras: string; };
  auditorias: { id: string; accion: string; tipo: string; fecha: string }[];
}

export default function DashboardView({ setSeccionActiva }: { setSeccionActiva: (s: string) => void }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchMetrics = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiUrl}/super-admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMetrics(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `Hace ${seconds} seg`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hs`;
    return `Hace ${Math.floor(hours / 24)} días`;
  };

  if (loading || !metrics) return <div className="text-[#D4AF37] animate-pulse text-center">Cargando dashboard...</div>;

  // Datos honestos: Si hay MRR, lo mostramos en el último mes. No inventamos la curva.
  const chartData = [
    { name: 'Junio', mrr: 0 },
    { name: 'Julio', mrr: 0 },
    { name: 'Agosto', mrr: 0 },
    { name: 'Septiembre', mrr: 0 },
    { name: 'Octubre', mrr: 0 },
    { name: 'Noviembre', mrr: metrics.mrr },
  ];

  const usoMemoriaNum = parseFloat(metrics.servidor.usoMemoria);
  let colorMemoria = 'bg-green-500';
  if (usoMemoriaNum > 70) colorMemoria = 'bg-yellow-500';
  if (usoMemoriaNum > 85) colorMemoria = 'bg-red-500';

  return (
    <div className="space-y-6">
      
      {/* INDICADOR DE ACTUALIZACIÓN */}
      <div className="flex justify-end items-center gap-2 text-xs text-gray-500 -mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        Actualizado a las {lastUpdate.toLocaleTimeString('es-AR')}
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        <div className="group relative bg-[#0a0a0a] p-5 rounded-xl border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-default">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37] rounded-l-xl"></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[#D4AF37] text-xs font-medium uppercase tracking-widest border-b border-dashed border-[#D4AF37]/50 pb-0.5 cursor-help">MRR (Mensual)</h3>
          </div>
          <p className="text-3xl font-light text-white">${metrics.mrr.toLocaleString('es-AR')}</p>
          <p className="text-gray-600 text-xs mt-2">Ingreso Recurrente</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-black border border-gray-700 text-gray-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-center shadow-2xl">
            Ingreso Mensual Recurrente: Suma de los planes activos.
          </div>
        </div>

        <div className="group relative bg-[#0a0a0a] p-5 rounded-xl border border-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 rounded-t-xl group-hover:bg-[#D4AF37]/50 transition-colors"></div>
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-widest border-b border-dashed border-gray-600 pb-0.5 cursor-help mb-2">Empresas Activas</h3>
          <p className="text-3xl font-light text-white">{metrics.empresasActivas}</p>
          <p className="text-gray-600 text-xs mt-2">en la red</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-black border border-gray-700 text-gray-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-center shadow-2xl">
            Empresas con acceso activo.
          </div>
        </div>

        <div className="group relative bg-[#0a0a0a] p-5 rounded-xl border border-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 rounded-t-xl group-hover:bg-red-500/50 transition-colors"></div>
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-widest border-b border-dashed border-gray-600 pb-0.5 cursor-help mb-2">Suspendidas</h3>
          <p className="text-3xl font-light text-white">{metrics.empresasSuspendidas}</p>
          <p className="text-red-400/70 text-xs mt-2">requieren atención</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-black border border-gray-700 text-gray-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-center shadow-2xl">
            Empresas bloqueadas por falta de pago.
          </div>
        </div>

        <div className="group relative bg-[#0a0a0a] p-5 rounded-xl border border-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 rounded-t-xl group-hover:bg-blue-500/50 transition-colors"></div>
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-widest border-b border-dashed border-gray-600 pb-0.5 cursor-help mb-2">Usuarios Globales</h3>
          <p className="text-3xl font-light text-white">{metrics.totalUsuarios.toLocaleString('es-AR')}</p>
          <p className="text-gray-600 text-xs mt-2">registrados</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-black border border-gray-700 text-gray-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-center shadow-2xl">
            Personas con cuenta en todas las empresas.
          </div>
        </div>
      </div>

      {/* GRÁFICO */}
      <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-light text-white uppercase tracking-widest">Evolución de Ingresos</h3>
            <p className="text-gray-500 text-xs mt-1">Historial de MRR (Se completará a medida que pasen los meses)</p>
          </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString('es-AR')}`, 'MRR']} // <-- ARREGLADO TS
              />
              <Area type="monotone" dataKey="mrr" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ACCIONES, SALUD Y AUDITORÍA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSeccionActiva('clientes')} className="bg-[#111] border border-gray-700 hover:border-[#D4AF37] p-3 rounded-lg flex flex-col items-center justify-center transition-all text-gray-400 hover:text-[#D4AF37] hover:scale-105">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
                <span className="text-xs font-medium">Nuevo Cliente</span>
              </button>
              <button onClick={() => setSeccionActiva('operaciones')} className="bg-[#111] border border-gray-700 hover:border-[#D4AF37] p-3 rounded-lg flex flex-col items-center justify-center transition-all text-gray-400 hover:text-[#D4AF37] hover:scale-105">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span className="text-xs font-medium">Ver Reportes</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Salud del Servidor</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">RAM</span>
                  <span className="text-gray-300">{metrics.servidor.usoMemoria}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className={`${colorMemoria} h-1.5 rounded-full transition-all`} style={{ width: `${metrics.servidor.usoMemoria}%` }}></div>
                </div>
                <p className="text-[10px] text-gray-600 mt-1">El uso alto es normal en desarrollo local.</p>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-xs">CPU Load</span>
                <span className="text-white text-xs font-mono">{metrics.servidor.cargaCpu}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-xs">Uptime</span>
                <span className="text-green-400 text-xs font-mono">{metrics.servidor.uptimeHoras} hs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-2">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Actividad y Auditoría Reciente</h3>
            <button onClick={() => setSeccionActiva('seguridad')} className="text-xs text-[#D4AF37] hover:underline">Ver todo</button>
          </div>
          
          <ul className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
            {metrics.auditorias.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay actividad reciente.</p>
            ) : (
              metrics.auditorias.map((log) => {
                let iconColor = 'text-blue-400 bg-blue-900/30 border-blue-500/30';
                if (log.tipo === 'success') iconColor = 'text-green-400 bg-green-900/30 border-green-500/30';
                if (log.tipo === 'danger') iconColor = 'text-red-400 bg-red-900/30 border-red-500/30';
                if (log.tipo === 'warning') iconColor = 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';

                return (
                  <li key={log.id} className="relative flex items-start gap-4 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border ${iconColor} group-hover:scale-110 transition-transform`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="flex-1 bg-[#111] border border-gray-800 p-3 rounded-lg group-hover:bg-[#151515] transition-colors">
                      <p className="text-sm text-gray-300">{log.accion}</p>
                      <p className="text-xs text-gray-600 mt-1">{timeAgo(log.fecha)}</p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}