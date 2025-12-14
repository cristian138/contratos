import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchLogs();
  }, [navigate]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API}/audit-logs`);
      setLogs(response.data);
    } catch (error) {
      toast.error('Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('signed')) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (action.includes('failed')) return <XCircle className="h-5 w-5 text-red-600" />;
    if (action.includes('otp')) return <AlertCircle className="h-5 w-5 text-amber-600" />;
    return <Clock className="h-5 w-5 text-blue-600" />;
  };

  const getActionBadge = (action) => {
    if (action.includes('signed')) return <Badge className="bg-green-100 text-green-700">Firmado</Badge>;
    if (action.includes('created')) return <Badge variant="secondary">Creado</Badge>;
    if (action.includes('otp')) return <Badge className="bg-amber-100 text-amber-700">OTP</Badge>;
    if (action.includes('failed')) return <Badge variant="destructive">Error</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

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
      <div data-testid="audit-logs-page" className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-brand-blue" />
          <div>
            <h1 className="text-3xl font-bold text-brand-blue font-heading">Logs de Auditoría</h1>
            <p className="text-muted-foreground mt-1">Registro inmutable de todas las acciones del sistema</p>
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-brand-blue mt-0.5" />
              <div>
                <h3 className="font-semibold text-brand-blue">Cumplimiento Normativo</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Este registro cumple con los requisitos de trazabilidad establecidos en la Ley 527 de 1999 y el Decreto 2364 de 2012.
                  Cada acción está registrada con marca de tiempo, dirección IP y agente de usuario para garantízar la integridad y no repudio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay registros de auditoría</h3>
              <p className="text-sm text-muted-foreground">Los registros aparecerán aquí a medida que se realicen acciones en el sistema</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id} data-testid={`log-${log.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {getActionIcon(log.action)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActionBadge(log.action)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <p className="text-sm font-mono bg-slate-50 px-3 py-2 rounded">
                        Request ID: {log.request_id}
                      </p>
                      {log.ip_address && (
                        <p className="text-xs text-muted-foreground">
                          IP: {log.ip_address}
                        </p>
                      )}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-brand-blue hover:underline">Ver detalles</summary>
                          <pre className="mt-2 bg-slate-50 p-3 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AuditLogs;