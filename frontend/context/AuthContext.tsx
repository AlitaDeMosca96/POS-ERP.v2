'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetcher } from '../lib/api';

interface User {
  id: string;
  email: string;
  rol: string;
  empresaId: string;
  sucursalId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isImpersonating: boolean;
  logout: (redirectTo?: string) => void;
  startImpersonation: (token: string, impersonatedUser: User) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      const originalToken = localStorage.getItem('original_token');
      setIsImpersonating(!!originalToken);
      
      if (!token) {
        setLoading(false);
        if (pathname !== '/' && pathname !== '/master-login') {
          router.push('/');
        }
        return;
      }

      try {
        const userData = await fetcher('/auth/profile');
        setUser(userData);
        localStorage.setItem('usuario', JSON.stringify(userData));
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [router, pathname]);

  const logout = (redirectTo: string = '/') => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('original_token');
    localStorage.removeItem('original_usuario');
    setUser(null);
    setIsImpersonating(false);
    router.push(redirectTo);
  };

  const startImpersonation = (token: string, impersonatedUser: User) => {
    const currentToken = localStorage.getItem('token');
    const currentUser = localStorage.getItem('usuario');
    
    if (currentToken && currentUser) {
      localStorage.setItem('original_token', currentToken);
      localStorage.setItem('original_usuario', currentUser);
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(impersonatedUser));
    setIsImpersonating(true);
    
    // Recargamos para aplicar el nuevo token en toda la app
    window.location.href = '/dashboard';
  };

  const stopImpersonation = () => {
    const originalToken = localStorage.getItem('original_token');
    const originalUser = localStorage.getItem('original_usuario');
    
    if (originalToken && originalUser) {
      localStorage.setItem('token', originalToken);
      localStorage.setItem('usuario', originalUser);
      localStorage.removeItem('original_token');
      localStorage.removeItem('original_usuario');
      setIsImpersonating(false);
      window.location.href = '/super-admin';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isImpersonating, logout, startImpersonation, stopImpersonation }}>
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-[9999] font-bold shadow-md flex justify-center items-center gap-4">
          <span>⚠️ ESTÁS EN MODO SOPORTE ({user?.email})</span>
          <button onClick={stopImpersonation} className="bg-white text-red-600 px-3 py-1 rounded text-sm hover:bg-gray-100 transition">
            SALIR DE ESTE MODO
          </button>
        </div>
      )}
      <div className={isImpersonating ? 'pt-10' : ''}>
        {children}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}