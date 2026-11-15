export function getUsuarioFromToken() {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // Un JWT tiene 3 partes: Header.Payload.Signature. Tomamos el Payload.
    const payloadBase64 = token.split('.')[1];
    // Decodificamos de Base64Url a String
    const payloadDecoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    
    return {
      id: payloadDecoded.sub,
      email: payloadDecoded.email,
      rol: payloadDecoded.rol,
      empresaId: payloadDecoded.empresaId,
      sucursalId: payloadDecoded.sucursalId,
      isImpersonation: payloadDecoded.isImpersonation || false
    };
  } catch (error) {
    console.error('Error decodificando token', error);
    return null;
  }
}

export function verificarSesion(requiredRole?: string) {
  const user = getUsuarioFromToken();
  
  if (!user) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario'); // Limpieza legacy
    window.location.href = '/';
    return null;
  }

  if (requiredRole && user.rol !== requiredRole) {
    // Si está logueado pero no tiene el rol, redirigir a su dashboard
    window.location.href = user.rol === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard';
    return null;
  }

  return user;
}