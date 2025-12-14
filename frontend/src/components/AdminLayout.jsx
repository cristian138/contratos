import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, FileSignature, Shield, FileSearch, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/admin/contracts', icon: FileText, label: 'Contratos' },
    { path: '/admin/signature-requests', icon: FileSignature, label: 'Solicitudes' },
    { path: '/admin/audit-logs', icon: Shield, label: 'Auditoría' },
    { path: '/admin/verify', icon: FileSearch, label: 'Verificar' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/assets/logo.png" alt="Jotuns Logo" className="h-10" />
            <div>
              <h1 className="text-xl font-bold text-brand-blue font-heading">Sistema de Firma Electrónica</h1>
              <p className="text-sm text-muted-foreground">Academia Jotuns Club SAS</p>
            </div>
          </div>
          <Button 
            data-testid="logout-button"
            variant="ghost" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-blue text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;