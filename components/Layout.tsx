import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';
import { LogOut, User, Menu } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = mockSupabase.getCurrentUser();

  const handleLogout = async () => {
    await mockSupabase.signOut();
    navigate('/login');
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-slate-800">
      {/* Header */}
      {!isLoginPage && (
        <header className="bg-kabarak-green/95 backdrop-blur-md text-white shadow-lg sticky top-0 z-50 transition-all duration-300">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => user ? navigate('/dashboard') : navigate('/login')}>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-kabarak-gold shadow-sm group-hover:scale-105 transition-transform">
                 <span className="text-kabarak-green font-bold text-xl font-serif">K</span>
              </div>
              <div className="hidden md:block">
                <h1 className="font-bold text-lg leading-tight tracking-tight">Kabarak University</h1>
                <p className="text-xs text-kabarak-gold uppercase tracking-widest font-bold">Elections 2026</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex flex-col items-end text-right">
                  <p className="text-sm font-semibold text-white">{user.full_name}</p>
                  <p className="text-xs text-kabarak-gold opacity-90 font-medium">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors border border-transparent hover:border-white/30 backdrop-blur-sm"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <div className={`container mx-auto px-4 ${!isLoginPage ? 'py-8' : 'py-0'} flex-grow flex flex-col`}>
          {children}
        </div>
      </main>

      {/* Footer */}
      {!isLoginPage && (
        <footer className="bg-white border-t border-gray-200 text-slate-500 py-8 text-center text-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0 text-left">
                <p className="font-semibold text-slate-700">Kabarak University Student Council</p>
                <p className="text-xs mt-1">Private Bag - 20157, Kabarak</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-600">&copy; 2026 Secure Voting Platform</p>
                <p className="text-xs mt-1 text-kabarak-green font-semibold">Powered by Kabarak ICT</p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;