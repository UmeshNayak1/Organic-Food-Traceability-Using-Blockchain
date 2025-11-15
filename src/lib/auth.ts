// Authentication utility functions

export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const getUser = (): any | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const logout = (): void => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
