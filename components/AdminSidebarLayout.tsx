import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, Settings, LogOut } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  isAdminAdvanced?: boolean;
}

const AdminSidebarLayout: React.FC<SidebarLayoutProps> = ({ children, isAdminAdvanced = false }) => {
  const adminLinks = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Candidates', path: '/admin/candidates', icon: Users },
  ];

  const superAdminLinks = [
    { label: 'System Overview', path: '/admin/advanced', icon: ShieldCheck },
    { label: 'Integrity Logs', path: '/admin/logs', icon: Settings },
  ];

  const links = isAdminAdvanced ? superAdminLinks : adminLinks;

  return (
    <div className={`flex min-h-screen ${isAdminAdvanced ? 'bg-neutral-950 text-neutral-100' : 'bg-gray-50 text-gray-900'}`}>
      <aside className={`w-64 border-r ${isAdminAdvanced ? 'border-neutral-800 bg-neutral-900' : 'border-gray-200 bg-white'}`}>
        <div className="p-6 font-bold text-lg tracking-tight">Kabarak Voting System</div>
        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                isActive 
                  ? (isAdminAdvanced ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-gray-900')
                  : (isAdminAdvanced ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminSidebarLayout;
