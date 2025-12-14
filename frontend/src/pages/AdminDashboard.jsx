import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, FileSignature, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Contratos',
      value: stats?.total_contracts || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      testId: 'stat-total-contracts'
    },
    {
      title: 'Solicitudes Totales',
      value: stats?.total_requests || 0,
      icon: FileSignature,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      testId: 'stat-total-requests'
    },
    {
      title: 'Pendientes',
      value: stats?.pending_requests || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      testId: 'stat-pending'
    },
    {
      title: 'Firmados',
      value: stats?.signed_requests || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      testId: 'stat-signed'
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div data-testid="admin-dashboard" className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue font-heading">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen del sistema de firma electrónica</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} data-testid={stat.testId} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <h3 className="text-3xl font-bold mt-2 font-heading">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-blue" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Cumplimiento Normativo</span>
                <span className="text-sm text-green-600 font-semibold">Ley 527/1999</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Algoritmo Hash</span>
                <span className="text-sm text-muted-foreground">SHA-256</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Trazabilidad</span>
                <span className="text-sm text-green-600 font-semibold">Activa</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Logs de Auditoría</span>
                <span className="text-sm text-green-600 font-semibold">Inmutables</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                data-testid="quick-contracts-btn"
                onClick={() => navigate('/admin/contracts')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors duration-200 border border-slate-200"
              >
                <p className="font-medium text-sm">Gestionar Contratos</p>
                <p className="text-xs text-muted-foreground mt-1">Cargar y administrar plantillas</p>
              </button>
              <button
                data-testid="quick-requests-btn"
                onClick={() => navigate('/admin/signature-requests')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors duration-200 border border-slate-200"
              >
                <p className="font-medium text-sm">Solicitudes de Firma</p>
                <p className="text-xs text-muted-foreground mt-1">Crear y revisar solicitudes</p>
              </button>
              <button
                data-testid="quick-verify-btn"
                onClick={() => navigate('/admin/verify')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors duration-200 border border-slate-200"
              >
                <p className="font-medium text-sm">Verificar Integridad</p>
                <p className="text-xs text-muted-foreground mt-1">Validar documentos firmados</p>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;