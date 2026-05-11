import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const toggleLang = () => {
    const next = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-gray-900 hover:text-orange-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.12 4.56a1.5 1.5 0 0 0-2.12 0L9 10.44l-1.06-1.06a1.5 1.5 0 1 0-2.12 2.12l2.12 2.12a1.5 1.5 0 0 0 2.12 0l8.06-8.06a1.5 1.5 0 0 0 0-2.12z"/>
            <path d="M20 12a8 8 0 1 1-8-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          FoodOrder
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <NavLink to="/cart" active={isActive("/cart")} label={t("cart")} icon={<CartIcon />} />
              <NavLink to="/orders" active={isActive("/orders")} label={t("orders")} icon={<OrdersIcon />} />
              <NavLink to="/profile" active={isActive("/profile")} label={t("profile")} icon={<ProfileIcon />} />
              {user.role === "admin" && (
                <NavLink to="/admin" active={isActive("/admin")} label={t("admin")} icon={<AdminIcon />} />
              )}
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                <LogoutIcon />
                <span className="hidden sm:inline">{t("sign_out")}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                {t("sign_in")}
              </Link>
              <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 shadow-sm hover:shadow-md transition-all">
                {t("sign_up")}
              </Link>
            </>
          )}
          <button onClick={toggleLang} className="ml-1 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
            {i18n.language === "en" ? "ع" : "EN"}
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, active, label, icon }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? "text-orange-600 bg-orange-50"
          : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-orange-500 rounded-full" />
      )}
    </Link>
  );
}
