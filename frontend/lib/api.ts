export const fetcher = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : `/${url}`}`;

  const response = await fetch(apiUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    
    if (typeof window !== 'undefined' && !url.includes('/auth/')) {
      localStorage.clear();
      const path = window.location.pathname;
      if (path !== '/' && path !== '/master-login') {
        window.location.href = path.startsWith('/super-admin') ? '/master-login' : '/';
      }
    }
    throw new Error(errorData.message || 'No autorizado');
  }

  if (response.status === 404) return null;

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error en la petición');
  }

  // --- NUEVO: LEEMOS EL TEXTO PRIMERO Y VALIDAMOS SI ESTÁ VACÍO ---
  const text = await response.text();
  if (!text || text.trim() === '') {
    return null; 
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Error al parsear JSON:", text);
    return null;
  }
};