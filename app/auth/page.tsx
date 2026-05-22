'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { crearUsuario, obtenerUsuarioPorDNI, setCurrentUser } from '@/lib/store';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulario de registro
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  // Formulario de login
  const [dniLogin, setDniLogin] = useState('');
  const [emailLogin, setEmailLogin] = useState('');

  const validateDNI = (value: string) => {
    return /^\d{8}$/.test(value);
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!nombres.trim() || !apellidos.trim() || !dni || !email.trim() || !telefono.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (!validateDNI(dni)) {
      setError('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) {
      setError('Email inválido');
      return;
    }

    if (!/^\d{9}$/.test(telefono)) {
      setError('El teléfono debe tener 9 dígitos');
      return;
    }

    setLoading(true);
    try {
      const nuevoUsuario = crearUsuario({
        nombres,
        apellidos,
        dni,
        email,
        telefono,
      });

      setSuccess('Cuenta creada exitosamente. Redirigiendo...');
      setTimeout(() => {
        router.push('/evaluacion');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!dniLogin || !emailLogin) {
      setError('DNI y email son requeridos');
      return;
    }

    if (!validateDNI(dniLogin)) {
      setError('DNI inválido');
      return;
    }

    setLoading(true);
    try {
      const usuario = obtenerUsuarioPorDNI(dniLogin);

      if (!usuario || usuario.email !== emailLogin) {
        setError('DNI o email no encontrado');
        return;
      }

      setCurrentUser(usuario);
      setSuccess('Iniciando sesión...');

      setTimeout(() => {
        if (usuario.evaluado) {
          router.push('/dashboard');
        } else {
          router.push('/evaluacion');
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-block bg-primary rounded-lg p-3 mb-4">
            <div className="text-2xl font-bold text-primary-foreground">₡</div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Fiape</h1>
          <p className="text-muted-foreground mt-2">Microcréditos inteligentes para emprendedores</p>
        </div>

        <Card>
          {isLogin ? (
            <>
              <CardHeader>
                <CardTitle>Iniciar sesión</CardTitle>
                <CardDescription>Accede con tu DNI y email</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 rounded-md text-sm">
                      <CheckCircle className="h-4 w-4" />
                      {success}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">DNI</label>
                    <Input
                      type="text"
                      maxLength={8}
                      placeholder="12345678"
                      value={dniLogin}
                      onChange={(e) => setDniLogin(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={emailLogin}
                      onChange={(e) => setEmailLogin(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Cargando...' : 'Iniciar sesión'}
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                  <p className="text-muted-foreground">
                    ¿No tienes cuenta?{' '}
                    <button
                      onClick={() => {
                        setIsLogin(false);
                        setError('');
                        setSuccess('');
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Crear una
                    </button>
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Crear cuenta</CardTitle>
                <CardDescription>Completa tus datos para registrarte</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegistro} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 rounded-md text-sm">
                      <CheckCircle className="h-4 w-4" />
                      {success}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Nombres</label>
                    <Input
                      type="text"
                      placeholder="Juan"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Apellidos</label>
                    <Input
                      type="text"
                      placeholder="Pérez García"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">DNI</label>
                    <Input
                      type="text"
                      maxLength={8}
                      placeholder="12345678"
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <Input
                      type="text"
                      maxLength={9}
                      placeholder="987654321"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    ✓ Estos datos se utilizarán para vincular tu cuenta en Infocorp en caso de falta de pago.
                  </p>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                  <p className="text-muted-foreground">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      onClick={() => {
                        setIsLogin(true);
                        setError('');
                        setSuccess('');
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Fiape © 2024 - Plataforma segura de microcréditos
        </p>
      </div>
    </div>
  );
}
