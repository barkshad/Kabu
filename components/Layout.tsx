import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';

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
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-kabarak-green text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => user ? navigate('/') : navigate('/login')}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-kabarak-gold">
               <span className="text-kabarak-green font-bold text-xl">K</span>
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl leading-none">Kabarak University</h1>
              <p className="text-xs text-kabarak-gold uppercase tracking-wider">Student Council Elections</p>
            </div>
          </div>
          
          {user && !isLoginPage && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-slate-300">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-kabarak-gold text-kabarak-green hover:bg-white hover:text-kabarak-green transition-colors px-4 py-1.5 rounded-full text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Kabarak University Student Council. All rights reserved.</p>
        <p className="mt-1">Secure Voting Platform v1.0</p>
      </footer>
    </div>
  );
};

export default Layout;