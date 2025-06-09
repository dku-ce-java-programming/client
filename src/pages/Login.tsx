import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router";

function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인된 경우 홈으로 리디렉션
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGoogleLogin = () => {
    login();
  };

  // 로딩 중일 때 로딩 표시
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-background">
        <div
          className="w-full max-w-md flex flex-col items-center justify-center"
          style={{ marginTop: "37vh" }}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background">
      <div
        className="w-full max-w-md flex flex-col items-center justify-center"
        style={{ marginTop: "37vh" }}
      >
        <h1 className="text-3xl font-semibold text-gray-800 mb-10">로그인</h1>
        <div className="w-full px-4">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            size="lg"
            className="w-full h-12 flex items-center justify-center gap-3 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Google Logo</title>
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 로그인
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
