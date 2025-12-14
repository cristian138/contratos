import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/admin/login`, { username, password });
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        toast.success(response.data.message);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <img src="/assets/logo.png" alt="Jotuns Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-brand-blue font-heading">Sistema de Firma Electrónica</h1>
          <p className="text-muted-foreground mt-2">Academia Jotuns Club SAS</p>
        </div>

        <Card data-testid="login-card" className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading">Acceso Administrativo</CardTitle>
            <CardDescription>Ingrese sus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  data-testid="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                data-testid="login-submit-button"
                type="submit"
                className="w-full bg-brand-blue hover:bg-brand-blue/90"
                disabled={loading}
              >
                {loading ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    Iniciar Sesión
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Sistema seguro conforme a la Ley 527 de 1999
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;