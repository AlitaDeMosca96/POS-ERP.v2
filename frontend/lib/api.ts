const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    throw new Error('Sesión expirada. Por favor, volvé a ingresar.');
  }

  if (response.status === 403) {
    throw new Error('No tenés permisos para realizar esta acción.');
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    // Si el backend devuelve un array de errores de validación, tomamos el primero
    const msg = Array.isArray(data?.message) ? data.message[0] : (data?.message || 'Error en la petición al servidor');
    throw new Error(msg);
  }

  return data;
}