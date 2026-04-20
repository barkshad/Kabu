import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, LayoutDashboard, Vote, ShieldCheck, Settings } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, role } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isLoginPage = location.pathname === '/login';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['student', 'candidate', 'admin_basic', 'admin_super'] },
    { label: 'Vote Now', path: '/booth', icon: Vote, roles: ['student', 'candidate'] },
    { label: 'Admin', path: '/admin', icon: ShieldCheck, roles: ['admin_basic', 'admin_super'] },
    { label: 'System', path: '/admin/advanced', icon: Settings, roles: ['admin_super'] },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-slate-800 relative">
      {/* Header */}
      {!isLoginPage && (
        <header className="bg-kabarak-green text-white shadow-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-kabarak-gold shadow-sm group-hover:scale-105 transition-transform">
                 <span className="text-kabarak-green font-bold text-xl font-serif">K</span>
              </div>
              <div className="hidden md:block">
                <h1 className="font-bold text-lg leading-tight tracking-tight text-white">Kabarak University</h1>
                <p className="text-xs text-kabarak-gold uppercase tracking-widest font-bold">Voting Platform</p>
              </div>
            </Link>
            
            {user && (
              <div className="flex items-center space-x-6">
                <nav className="hidden lg:flex items-center space-x-4">
                  {navItems.filter(item => role && item.roles.includes(role)).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === item.path 
                        ? 'bg-kabarak-gold text-kabarak-green' 
                        : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>

                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex flex-col items-end text-right">
                    <p className="text-sm font-semibold text-white">{profile?.name || 'User'}</p>
                    <p className="text-xs text-kabarak-gold opacity-90 font-medium capitalize">{role?.replace('_', ' ')}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors border border-white/20"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
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
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <div className="mb-4 md:mb-0">
                <p className="font-semibold text-slate-700">Kabarak University Student Council</p>
                <p className="text-xs mt-1">Institutional Excellence for Student Service</p>
              </div>
              <div className="text-center md:text-right">
                <p className="font-medium text-slate-600">&copy; {new Date().getFullYear()} Secure Voting Platform</p>
                <p className="text-xs mt-1 text-kabarak-green font-semibold">Authorized Access Only</p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
