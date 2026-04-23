const API_BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

function getNames() {
  const nome1 = localStorage.getItem('nome1');
  const nome2 = localStorage.getItem('nome2');
  return { nome1, nome2 };
}

function setNames(nome1, nome2) {
  localStorage.setItem('nome1', nome1);
  localStorage.setItem('nome2', nome2);
}

function clearNames() {
  localStorage.removeItem('nome1');
  localStorage.removeItem('nome2');
}

function getTenant() {
  return localStorage.getItem('tenant');
}

function setTenant(tenant) {
  localStorage.setItem('tenant', tenant);
}

function clearTenant() {
  localStorage.removeItem('tenant');
}

function generateSlug(nome1, nome2) {
  const normalize = (str) => 
    str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  
  const slug1 = normalize(nome1);
  const slug2 = normalize(nome2);
  return `${slug1}-${slug2}`;
}

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token && !endpoint.includes('/auth/')) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API error');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Auth
export async function register(nome1, nome2, email, senha) {
  const tenant = generateSlug(nome1, nome2);
  
  const data = await apiCall(`/${tenant}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, senha, nome1, nome2 }),
  });
  setToken(data.token);
  // Usar os nomes retornados pelo servidor (fonte da verdade)
  setNames(data.nome1 || nome1, data.nome2 || nome2);
  const finalTenant = data.tenant || tenant;
  setTenant(finalTenant);
  return finalTenant;
}

export async function login(email, senha) {
  // First, find which tenant this user belongs to
  const result = await apiCall(`/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
  
  setToken(result.token);
  setNames(result.nome1, result.nome2);
  setTenant(result.tenant);
  return result.tenant;
}

export async function getCurrentUser(tenant) {
  return apiCall(`/${tenant}/auth/me`);
}

export function logout() {
  clearToken();
  clearNames();
  clearTenant();
}

// Gifts
export async function getGifts(tenant) {
  return apiCall(`/${tenant}/gifts`);
}

export async function createGift(tenant, gift) {
  return apiCall(`/${tenant}/gifts`, {
    method: 'POST',
    body: JSON.stringify(gift),
  });
}

export async function getGift(tenant, id) {
  return apiCall(`/${tenant}/gifts/${id}`);
}

export async function updateGift(tenant, id, gift) {
  return apiCall(`/${tenant}/gifts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(gift),
  });
}

export async function deleteGift(tenant, id) {
  return apiCall(`/${tenant}/gifts/${id}`, {
    method: 'DELETE',
  });
}

// Received Gifts (Admin)
export async function getReceivedGifts(tenant) {
  return apiCall(`/${tenant}/gifts/received`);
}

export async function acceptGift(tenant, id) {
  return apiCall(`/${tenant}/gifts/${id}/accept`, {
    method: 'PUT',
  });
}

export async function removeGiftReservation(tenant, id) {
  return apiCall(`/${tenant}/gifts/${id}/reservation`, {
    method: 'DELETE',
  });
}

// Public API
export async function getPublicGifts(tenant) {
  return apiCall(`/${tenant}/public/gifts`);
}

export async function reserveGift(tenant, id, nome, whatsapp) {
  return apiCall(`/${tenant}/public/gifts/${id}/reserve`, {
    method: 'POST',
    body: JSON.stringify({ nome, whatsapp }),
  });
}

export { getToken, setToken, clearToken, getNames, setNames, clearNames, getTenant, setTenant, clearTenant };
