import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase, auth } from "../SimpleSupabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  email: string;
  user_metadata?: any;
  [key: string]: any;
};

type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
};

type AuthError = {
  message: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    meta?: { username?: string; avatar_url?: string }
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: {
    username?: string;
    avatar_url?: string;
  }) => Promise<{ error: Error | null }>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const resetPassword = async (email: string) => {
    return auth.resetPasswordForEmail(email);
  };

  const updateProfile = async (updates: {
    username?: string;
    avatar_url?: string;
  }) => {
    try {
      const result = await auth.updateUser({
        data: updates,
      });

      if (result.error) throw result.error;

      const { data } = await auth.getUser();
      setUser(data.user);

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };

  useEffect(() => {
    console.log("AuthContext - inicjalizacja");

    auth.getSession().then(({ data }) => {
      console.log("AuthContext - pobrano sesję:", !!data.session);
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data } = auth.onAuthStateChange((event, session) => {
      console.log("AuthContext - zmiana stanu auth:", event, !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      console.log("AuthContext - próba logowania:", email);
      const result = await auth.signInWithPassword({
        email,
        password,
      });

      if (!result.error) {
        const { data } = await auth.getUser();
        console.log("AuthContext - zalogowano użytkownika:", data.user?.id);
        setUser(data.user);
      } else {
        console.error("AuthContext - błąd logowania:", result.error);
      }

      return result;
    },
    signUp: async (
      email: string,
      password: string,
      meta?: { username?: string; avatar_url?: string }
    ) => {
      console.log(
        "AuthContext - próba rejestracji:",
        email,
        "z metadanymi:",
        meta
      );
      const result = await auth.signUp(email, password, meta);

      if (!result.error) {
        const { data } = await auth.getUser();
        console.log("AuthContext - zarejestrowano użytkownika:", data.user?.id);
        setUser(data.user);
      }

      return result;
    },
    signOut: async () => {
      console.log("AuthContext - wylogowywanie");
      const result = await auth.signOut();
      if (!result.error) {
        setUser(null);
        setSession(null);
      }
      return result;
    },
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
