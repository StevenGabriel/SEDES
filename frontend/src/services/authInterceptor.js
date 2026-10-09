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
      // Detección automática en producción:
      // Si estamos en: sedeslaboratorios.umaunivalle.com -> api.sedeslaboratorios.umaunivalle.com
      // Si estamos en: sedes.76.13.233.96.traefik.me -> api-sedes.76.13.233.96.traefik.me
      const currentHost = window.location.hostname;
      const protocol = window.location.protocol;
      let targetApiHost = currentHost;
      
      if (currentHost.startsWith('sedeslaboratorios.')) {
        targetApiHost = `api.${currentHost}`;
      } else if (currentHost.startsWith('sedes.')) {
        targetApiHost = currentHost.replace('sedes.', 'api-sedes.');
      } else if (!currentHost.startsWith('api.') && !currentHost.startsWith('api-')) {
        targetApiHost = `api.${currentHost}`;
      }
      
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

export function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (baseUrl) return baseUrl.replace(/\/+$/, '');
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const currentHost = window.location.hostname;
    const protocol = window.location.protocol;
    let targetApiHost = currentHost;
    
    if (currentHost.startsWith('sedeslaboratorios.')) {
      targetApiHost = `api.${currentHost}`;
    } else if (currentHost.startsWith('sedes.')) {
      targetApiHost = currentHost.replace('sedes.', 'api-sedes.');
    } else if (!currentHost.startsWith('api.') && !currentHost.startsWith('api-')) {
      targetApiHost = `api.${currentHost}`;
    }
    return `${protocol}//${targetApiHost}`;
  }
  return 'http://localhost:8000';
}

export function formatApiUrl(url) {
  if (!url) return '';
  const apiBase = getApiBaseUrl();
  if (url.startsWith('http://localhost:8000') || url.startsWith('http://127.0.0.1:8000')) {
    return url.replace(/https?:\/\/(?:localhost|127\.0\.0\.1):8000/, apiBase);
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${apiBase}${cleanPath}`;
}

export async function descargarArchivo(url, nombreArchivo = 'documento.pdf') {
  try {
    const finalUrl = formatApiUrl(url);
    const response = await fetch(finalUrl);
    if (!response.ok) throw new Error('Error al descargar archivo');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.warn('Fallo descarga directa via Blob, abriendo enlace:', error);
    window.open(formatApiUrl(url), '_blank');
  }
}

if (typeof window !== 'undefined') {
  window.getApiBaseUrl = getApiBaseUrl;
  window.formatApiUrl = formatApiUrl;
  window.descargarArchivo = descargarArchivo;
}

export default window.fetch;
