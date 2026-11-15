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
  logout: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
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
    setUser(null);
    router.push(redirectTo);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
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