/**
 * Interceptor global de peticiones Fetch para autenticación institucional JWT.
 * Inyecta automáticamente el token Bearer en todas las llamadas hacia el backend.
 */

const originalFetch = window.fetch;

window.fetch = async function (resource, config = {}) {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(config.headers || {});
  const urlStr = typeof resource === 'string' ? resource : resource?.url || '';
  
  // Solo inyectar Authorization en rutas internas de nuestro backend API
  const isInternalBackend = (
    urlStr.startsWith('/') ||
    urlStr.includes('localhost:8000') ||
    urlStr.includes('127.0.0.1:8000') ||
    urlStr.includes('/api/')
  ) && !urlStr.includes('project-osrm.org') && !urlStr.includes('openstreetmap.org') && !urlStr.includes('google.com');

  // Inyectar el token JWT únicamente hacia nuestro backend
  if (token && isInternalBackend && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const modifiedConfig = {
    ...config,
    headers,
  };

  const baseUrl = import.meta.env.VITE_API_URL;
  let finalResource = resource;
  if (typeof resource === 'string' && (resource.includes('localhost:8000') || resource.includes('127.0.0.1:8000'))) {
    if (baseUrl) {
      finalResource = resource.replace(/https?:\/\/(?:localhost|127\.0\.0\.1):8000/, baseUrl.replace(/\/+$/, ''));
    } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // Detección automática en producción: si estamos en sedes.76.13.233.96.traefik.me -> api-sedes.76.13.233.96.traefik.me
      const currentHost = window.location.hostname;
      const protocol = window.location.protocol;
      let targetApiHost = currentHost.startsWith('sedes.') 
        ? currentHost.replace('sedes.', 'api-sedes.') 
        : `api-${currentHost}`;
      
      finalResource = resource.replace(/https?:\/\/(?:localhost|127\.0\.0\.1):8000/, `${protocol}//${targetApiHost}`);
    }
  }

  try {
    const response = await originalFetch(finalResource, modifiedConfig);

    // Detección de token expirado o inválido (401 Unauthorized)
    if (response.status === 401) {
      const urlStr = typeof resource === 'string' ? resource : resource?.url || '';
      const isPublicAuthRoute = (
        urlStr.includes('/api/auth/login') ||
        urlStr.includes('/api/auth/register') ||
        urlStr.includes('/api/auth/solicitar-reset-password') ||
        urlStr.includes('/api/auth/verificar-token-reset') ||
        urlStr.includes('/api/auth/reset-password') ||
        urlStr.includes('/api/requisitos/publico') ||
        (urlStr.includes('/api/establecimientos') && !urlStr.includes('/propietario/'))
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
