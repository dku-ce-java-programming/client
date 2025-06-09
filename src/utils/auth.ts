import type { User } from "@/types/auth";

const API_BASE_URL = "http://localhost:8080";

export const authApi = {
  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // 로그아웃
  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  // Google OAuth 로그인 리다이렉트
  redirectToGoogleLogin(): void {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },
};
