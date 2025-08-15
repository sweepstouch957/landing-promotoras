const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://backend-promotoras.onrender.com/api';

export const api = {
  // Usuarios
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createUser: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return response.json();
  },

  getTodayUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users/today`);
    return response.json();
  },

  approveUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/approve`, {
      method: 'POST',
    });
    return response.json();
  },

  deleteUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  getApprovedUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users/approved`);
    return response.json();
  },

  deleteApprovedUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/approved/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar usuario aprobado');
    }

    return data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importUsers: async (users: any[]) => {
    const response = await fetch(`${API_BASE_URL}/users/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users }),
    });
    return response.json();
  },

  // Validar usuario por email
  getUserByEmail: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
    if (response.status === 404) {
      return null; // Usuario no encontrado
    }
    return response.json();
  },

  // Actualizar foto del usuario
  updateUserPhoto: async (email: string, photoUrl: string) => {
    const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}/photo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoUrl }),
    });
    return response.json();
  },

  // Actualizar estado de video visto
  updateUserVideoStatus: async (email: string, videoWatched: boolean) => {
    const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}/video`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoWatched }),
    });
    return response.json();
  },

  // Obtener usuario por token único
  getUserByToken: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/token/${encodeURIComponent(token)}`);
    if (response.status === 404) {
      return null; // Usuario no encontrado
    }
    return response.json();
  },

  // Generar token único para usuario
  generateUserToken: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}/generate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Obtener todos los usuarios con tokens para envío masivo
  getUsersWithTokens: async () => {
    const response = await fetch(`${API_BASE_URL}/users/with-tokens`);
    return response.json();
  },

  // Actualizar foto del usuario por token
  updateUserPhotoByToken: async (token: string, photoUrl: string) => {
    const response = await fetch(`${API_BASE_URL}/users/token/${encodeURIComponent(token)}/photo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoUrl }),
    });
    return response.json();
  },

  // Actualizar estado de video visto por token
  updateUserVideoStatusByToken: async (token: string, videoWatched: boolean) => {
    const response = await fetch(`${API_BASE_URL}/users/token/${encodeURIComponent(token)}/video`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoWatched }),
    });
    return response.json();
  },
};

export default api;
