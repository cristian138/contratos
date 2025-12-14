import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', file: null });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchContracts();
  }, [navigate]);

  const fetchContracts = async () => {
    try {
      const response = await axios.get(`${API}/contracts`);
      setContracts(response.data);
    } catch (error) {
      toast.error('Error al cargar contratos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Por favor seleccione un archivo');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description || '');
    data.append('file', formData.file);

    try {
      await axios.post(`${API}/contracts`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Contrato cargado exitosamente');
      setDialogOpen(false);
      setFormData({ name: '', description: '', file: null });
      fetchContracts();
    } catch (error) {
      toast.error('Error al cargar contrato');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (contractId, fileName) => {
    try {
      const response = await axios.get(`${API}/contracts/${contractId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Descarga iniciada');
    } catch (error) {
      toast.error('Error al descargar contrato');
    }
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
      <div data-testid="contracts-page" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-blue font-heading">Contratos</h1>
            <p className="text-muted-foreground mt-1">Gestione las plantillas de contratos</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="upload-contract-btn" className="bg-brand-blue hover:bg-brand-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Cargar Contrato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cargar Nuevo Contrato</DialogTitle>
                <DialogDescription>Suba un archivo PDF con campos AcroForms</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Contrato *</Label>
                  <Input
                    id="name"
                    data-testid="contract-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    data-testid="contract-description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Archivo PDF *</Label>
                  <Input
                    id="file"
                    data-testid="contract-file-input"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    required
                  />
                </div>
                <Button
                  data-testid="upload-submit-btn"
                  type="submit"
                  className="w-full bg-brand-blue hover:bg-brand-blue/90"
                  disabled={uploading}
                >
                  {uploading ? 'Cargando...' : 'Cargar Contrato'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {contracts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay contratos</h3>
              <p className="text-sm text-muted-foreground mb-4">Comience cargando su primera plantilla de contrato</p>
              <Button onClick={() => setDialogOpen(true)} className="bg-brand-blue hover:bg-brand-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Cargar Primer Contrato
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => (
              <Card key={contract.id} data-testid={`contract-card-${contract.id}`} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-brand-blue" />
                  </div>
                  <CardTitle className="mt-4 font-heading">{contract.name}</CardTitle>
                  {contract.description && (
                    <p className="text-sm text-muted-foreground mt-2">{contract.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-2" />
                      {new Date(contract.created_at).toLocaleDateString('es-CO')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                        Hash: {contract.file_hash.substring(0, 16)}...
                      </span>
                    </div>
                    <Button
                      data-testid={`download-contract-${contract.id}`}
                      onClick={() => handleDownload(contract.id, contract.name)}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
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

export default Contracts;