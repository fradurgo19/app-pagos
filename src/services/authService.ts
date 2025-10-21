import { UserProfile } from '../types';
import { API_URL } from '../config';

// Almacenar token en localStorage
const TOKEN_KEY = 'auth_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const authService = {
  async signUp(email: string, password: string, fullName: string, location: string) {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName, location }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear cuenta');
    }

    // Guardar token
    setToken(data.token);

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    };
  },

  async signIn(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    // Guardar token
    setToken(data.token);

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    };
  },

  async signOut() {
    const token = getToken();
    
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }

    removeToken();
  },

  async getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        removeToken();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      removeToken();
      return null;
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          removeToken();
        }
        return null;
      }

      const data = await response.json();

      return {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role as UserProfile['role'],
        department: data.department || undefined,
        location: data.location || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return null;
    }
  },

  async updateProfile(updates: Partial<UserProfile>) {
    const token = getToken();
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: updates.fullName,
        department: updates.department,
        location: updates.location
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al actualizar perfil');
    }
  },

  getAuthToken() {
    return getToken();
  }
};
