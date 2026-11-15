const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetcher(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const fullUrl = url.startsWith('http') 
    ? url 
    : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      // Si estamos en la zona de Super Admin, redirigimos al login maestro
      if (window.location.pathname.startsWith('/super-admin')) {
        window.location.href = '/master-login';
      } else {
        // Si estamos en el POS o Dashboard normal, redirigimos al login de clientes
        window.location.href = '/';
      }
    }
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (errorText.startsWith('<!DOCTYPE')) {
      throw new Error(`Error ${response.status}: No se encontró la ruta en el servidor.`);
    }
    throw new Error(errorText || `Error HTTP: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}