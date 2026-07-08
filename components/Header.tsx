'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Accessibility, Home, LogOut, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NIVELES_CREDITO } from '@/lib/config';
import { getCurrentUser, setCurrentUser } from '@/lib/store';
import { useDaltonicMode } from '@/components/AccessibilityBootstrap';

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export function Header({ titulo }: { titulo: string }) {
  const router = useRouter();
  const { isDaltonic, setIsDaltonic } = useDaltonicMode();
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');

  const handleLogout = () => {
    setCurrentUser(null);
    setIsDaltonic(false);
    window.localStorage.setItem('fiape-daltonic', 'false');
    document.documentElement.setAttribute('data-daltonic', 'false');
    window.dispatchEvent(new Event('storage'));
    router.push('/auth');
  };

  const handleToggleDaltonic = () => {
    setIsDaltonic(!isDaltonic);
  };

  const handleVoiceCommand = () => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setVoiceMessage('Reconocimiento de voz no disponible en este navegador.');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
setVoiceMessage('Di “solicitar préstamo” o “inicio” para continuar.');

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const usuario = getCurrentUser();
      const nivelConfig = usuario ? NIVELES_CREDITO[(usuario.nivelActual || 1) - 1] : null;
      const montoMaximo = nivelConfig?.monto ?? null;

      if (transcript.includes('inicio') || transcript.includes('home')) {
        router.push('/dashboard');
        setVoiceMessage('Volviendo al inicio');
      } else if (transcript.includes('prestamo') || transcript.includes('préstamo') || transcript.includes('solicitar')) {
        const destino = montoMaximo ? `/solicitar-prestamo?autoAmount=${montoMaximo}` : '/solicitar-prestamo';
        router.push(destino);
        setVoiceMessage(
          montoMaximo
            ? `Abriendo solicitud de préstamo con el monto máximo de S/ ${montoMaximo}`
            : 'Abriendo solicitud de préstamo'
        );
      } else {
        setVoiceMessage('No entendí la orden. Prueba con “solicitar préstamo” o “inicio”.');
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setVoiceMessage('No se pudo activar el micrófono.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <header className="border-b border-white/20 bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fiape</h1>
          <p className="text-sm opacity-90">{titulo}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="border-white/70 bg-white/10 text-primary-foreground shadow-sm backdrop-blur-sm hover:bg-white hover:text-primary"
          >
            <Home className="mr-2 h-4 w-4" />
            Inicio
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleDaltonic}
            className="border-white/70 bg-white/10 text-primary-foreground shadow-sm backdrop-blur-sm hover:bg-white hover:text-primary"
          >
            <Accessibility className="mr-2 h-4 w-4" />
            {isDaltonic ? 'Modo daltónico ON' : 'Modo daltónico'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleVoiceCommand}
            disabled={isListening}
            className="border-white/70 bg-white/10 text-primary-foreground shadow-sm backdrop-blur-sm hover:bg-white hover:text-primary disabled:cursor-wait disabled:opacity-80"
          >
            {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            {isListening ? 'Escuchando…' : 'Comando por voz'}
          </Button>

          <Button
            type="button"
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-white/80 bg-white text-primary shadow-sm hover:bg-slate-100 hover:text-primary"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {voiceMessage ? (
        <div className="border-t border-white/15 bg-primary/90 px-4 py-2 text-center text-sm text-primary-foreground/90 sm:px-6 lg:px-8" aria-live="polite">
          {voiceMessage}
        </div>
      ) : null}
    </header>
  );
}
