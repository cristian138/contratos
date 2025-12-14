import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SignatureRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    contract_id: '',
    signer_name: '',
    signer_email: '',
    signer_phone: '',
  });
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [requestsRes, contractsRes] = await Promise.all([
        axios.get(`${API}/signature-requests`),
        axios.get(`${API}/contracts`)
      ]);
      setRequests(requestsRes.data);
      setContracts(contractsRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      await axios.post(`${API}/signature-requests`, formData);
      toast.success('Solicitud creada exitosamente');
      setDialogOpen(false);
      setFormData({ contract_id: '', signer_name: '', signer_email: '', signer_phone: '' });
      fetchData();
    } catch (error) {
      toast.error('Error al crear solicitud');
    } finally {
      setCreating(false);
    }
  };

  const handleSendOTP = async (requestId) => {
    try {
      await axios.post(`${API}/signature-requests/send-otp`, { request_id: requestId });
      toast.success('OTP enviado exitosamente');
      fetchData();
    } catch (error) {
      toast.error('Error al enviar OTP');
    }
  };

  const copySignLink = (token) => {
    const link = `${window.location.origin}/sign/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast.success('Enlace copiado al portapapeles');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'secondary', text: 'Pendiente' },
      otp_sent: { variant: 'default', text: 'OTP Enviado' },
      signed: { variant: 'default', text: 'Firmado', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
      rejected: { variant: 'destructive', text: 'Rechazado' },
    };
    const config = variants[status] || variants.pending;
    return <Badge className={config.className} variant={config.variant}>{config.text}</Badge>;
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
      <div data-testid="signature-requests-page" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-blue font-heading">Solicitudes de Firma</h1>
            <p className="text-muted-foreground mt-1">Gestione las solicitudes de firma de contratos</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-request-btn" className="bg-brand-blue hover:bg-brand-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Solicitud de Firma</DialogTitle>
                <DialogDescription>Complete los datos del firmante</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contract">Contrato *</Label>
                  <Select
                    value={formData.contract_id}
                    onValueChange={(value) => setFormData({ ...formData, contract_id: value })}
                  >
                    <SelectTrigger data-testid="contract-select">
                      <SelectValue placeholder="Seleccione un contrato" />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signer_name">Nombre del Firmante *</Label>
                  <Input
                    id="signer_name"
                    data-testid="signer-name-input"
                    value={formData.signer_name}
                    onChange={(e) => setFormData({ ...formData, signer_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signer_email">Email del Firmante *</Label>
                  <Input
                    id="signer_email"
                    data-testid="signer-email-input"
                    type="email"
                    value={formData.signer_email}
                    onChange={(e) => setFormData({ ...formData, signer_email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signer_phone">Teléfono del Firmante (Opcional)</Label>
                  <Input
                    id="signer_phone"
                    data-testid="signer-phone-input"
                    value={formData.signer_phone}
                    onChange={(e) => setFormData({ ...formData, signer_phone: e.target.value })}
                    placeholder="+57 300 1234567"
                  />
                </div>
                <Button
                  data-testid="create-submit-btn"
                  type="submit"
                  className="w-full bg-brand-blue hover:bg-brand-blue/90"
                  disabled={creating}
                >
                  {creating ? 'Creando...' : 'Crear Solicitud'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
              <p className="text-sm text-muted-foreground mb-4">Cree su primera solicitud de firma</p>
              <Button onClick={() => setDialogOpen(true)} className="bg-brand-blue hover:bg-brand-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Solicitud
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} data-testid={`request-card-${request.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{request.signer_name}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{request.signer_email}</p>
                      {request.signer_phone && (
                        <p className="text-sm text-muted-foreground">{request.signer_phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Creado: {new Date(request.created_at).toLocaleString('es-CO')}
                      </p>
                      {request.signed_at && (
                        <p className="text-xs text-green-600 font-medium">
                          Firmado: {new Date(request.signed_at).toLocaleString('es-CO')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {request.status === 'pending' && (
                        <Button
                          data-testid={`send-otp-${request.id}`}
                          onClick={() => handleSendOTP(request.id)}
                          size="sm"
                          className="bg-brand-blue hover:bg-brand-blue/90"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar OTP
                        </Button>
                      )}
                      <Button
                        data-testid={`copy-link-${request.id}`}
                        onClick={() => copySignLink(request.token)}
                        size="sm"
                        variant="outline"
                      >
                        {copiedToken === request.token ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copiar Enlace
                      </Button>
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

export default SignatureRequests;