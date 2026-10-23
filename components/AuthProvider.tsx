"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getApiUrl } from "@/lib/api";

export interface Profile {
  _id: string;
  name: string;
  user: string;
  isKid: boolean;
  avatar?: string;
  favoriteMovies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profiles: Profile[];
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  selectedProfile: Profile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  selectProfile: (profileId: string) => void;
  refreshUser: () => Promise<void>;
  // Profile management
  createProfile: (name: string, isKid?: boolean, avatar?: string) => Promise<Profile>;
  updateProfile: (profileId: string, data: Partial<Profile>) => Promise<Profile>;
  deleteProfile: (profileId: string) => Promise<void>;
  fetchProfiles: () => Promise<void>;
  // Password
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  // User profile
  updateUserProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "saintflix_token";
const USER_KEY = "saintflix_user";
const PROFILE_KEY = "saintflix_selected_profile";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar token do localStorage na inicialização
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      const storedProfile = localStorage.getItem(PROFILE_KEY);

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Restaurar perfil selecionado
          if (storedProfile) {
            const profile = parsedUser.profiles.find((p: Profile) => p._id === storedProfile);
            if (profile) {
              setSelectedProfile(profile);
            } else if (parsedUser.profiles.length > 0) {
              // Se perfil não existe mais, selecionar o primeiro
              setSelectedProfile(parsedUser.profiles[0]);
              localStorage.setItem(PROFILE_KEY, parsedUser.profiles[0]._id);
            }
          } else if (parsedUser.profiles.length > 0) {
            setSelectedProfile(parsedUser.profiles[0]);
            localStorage.setItem(PROFILE_KEY, parsedUser.profiles[0]._id);
          }

          // Validar token com o servidor
          await validateToken(storedToken);
        } catch (err) {
          console.error("Erro ao restaurar sessão:", err);
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const validateToken = async (authToken: string) => {
    try {
      const response = await fetch(getApiUrl("/api/auth/me"), {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error("Token inválido");
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch (err) {
      throw err;
    }
  };

  const clearAuth = () => {
    setUser(null);
    setSelectedProfile(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
  };

  const apiCall = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      if (!token) throw new Error("Não autenticado");

      const response = await fetch(getApiUrl(endpoint), {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        clearAuth();
        throw new Error("Sessão expirada");
      }

      return response;
    },
    [token]
  );

  const login = async (email: string, password: string) => {
    const response = await fetch(getApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao fazer login");
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    // Selecionar primeiro perfil automaticamente
    if (data.user.profiles.length > 0) {
      const firstProfile = data.user.profiles[0];
      setSelectedProfile(firstProfile);
      localStorage.setItem(PROFILE_KEY, firstProfile._id);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(getApiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao registrar");
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    if (data.user.profiles.length > 0) {
      const firstProfile = data.user.profiles[0];
      setSelectedProfile(firstProfile);
      localStorage.setItem(PROFILE_KEY, firstProfile._id);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const selectProfile = (profileId: string) => {
    if (user) {
      const profile = user.profiles.find((p) => p._id === profileId);
      if (profile) {
        setSelectedProfile(profile);
        localStorage.setItem(PROFILE_KEY, profileId);
      }
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      await validateToken(token);
    } catch {
      clearAuth();
    }
  };

  // Profile management
  const createProfile = async (name: string, isKid = false, avatar?: string) => {
    const response = await apiCall("/api/auth/profiles", {
      method: "POST",
      body: JSON.stringify({ name, isKid, avatar }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao criar perfil");

    // Atualizar usuário local
    setUser((prev) => (prev ? { ...prev, profiles: [...prev.profiles, data.profile] } : null));
    return data.profile;
  };

  const updateProfile = async (profileId: string, data: Partial<Profile>) => {
    const response = await apiCall(`/api/auth/profiles/${profileId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Erro ao atualizar perfil");

    // Atualizar usuário local
    setUser((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.map((p) => (p._id === profileId ? result.profile : p)),
          }
        : null
    );

    // Atualizar perfil selecionado se for o atual
    if (selectedProfile?._id === profileId) {
      setSelectedProfile(result.profile);
    }

    return result.profile;
  };

  const deleteProfile = async (profileId: string) => {
    const response = await apiCall(`/api/auth/profiles/${profileId}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Erro ao deletar perfil");

    // Atualizar usuário local
    setUser((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.filter((p) => p._id !== profileId),
          }
        : null
    );

    // Se deletou o perfil selecionado, selecionar outro
    if (selectedProfile?._id === profileId) {
      const remainingProfile = user?.profiles.find((p) => p._id !== profileId);
      if (remainingProfile) {
        selectProfile(remainingProfile._id);
      }
    }
  };

  const fetchProfiles = async () => {
    const response = await apiCall("/api/auth/profiles");
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao buscar perfis");

    setUser((prev) => (prev ? { ...prev, profiles: data.profiles } : null));
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await apiCall("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao alterar senha");
  };

  const updateUserProfile = async (data: { name?: string; avatar?: string }) => {
    const response = await apiCall("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Erro ao atualizar perfil");

    setUser((prev) => (prev ? { ...prev, ...result.user } : null));
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...result.user }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        selectedProfile,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        selectProfile,
        refreshUser,
        createProfile,
        updateProfile,
        deleteProfile,
        fetchProfiles,
        changePassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}