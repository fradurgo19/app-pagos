import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, LogOut, Receipt, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../atoms/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Definir opciones del menú según el rol
  const allNavItems = [
    { path: '/', label: 'Panel', icon: LayoutDashboard, roles: ['area_coordinator'] },
    { path: '/bills', label: 'Facturas', icon: FileText, roles: ['area_coordinator'] },
    { path: '/new-bill', label: 'Nueva Factura', icon: PlusCircle, roles: ['area_coordinator', 'basic_user'] },
    { path: '/reports', label: 'Mis Facturas', icon: BarChart3, roles: ['area_coordinator', 'basic_user'] },
    { path: '/users', label: 'Usuarios', icon: Users, roles: ['area_coordinator'] }
  ];

  // Filtrar opciones según el rol del usuario
  const navItems = allNavItems.filter(item => 
    item.roles.includes(profile?.role || 'basic_user')
  );

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-blue-800/50 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-white p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <img 
                  src="https://res.cloudinary.com/dbufrzoda/image/upload/v1750457354/Captura_de_pantalla_2025-06-20_170819_wzmyli.png" 
                  alt="Logo de la Compañía"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="hidden lg:block">
                <span className="text-xl font-bold text-white tracking-tight">Gestión de Facturas</span>
                <p className="text-xs text-blue-300">Control Empresarial</p>
              </div>
            </Link>

            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">{profile?.fullName}</p>
              <p className="text-xs text-blue-200 capitalize">{profile?.role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600/90 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
