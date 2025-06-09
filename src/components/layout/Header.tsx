import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router";
import { ProfileDropdown } from "./index";

interface HeaderProps {
  children?: React.ReactNode;
}

function Header({ children }: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBrandClick = () => {
    navigate("/");
  };

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto relative flex items-center p-4">
        {/* 좌측: 브랜드 영역 */}
        <button
          type="button"
          className="flex items-center gap-2 text-lg font-semibold text-gray-800 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
          onClick={handleBrandClick}
        >
          <img src="/globe.png" alt="Globe" className="w-6 h-6" />
          교환학생 후기 검색
        </button>

        {/* 중앙: 페이지별 컨텐츠 - 절대 중앙정렬 */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          {children}
        </div>

        {/* 우측: 프로필 영역 */}
        <div className="flex items-center ml-auto">
          <ProfileDropdown user={user} />
        </div>
      </div>
    </div>
  );
}

export default Header;
