import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSearch, CheckCircle2, XCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VerifyIntegrity = () => {
  const navigate = useNavigate();
  const [fileHash, setFileHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const calculateFileHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    toast.info('Calculando hash del archivo...');

    try {
      const hash = await calculateFileHash(file);
      setFileHash(hash);
      toast.success('Hash calculado exitosamente');
    } catch (error) {
      toast.error('Error al calcular hash');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!fileHash) {
      toast.error('Por favor ingrese o calcule un hash');
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/verify-integrity`, { file_hash: fileHash });
      setResult(response.data);
      if (response.data.valid) {
        toast.success(response.data.message);
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      toast.error('Error al verificar integridad');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AdminLayout>
      <div data-testid="verify-integrity-page" className="space-y-6">
        <div className="flex items-center gap-3">
          <FileSearch className="h-8 w-8 text-brand-blue" />
          <div>
            <h1 className="text-3xl font-bold text-brand-blue font-heading">Verificar Integridad</h1>
            <p className="text-muted-foreground mt-1">Valide la autenticidad de documentos mediante hash SHA-256</p>
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileSearch className="h-5 w-5 text-brand-blue mt-0.5" />
              <div>
                <h3 className="font-semibold text-brand-blue">Cómo funciona</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Puede verificar la integridad de un documento de dos formas:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Cargar el archivo PDF para calcular automáticamente su hash SHA-256</li>
                  <li>Ingresar manualmente el hash si ya lo tiene</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  El sistema verificará si el hash corresponde a un documento original o firmado en nuestra base de datos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Verificar Documento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Opción 1: Cargar Archivo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      data-testid="file-upload-input"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      Archivo: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">O</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hash-input">Opción 2: Ingresar Hash Manualmente</Label>
                  <Input
                    id="hash-input"
                    data-testid="hash-input"
                    type="text"
                    value={fileHash}
                    onChange={(e) => setFileHash(e.target.value)}
                    placeholder="Ingrese el hash SHA-256 (64 caracteres hexadecimales)"
                    className="font-mono text-sm"
                  />
                  {fileHash && (
                    <p className="text-xs text-muted-foreground">
                      Longitud: {fileHash.length}/64 caracteres
                    </p>
                  )}
                </div>

                <Button
                  data-testid="verify-submit-btn"
                  type="submit"
                  className="w-full bg-brand-blue hover:bg-brand-blue/90"
                  disabled={verifying || !fileHash}
                >
                  {verifying ? 'Verificando...' : 'Verificar Integridad'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result Display */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Resultado de la Verificación</CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12">
                  <FileSearch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Los resultados aparecerán aquí</p>
                </div>
              ) : (
                <div data-testid="verification-result" className="space-y-6">
                  <div className={`p-6 rounded-lg ${
                    result.valid ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {result.valid ? (
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                      ) : (
                        <XCircle className="h-10 w-10 text-red-600" />
                      )}
                      <div>
                        <h3 className={`text-lg font-bold ${
                          result.valid ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.valid ? 'Documento Válido' : 'Documento No Encontrado'}
                        </h3>
                        <p className={`text-sm ${
                          result.valid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.message}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center py-2 border-t border-current/20">
                        <span className="text-sm font-medium">Estado</span>
                        <span className={`text-sm font-semibold ${
                          result.valid ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.valid ? 'VERIFICADO' : 'NO VERIFICADO'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-current/20">
                        <span className="text-sm font-medium">En el Sistema</span>
                        <span className={`text-sm font-semibold ${
                          result.found_in_system ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.found_in_system ? 'SÍ' : 'NO'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {result.valid && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Significado Legal</h4>
                      <p className="text-xs text-muted-foreground">
                        Este documento ha sido verificado exitosamente. El hash corresponde a un archivo almacenado
                        en nuestro sistema, lo que garantiza su integridad y autenticidad conforme a la normativa
                        colombiana (Ley 527/1999 y Decreto 2364/2012).
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VerifyIntegrity;