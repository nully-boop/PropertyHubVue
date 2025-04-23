// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API Request options
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  withCredentials?: boolean;
}

// Error response from API
interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Core API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Include CSRF token if available (for Laravel CSRF protection)
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken;
  }

  // Configure fetch options
  const fetchOptions: RequestInit = {
    method: options.method,
    headers,
    credentials: options.withCredentials ? 'include' : 'same-origin',
  };

  // Add body for non-GET requests
  if (options.method !== 'GET' && options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  
  // Parse response data
  let data;
  try {
    // Some APIs might return empty responses for certain operations
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error('Failed to parse response data');
  }

  // Handle error responses
  if (!response.ok) {
    const errorData = data as ErrorResponse;
    const errorMessage = errorData.message || 'An error occurred';
    
    const error = new Error(errorMessage) as Error & { status: number, errors?: Record<string, string[]> };
    error.status = response.status;
    if (errorData.errors) {
      error.errors = errorData.errors;
    }
    
    throw error;
  }

  return data as T;
}

// Auth API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    apiRequest('/login', { method: 'POST', body: credentials, withCredentials: true }),
  
  register: (userData: { name: string; email: string; password: string; password_confirmation: string }) => 
    apiRequest('/register', { method: 'POST', body: userData }),
  
  logout: () => 
    apiRequest('/logout', { method: 'POST', withCredentials: true }),
  
  getCurrentUser: () => 
    apiRequest('/user', { method: 'GET', withCredentials: true }),
};

// Properties API endpoints
export const propertiesApi = {
  getAll: (filters?: Record<string, any>) => {
    const queryParams = filters ? '?' + new URLSearchParams(
      Object.entries(filters)
        .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        .reduce((acc, [key, value]) => {
          // Handle arrays like features
          if (Array.isArray(value) && value.length > 0) {
            return { ...acc, [`${key}`]: value.join(',') };
          }
          return { ...acc, [key]: String(value) };
        }, {})
    ).toString() : '';
    
    return apiRequest(`/properties${queryParams}`, { method: 'GET' });
  },
  
  getById: (id: number) => 
    apiRequest(`/properties/${id}`, { method: 'GET' }),
  
  create: (propertyData: any) => 
    apiRequest('/properties', { method: 'POST', body: propertyData, withCredentials: true }),
  
  update: (id: number, propertyData: any) => 
    apiRequest(`/properties/${id}`, { method: 'PUT', body: propertyData, withCredentials: true }),
  
  delete: (id: number) => 
    apiRequest(`/properties/${id}`, { method: 'DELETE', withCredentials: true }),
  
  getSellerProperties: (sellerId: number) => 
    apiRequest(`/sellers/${sellerId}/properties`, { method: 'GET', withCredentials: true }),
  
  uploadImages: (propertyId: number, formData: FormData) => {
    // For file uploads, we don't set Content-Type header, let the browser set it with the boundary
    return apiRequest(`/properties/${propertyId}/images`, { 
      method: 'POST', 
      headers: {}, // Override the default headers
      body: formData,
      withCredentials: true 
    });
  },
};

// Inquiries API endpoints
export const inquiriesApi = {
  create: (propertyId: number, inquiryData: any) => 
    apiRequest(`/properties/${propertyId}/inquiries`, { method: 'POST', body: inquiryData }),
  
  getByProperty: (propertyId: number) => 
    apiRequest(`/properties/${propertyId}/inquiries`, { method: 'GET', withCredentials: true }),
  
  getBySeller: (sellerId: number) => 
    apiRequest(`/sellers/${sellerId}/inquiries`, { method: 'GET', withCredentials: true }),
  
  markAsViewed: (id: number) => 
    apiRequest(`/inquiries/${id}/view`, { method: 'PATCH', withCredentials: true }),
};