import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { CheckCircle2, Shield, FileText } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SignContract = () => {
  const { token } = useParams();
  const [step, setStep] = useState('loading'); // loading, otp, form, success
  const [request, setRequest] = useState(null);
  const [contract, setContract] = useState(null);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [token]);

  const fetchRequest = async () => {
    try {
      const response = await axios.get(`${API}/signature-requests/token/${token}`);
      setRequest(response.data);

      const contractResponse = await axios.get(`${API}/contracts/${response.data.contract_id}`);
      setContract(contractResponse.data);

      // Initialize form data with empty values
      const initialData = {};
      contractResponse.data.fields.forEach(field => {
        initialData[field.name] = '';
      });
      setFormData(initialData);

      setStep('otp');
    } catch (error) {
      toast.error('Solicitud no encontrada o inválida');
      setStep('error');
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/signature-requests/send-otp`, { request_id: request.id });
      toast.success('Código OTP enviado a su correo electrónico');
    } catch (error) {
      toast.error('Error al enviar OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Por favor ingrese el código completo');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/signature-requests/verify-otp`, {
        request_id: request.id,
        otp: otp
      });

      if (response.data.success) {
        toast.success('Código verificado exitosamente');
        setStep('form');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/signature-requests/sign`, {
        request_id: request.id,
        form_data: formData,
        ip_address: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => 'unknown'),
        user_agent: navigator.userAgent
      });

      toast.success('Contrato firmado exitosamente');
      setStep('success');
    } catch (error) {
      toast.error('Error al firmar contrato');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Enlace Inválido</h2>
            <p className="text-muted-foreground">La solicitud de firma no fue encontrada o ha expirado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/assets/logo.png" alt="Jotuns Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-brand-blue font-heading">Firma de Contrato Electrónico</h1>
          <p className="text-muted-foreground mt-2">Academia Jotuns Club SAS</p>
        </div>

        {/* OTP Step */}
        {step === 'otp' && (
          <Card data-testid="otp-step" className="shadow-legal-paper">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-brand-blue" />
              </div>
              <CardTitle className="text-2xl font-heading">Verificación de Identidad</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Hola, {request?.signer_name}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Para continuar con la firma del contrato, primero debe verificar su identidad mediante un código OTP
                  que será enviado a su correo electrónico: <strong>{request?.signer_email}</strong>
                </p>
              </div>

              <Button
                data-testid="send-otp-btn"
                onClick={handleSendOTP}
                className="w-full bg-brand-blue hover:bg-brand-blue/90"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Código OTP'}
              </Button>

              <div className="space-y-4">
                <Label htmlFor="otp" className="text-center block">Ingrese el código recibido</Label>
                <div className="flex justify-center">
                  <InputOTP
                    data-testid="otp-input"
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                data-testid="verify-otp-btn"
                onClick={handleVerifyOTP}
                variant="outline"
                className="w-full"
                disabled={loading || otp.length !== 6}
              >
                Verificar Código
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form Step */}
        {step === 'form' && (
          <Card data-testid="form-step" className="shadow-legal-paper">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-brand-blue" />
                <div>
                  <CardTitle className="text-2xl font-heading">{contract?.name}</CardTitle>
                  {contract?.description && (
                    <p className="text-sm text-muted-foreground mt-1">{contract.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSign} className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Al completar y firmar este contrato, usted manifiesta su voluntad expresa
                    de aceptar los términos y condiciones establecidos. Este proceso tiene plena validez legal conforme
                    a la Ley 527 de 1999 de Colombia.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Complete los siguientes campos:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contract?.fields.map((field, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={field.name}>{field.name}</Label>
                        <Input
                          id={field.name}
                          data-testid={`field-${index}`}
                          type="text"
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="accept" required className="mt-1" />
                    <label htmlFor="accept" className="text-sm text-muted-foreground">
                      Acepto los términos y condiciones del contrato. Confirmo que he leído y entendido el contenido
                      del documento y manifiesto mi voluntad de firmar electrónicamente.
                    </label>
                  </div>
                </div>

                <Button
                  data-testid="sign-submit-btn"
                  type="submit"
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 py-6 text-lg"
                  disabled={loading}
                >
                  {loading ? 'Firmando...' : 'Firmar Contrato Electrónicamente'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <Card data-testid="success-step" className="shadow-legal-paper">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4 font-heading">¡Contrato Firmado Exitosamente!</h2>
              <p className="text-muted-foreground mb-6">
                Su firma electrónica ha sido registrada correctamente. Recibirá una copia del contrato firmado
                en su correo electrónico.
              </p>
              <div className="bg-slate-50 p-6 rounded-lg text-left max-w-md mx-auto">
                <h3 className="font-semibold mb-3">Detalles de la Firma:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Firmante:</span>
                    <span className="font-medium">{request?.signer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="font-medium">{new Date().toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método:</span>
                    <span className="font-medium">Firma Electrónica OTP</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                Este documento tiene plena validez legal conforme a la Ley 527 de 1999
              </p>
            </CardContent>
          </Card>
        )}

        {/* Legal Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Sistema de Firma Electrónica - Academia Jotuns Club SAS</p>
          <p className="mt-1">Cumplimiento: Ley 527 de 1999 y Decreto 2364 de 2012</p>
        </div>
      </div>
    </div>
  );
};

export default SignContract;