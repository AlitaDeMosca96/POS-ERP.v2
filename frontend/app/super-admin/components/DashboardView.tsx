'use client';

import { useEffect, useState } from 'react';

interface Metrics {
  mrr: number;
  empresasActivas: number;
  empresasSuspendidas: number;
  totalUsuarios: number;
  servidor: {
    usoMemoria: string;
    memoriaTotal: string;
    cargaCpu: string;
    plataforma: string;
    uptimeHoras: string;
  };
  ultimosClientes: { nombre: string; fecha: string }[];
}

export default function DashboardView() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/super-admin/metrics', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-[#D4AF37] animate-pulse">Cargando métricas del sistema...</div>;
  if (!metrics) return <div className="text-red-500">Error al cargar métricas.</div>;

  return (
    <div className="space-y-6">
      {/* TARJETAS DE MÉTRICAS SAAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
          <h3 className="text-[#D4AF37] text-xs font-medium mb-1 uppercase tracking-widest">MRR (Mensual)</h3>
          <p className="text-3xl font-light text-white">${metrics.mrr.toLocaleString()}</p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 group-hover:bg-[#D4AF37]/50 transition-colors"></div>
          <h3 className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-widest">Empresas Activas</h3>
          <p className="text-3xl font-light text-white">{metrics.empresasActivas}</p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 group-hover:bg-red-500/50 transition-colors"></div>
          <h3 className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-widest">Suspendidas</h3>
          <p className="text-3xl font-light text-white">{metrics.empresasSuspendidas}</p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 group-hover:bg-blue-500/50 transition-colors"></div>
          <h3 className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-widest">Usuarios Globales</h3>
          <p className="text-3xl font-light text-white">{metrics.totalUsuarios}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SALUD DEL SERVIDOR */}
        <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl p-6">
          <h3 className="text-lg font-light text-white uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">Salud del Servidor</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Uso de Memoria RAM</span>
                <span className="text-[#D4AF37]">{metrics.servidor.usoMemoria}% de {metrics.servidor.memoriaTotal}GB</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: `${metrics.servidor.usoMemoria}%` }}></div>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400 text-sm">Carga de CPU (1m)</span>
              <span className="text-white font-mono">{metrics.servidor.cargaCpu}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400 text-sm">Sistema Operativo</span>
              <span className="text-white font-mono uppercase">{metrics.servidor.plataforma}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-sm">Uptime (Tiempo activo)</span>
              <span className="text-green-400 font-mono">{metrics.servidor.uptimeHoras} hs</span>
            </div>
          </div>
        </div>

        {/* ÚLTIMOS CLIENTES */}
        <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl p-6">
          <h3 className="text-lg font-light text-white uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">Últimos Registros</h3>
          {metrics.ultimosClientes.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay clientes registrados.</p>
          ) : (
            <ul className="space-y-3">
              {metrics.ultimosClientes.map((cli, idx) => (
                <li key={idx} className="flex justify-between items-center bg-[#111] p-3 rounded-lg border border-gray-800">
                  <span className="text-white font-medium">{cli.nombre}</span>
                  <span className="text-xs text-gray-500">{new Date(cli.fecha).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}