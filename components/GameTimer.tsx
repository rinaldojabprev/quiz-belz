'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { sounds } from '@/lib/sound-effects';
import { GameStatus } from '@/lib/types';

interface GameTimerProps {
  endsAt: number | null;
  durationSeconds: number;
  status: GameStatus;
  onTimeUp?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'tv';
  className?: string;
  enableAudioWarning?: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  endsAt,
  durationSeconds,
  status,
  onTimeUp,
  size = 'md',
  className = '',
  enableAudioWarning = false,
}) => {
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    if (status === 'FINISHED') return 0;
    if (status === 'ACTIVE' && endsAt) return Math.max(0, endsAt - Date.now());
    return durationSeconds * 1000;
  });

  const warnedRef = useRef<Set<number>>(new Set());
  const finishedTriggeredRef = useRef(false);

  useEffect(() => {
    if (status !== 'ACTIVE' || !endsAt) {
      warnedRef.current.clear();
      finishedTriggeredRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, endsAt - now);
      setRemainingMs(diff);

      const sec = Math.ceil(diff / 1000);
      if (enableAudioWarning && sec <= 5 && sec > 0 && !warnedRef.current.has(sec)) {
        warnedRef.current.add(sec);
        sounds.playWarning();
      }

      if (diff <= 0 && !finishedTriggeredRef.current) {
        finishedTriggeredRef.current = true;
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [endsAt, durationSeconds, status, onTimeUp, enableAudioWarning]);

  // Derived display time
  const currentMs =
    status === 'FINISHED'
      ? 0
      : status !== 'ACTIVE' || !endsAt
      ? durationSeconds * 1000
      : remainingMs;

  const totalSeconds = Math.ceil(currentMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLow = totalSeconds <= 30 && status === 'ACTIVE';
  const isCritical = totalSeconds <= 10 && status === 'ACTIVE';

  if (size === 'tv') {
    return (
      <div
        className={`flex flex-col items-center justify-center select-none ${className}`}
      >
        <div
          className={`flex items-center gap-3 px-8 py-3 rounded-2xl border transition-all duration-300 shadow-2xl ${
            isCritical
              ? 'bg-rose-950/80 border-rose-500/70 text-rose-400 animate-pulse shadow-rose-900/50'
              : isLow
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-amber-900/30'
              : 'bg-slate-900/90 border-slate-700/80 text-white shadow-black/60'
          }`}
        >
          <Clock
            className={`w-10 h-10 ${
              isCritical ? 'text-rose-400 animate-spin' : isLow ? 'text-amber-400' : 'text-sky-400'
            }`}
            style={{ animationDuration: isCritical ? '3s' : undefined }}
          />
          <span className="font-mono text-6xl md:text-7xl lg:text-8xl font-black tracking-tight drop-shadow-md">
            {formattedTime}
          </span>
        </div>
        <span
          className={`text-xs md:text-sm font-semibold tracking-widest uppercase mt-2 ${
            isCritical ? 'text-rose-400 font-bold' : isLow ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          {status === 'ACTIVE'
            ? 'Tempo Restante'
            : status === 'FINISHED'
            ? 'Partida Finalizada'
            : 'Tempo da Partida'}
        </span>
      </div>
    );
  }

  const containerSizes = {
    sm: 'px-3 py-1 text-sm gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-xl gap-2 rounded-xl',
    lg: 'px-6 py-2.5 text-3xl gap-3 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div
      className={`inline-flex items-center font-mono font-bold border transition-colors shadow-sm select-none ${
        containerSizes[size as 'sm' | 'md' | 'lg']
      } ${
        isCritical
          ? 'bg-rose-950/90 border-rose-500 text-rose-400 animate-pulse'
          : isLow
          ? 'bg-amber-950/80 border-amber-500 text-amber-300'
          : 'bg-slate-900/85 border-slate-700 text-white'
      } ${className}`}
    >
      <Clock
        className={`${iconSizes[size as 'sm' | 'md' | 'lg']} ${
          isCritical ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-sky-400'
        }`}
      />
      <span>{formattedTime}</span>
    </div>
  );
};
