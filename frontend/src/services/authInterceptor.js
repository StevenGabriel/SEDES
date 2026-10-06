/**
 * Interceptor global de peticiones Fetch para autenticación institucional JWT.
 * Inyecta automáticamente el token Bearer en todas las llamadas hacia el backend.
 */

const originalFetch = window.fetch;

window.fetch = async function (resource, config = {}) {
  const token = localStorage.getItem('token');
  
  // Clonar o inicializar headers
  const headers = new Headers(config.headers || {});
  
  // Inyectar el token JWT si está disponible y no se especificó previamente
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const modifiedConfig = {
    ...config,
    headers,
  };

  try {
    const response = await originalFetch(resource, modifiedConfig);

    // Detección de token expirado o inválido (401 Unauthorized)
    if (response.status === 401) {
      const urlStr = typeof resource === 'string' ? resource : resource?.url || '';
      const isPublicAuthRoute = (
        urlStr.includes('/api/auth/login') ||
        urlStr.includes('/api/auth/register') ||
        urlStr.includes('/api/auth/solicitar-reset-password') ||
        urlStr.includes('/api/auth/verificar-token-reset') ||
        urlStr.includes('/api/auth/reset-password') ||
        urlStr.includes('/api/requisitos/publico')
      );

      if (!isPublicAuthRoute && token) {
        console.warn('⚠️ [Seguridad SEDES] Sesión caducada o token inválido detectado (401).');
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

export default window.fetch;
