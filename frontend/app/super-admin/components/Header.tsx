'use client';

import { useState } from 'react';

export default function Header({ title, onSearch }: { title: string, onSearch: (query: string) => void }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800 shadow-lg relative z-50">
      
      <div>
        <h2 className="text-2xl font-light text-white uppercase tracking-widest">{title}</h2>
        <p className="text-gray-500 text-xs mt-1">Monitoreo en tiempo real de tu red</p>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* BUSCADOR GLOBAL */}
        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar empresa y Enter..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-gray-700 text-white pl-10 pr-3 py-2 rounded-lg text-sm focus:border-[#D4AF37] outline-none transition-all placeholder-gray-600"
          />
        </form>

        {/* CAMPANITA DE NOTIFICACIONES */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-[#111] border border-gray-700 rounded-lg hover:border-[#D4AF37]/50 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#111]"></span>
          </button>

          {/* DROPDOWN NOTIFICACIONES */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 bg-[#111] border-b border-gray-800 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Alertas del Sistema</span>
                <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-white text-xs">Cerrar</button>
              </div>
              <ul className="max-h-64 overflow-y-auto">
                <li className="p-4 border-b border-gray-800 hover:bg-[#111] cursor-pointer">
                  <p className="text-sm text-gray-300"><span className="text-red-400 font-bold">Error:</span> El backup automático falló a las 03:00 AM.</p>
                  <p className="text-xs text-gray-600 mt-1">Hace 2 horas</p>
                </li>
                <li className="p-4 border-b border-gray-800 hover:bg-[#111] cursor-pointer">
                  <p className="text-sm text-gray-300"><span className="text-yellow-400 font-bold">Atención:</span> La tarjeta de Pizzería Pepe fue rechazada.</p>
                  <p className="text-xs text-gray-600 mt-1">Hace 5 horas</p>
                </li>
                <li className="p-4 hover:bg-[#111] cursor-pointer">
                  <p className="text-sm text-gray-300"><span className="text-green-400 font-bold">Éxito:</span> Actualización de servidor completada.</p>
                  <p className="text-xs text-gray-600 mt-1">Ayer</p>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-gray-800">
          <div className="w-9 h-9 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center font-bold text-black font-serif shadow-md">M</div>
          <div className="hidden md:block">
            <p className="text-sm text-white font-medium">Master</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}