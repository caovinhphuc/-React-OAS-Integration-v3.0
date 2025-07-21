// Simple Auth Service
export const authService = {
  login: async (credentials) => {
    return {
      data: {
        user: { id: 1, username: credentials.username },
        token: 'fake-jwt-token',
      },
      status: 'success',
    };
  },

  logout: async () => {
    return {
      data: null,
      status: 'success',
    };
  },

  register: async (userData) => {
    return {
      data: {
        user: { id: Date.now(), ...userData },
        token: 'fake-jwt-token',
      },
      status: 'success',
    };
  },

  refreshToken: async () => {
    return {
      data: { token: 'refreshed-jwt-token' },
      status: 'success',
    };
  },

  getCurrentUser: async () => {
    return {
      data: { id: 1, username: 'demo-user' },
      status: 'success',
    };
  },
};

export default authService;
