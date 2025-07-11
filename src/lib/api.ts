const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = {
  // Usuarios
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
};

export default api;
