'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '@/lib/sound-effects';

export const SoundToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [enabled, setEnabled] = useState<boolean>(() => sounds.isEnabled());

  const handleToggle = () => {
    const next = sounds.toggle();
    setEnabled(next);
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      title={enabled ? 'Mutar efeitos sonoros' : 'Ativar efeitos sonoros'}
      className={`inline-flex items-center justify-center p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 shadow-sm active:scale-95 ${className}`}
    >
      {enabled ? <Volume2 className="w-5 h-5 text-sky-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
    </button>
  );
};
