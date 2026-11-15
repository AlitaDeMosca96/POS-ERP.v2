const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Ajusta el puerto si tu backend no es 3000

export async function fetcher(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Si la URL es relativa, le pegamos el backend
  const fullUrl = url.startsWith('/api') ? `${API_URL}${url.replace('/api', '')}` : url;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Si el token expiró o es inválido
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error HTTP: ${response.status}`);
  }

  // ACÁ ESTÁ LA SOLUCIÓN AL ERROR: Leemos como texto primero
  const text = await response.text();
  
  // Si el backend devuelve vacío (ej: null o 204), evitamos que JSON.parse explote
  return text ? JSON.parse(text) : null;
}