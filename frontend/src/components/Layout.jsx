import { Bell, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState, memo } from "react";
import Sidebar from "./Sidebar";
import BackendStatusBanner from "./BackendStatusBanner";

const Layout = memo(function Layout({ children }) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full flex overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>

            <div className="flex-1 ml-4 lg:ml-0" />

            <div className="flex items-center gap-4">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors duration-200 hidden sm:block"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-2 sm:gap-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>

                <div className="hidden sm:block min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
          <BackendStatusBanner />
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
});

export default Layout;
