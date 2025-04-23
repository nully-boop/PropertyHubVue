import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { authApi } from "../services/api";

// Define Laravel user type to match the response structure
interface LaravelUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: LaravelUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<LaravelUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<LaravelUser, Error, RegisterData>;
}

interface LoginData {
  email: string;
  password: string;
}

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string()
}).refine(data => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type RegisterData = z.infer<typeof registerSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<LaravelUser | null>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const userData = await authApi.getCurrentUser() as LaravelUser;
        return userData;
      } catch (error) {
        if ((error as any).status === 401) {
          return null;
        }
        throw error;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      return await authApi.login(credentials);
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["user"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await authApi.register(data);
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["user"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.name}!`,
      });
    },
    onError: (error: Error & { errors?: Record<string, string[]> }) => {
      // Handle Laravel validation errors which come as { errors: { field: [messages] } }
      let errorMessage = error.message || "Could not create account";
      
      if (error.errors) {
        const firstErrorField = Object.keys(error.errors)[0];
        if (firstErrorField && error.errors[firstErrorField]?.[0]) {
          errorMessage = error.errors[firstErrorField][0];
        }
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}