import type { AuthContextType, AuthState } from "@/types/auth";
import { authApi } from "@/utils/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));
      const user = await authApi.getCurrentUser();
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error("인증 확인 오류:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  }, []);

  const login = () => {
    authApi.redirectToGoogleLogin();
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (error) {
      console.error("로그아웃 오류:", error);
      // 로그아웃 실패 시에도 로컬 상태는 초기화
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
