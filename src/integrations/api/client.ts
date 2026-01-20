// client.ts - Custom API client for PHP backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async signIn(email: string, password: string) {
    const response = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.session?.access_token) {
      this.setToken(response.data.session.access_token);
      // Dispatch custom event to trigger auth state change
      window.dispatchEvent(new CustomEvent('auth-token-changed'));
    }
    return response;
  }

  async signUp(email: string, password: string, fullName?: string) {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (response.data?.session?.access_token) {
      this.setToken(response.data.session.access_token);
      // Dispatch custom event to trigger auth state change
      window.dispatchEvent(new CustomEvent('auth-token-changed'));
    }
    return response;
  }

  async getUser() {
    return this.request('/auth/user');
  }

  // Table methods
  from(table: string) {
    return new TableQuery(this, table);
  }
}

class TableQuery {
  constructor(private client: ApiClient, private table: string) {}

  async select(columns = '*') {
    const params = new URLSearchParams();
    if (columns !== '*') params.set('select', columns);
    return this.client.request(`/api/${this.table}?${params}`);
  }

  eq(column: string, value: any) {
    this.queryParams.set('eq', `${column},${value}`);
    return this;
  }

  order(column: string) {
    this.queryParams.set('order', column);
    return this;
  }

  single() {
    this.queryParams.set('single', '1');
    return this;
  }

  async execute() {
    const params = new URLSearchParams(this.queryParams);
    return this.client.request(`/api/${this.table}?${params}`);
  }

  private queryParams = new URLSearchParams();

  // For insert, update, delete
  async insert(data: any) {
    return this.client.request(`/api/${this.table}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(data: any) {
    const id = data.id;
    delete data.id;
    return this.client.request(`/api/${this.table}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string) {
    return this.client.request(`/api/${this.table}?id=${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();

// Mock auth object for compatibility
export const auth = {
  signInWithPassword: ({ email, password }: { email: string; password: string }) => api.signIn(email, password),
  signUp: ({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) =>
    api.signUp(email, password, options?.data?.full_name),
  getUser: () => api.getUser(),
  getSession: () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp > Math.floor(Date.now() / 1000)) {
          return Promise.resolve({
            data: {
              session: {
                access_token: token,
                user: {
                  id: payload.user_id,
                  email: payload.email,
                  user_metadata: {
                    full_name: payload.name
                  }
                }
              }
            }
          });
        }
      } catch (e) {
        // Invalid token
      }
    }
    return Promise.resolve({ data: { session: null } });
  },
  signOut: () => {
    api.clearToken();
    // Dispatch custom event to trigger auth state change
    window.dispatchEvent(new CustomEvent('auth-token-changed'));
    return Promise.resolve();
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // Mock implementation - check token on page load and storage changes
    const checkAuthState = () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Try to decode token to check if it's valid
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp > Math.floor(Date.now() / 1000)) {
            // Create session object similar to Supabase
            const session = {
              access_token: token,
              user: {
                id: payload.user_id,
                email: payload.email,
                user_metadata: {
                  full_name: payload.name
                }
              }
            };
            callback('SIGNED_IN', session);
          } else {
            callback('SIGNED_OUT', null);
          }
        } catch (e) {
          callback('SIGNED_OUT', null);
        }
      } else {
        callback('SIGNED_OUT', null);
      }
    };

    // Check immediately
    checkAuthState();

    // Listen for storage changes (when token is set/removed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        checkAuthState();
      }
    };

    // Listen for custom auth token change event
    const handleAuthTokenChange = () => {
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-token-changed', handleAuthTokenChange);

    // Return Supabase-compatible subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-token-changed', handleAuthTokenChange);
          }
        }
      }
    };
  },
};