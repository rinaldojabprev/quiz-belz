'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Copy, Check } from 'lucide-react';

interface QRCodeCardProps {
  code: string;
  gameId?: string;
  className?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ code, className = '' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const joinUrl = `${origin}/join?code=${encodeURIComponent(code)}`;

    QRCode.toDataURL(joinUrl, {
      width: 250,
      margin: 1.5,
      color: {
        dark: '#0A192F',
        light: '#FFFFFF',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [code]);

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const joinUrl = `${origin}/join?code=${encodeURIComponent(code)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 flex flex-col items-center text-center shadow-xl backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-2 text-slate-300 font-semibold mb-3 text-sm">
        <QrIcon className="w-4 h-4 text-sky-400" />
        <span>Aponte a câmera do celular</span>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-inner border border-slate-200">
        {dataUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={dataUrl}
            alt={`QR Code para entrar no jogo ${code}`}
            className="w-40 h-40 md:w-48 md:h-48 object-contain rounded-lg"
          />
        ) : (
          <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center text-slate-400">
            Gerando QR Code...
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          Código da Partida
        </span>
        <div className="font-mono text-3xl font-black tracking-widest text-amber-400 bg-slate-950/80 px-4 py-1.5 rounded-lg border border-amber-500/30">
          {code}
        </div>
      </div>

      <button
        onClick={handleCopyLink}
        type="button"
        className="mt-3.5 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Link copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copiar link de entrada</span>
          </>
        )}
      </button>
    </div>
  );
};
