'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { BelzLogo } from '@/components/BelzLogo';
import { GameTimer } from '@/components/GameTimer';
import { SoundToggle } from '@/components/SoundToggle';
import { QRCodeCard } from '@/components/QRCodeCard';
import { subscribeToGame, finishGame } from '@/lib/game-service';
import { GameDoc, TeamId } from '@/lib/types';
import { sounds } from '@/lib/sound-effects';
import {
  Trophy,
  Maximize2,
  Minimize2,
  Users,
  CheckCircle2,
  Activity,
  Flame,
  Zap,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function DisplayPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prevScoreA, setPrevScoreA] = useState(0);
  const [prevScoreB, setPrevScoreB] = useState(0);
  const [animatingA, setAnimatingA] = useState(false);
  const [animatingB, setAnimatingB] = useState(false);

  const prevStatusRef = useRef<string>('WAITING');
  const confettiTriggeredRef = useRef(false);

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(
      gameId,
      (updatedGame) => {
        setLoading(false);
        if (updatedGame) {
          // Detect score increment animations
          if (updatedGame.teamA.score > prevScoreA) {
            setAnimatingA(true);
            setTimeout(() => setAnimatingA(false), 800);
          }
          if (updatedGame.teamB.score > prevScoreB) {
            setAnimatingB(true);
            setTimeout(() => setAnimatingB(false), 800);
          }

          setPrevScoreA(updatedGame.teamA.score);
          setPrevScoreB(updatedGame.teamB.score);

          // Status transition audio & fireworks
          if (prevStatusRef.current !== 'ACTIVE' && updatedGame.status === 'ACTIVE') {
            sounds.playStart();
          }

          if (updatedGame.status === 'FINISHED' && !confettiTriggeredRef.current) {
            confettiTriggeredRef.current = true;
            sounds.playVictory();
            fireVictoryConfetti();
          } else if (updatedGame.status !== 'FINISHED') {
            confettiTriggeredRef.current = false;
          }

          prevStatusRef.current = updatedGame.status;
          setGame(updatedGame);
        } else {
          setGame(null);
        }
      },
      (err) => {
        console.error('Display subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameId, prevScoreA, prevScoreB]);

  const fireVictoryConfetti = () => {
    try {
      const end = Date.now() + 4 * 1000;
      const colors = ['#2563EB', '#38BDF8', '#F59E0B', '#10B981', '#FFFFFF'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.6 },
          colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.6 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (err) {
      console.warn('Confetti error:', err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleTimeUp = async () => {
    if (game?.status === 'ACTIVE') {
      try {
        await finishGame(game.id);
      } catch (err) {
        console.error('Display time-up finish error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-bold tracking-wide">Carregando Telão Belz Quiz...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-center p-6">
        <AlertCircle className="w-16 h-16 text-rose-400 mb-4" />
        <h1 className="text-3xl font-black mb-2">Partida não encontrada</h1>
        <p className="text-slate-400 max-w-md mb-6">
          Verifique o código ou crie uma nova partida no painel do administrador.
        </p>
        <Link
          href="/admin"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg"
        >
          Ir para Painel Admin
        </Link>
      </div>
    );
  }

  const teamA = game.teamA;
  const teamB = game.teamB;
  const accuracyA =
    teamA.answeredCount > 0 ? Math.round((teamA.correctCount / teamA.answeredCount) * 100) : 0;
  const accuracyB =
    teamB.answeredCount > 0 ? Math.round((teamB.correctCount / teamB.answeredCount) * 100) : 0;

  const isLobby = game.status === 'WAITING' || game.status === 'READY';
  const isActive = game.status === 'ACTIVE';
  const isFinished = game.status === 'FINISHED';

  const totalQuestions = game.questions?.length || 30;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 lg:p-8 select-none overflow-x-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-500/5 rounded-full blur-[160px]" />
      </div>

      {/* Top Bar for TV */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-6">
          <BelzLogo size="lg" />
          <div className="hidden md:flex flex-col border-l border-slate-800 pl-6">
            <span className="text-xl font-black text-white tracking-tight">{game.name}</span>
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
              Código:{' '}
              <strong className="text-amber-400 font-black text-sm">{game.code}</strong>
            </span>
          </div>
        </div>

        {/* Status Pill & TV Controls */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
              isActive
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                : isFinished
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : game.status === 'READY'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-current" />
            <span>
              {isActive
                ? 'Partida Ao Vivo'
                : isFinished
                ? 'Partida Encerrada'
                : game.status === 'READY'
                ? 'Equipes Prontas'
                : 'Aguardando Equipes'}
            </span>
          </div>

          <SoundToggle />

          <button
            onClick={toggleFullscreen}
            type="button"
            title="Alternar Tela Cheia"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-sky-400" />
            ) : (
              <Maximize2 className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main TV Arena */}
      <main className="flex-1 my-4 flex flex-col justify-between">
        {/* Synchronized Global Timer in Center */}
        <div className="flex justify-center mb-4">
          <GameTimer
            endsAt={game.endsAt}
            durationSeconds={game.durationSeconds}
            status={game.status}
            onTimeUp={handleTimeUp}
            size="tv"
            enableAudioWarning={true}
          />
        </div>

        {/* -------------------------------------------------------------
            LOBBY WAITING SCREEN (If not started yet)
        -------------------------------------------------------------- */}
        {isLobby && (
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
            {/* Left: QR Code to scan */}
            <div className="flex flex-col items-center justify-center">
              <QRCodeCard code={game.code} gameId={game.id} />
              <p className="text-xs text-slate-400 mt-3 text-center">
                Aponte a câmera do celular para conectar sua equipe instantaneamente.
              </p>
            </div>

            {/* Right: Team Connection Status */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <span>Status de Conexão das Equipes</span>
              </h2>

              {/* Equipe A Slot */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  teamA.connected
                    ? 'bg-blue-950/60 border-blue-500/80 shadow-lg shadow-blue-900/30'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center">
                      A
                    </div>
                    <div>
                      <span className="text-lg font-bold text-white block">{teamA.name}</span>
                      <span className="text-xs text-sky-400 font-semibold">Azul Belz</span>
                    </div>
                  </div>
                  <div>
                    {teamA.connected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Conectada
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">Aguardando celular...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Equipe B Slot */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  teamB.connected
                    ? 'bg-amber-950/60 border-amber-500/80 shadow-lg shadow-amber-900/30'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black text-lg flex items-center justify-center">
                      B
                    </div>
                    <div>
                      <span className="text-lg font-bold text-white block">{teamB.name}</span>
                      <span className="text-xs text-amber-400 font-semibold">Laranja Âmbar</span>
                    </div>
                  </div>
                  <div>
                    {teamB.connected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Conectada
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">Aguardando celular...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-slate-400">
                {game.status === 'READY' ? (
                  <span className="text-emerald-400 font-bold">
                    ✓ Ambas equipes conectadas! O Host pode iniciar a partida a qualquer momento.
                  </span>
                ) : (
                  <span>Conecte os 2 celulares para desbloquear o início da partida.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            ACTIVE MATCH ARENA & FINISHED PODIUM
        -------------------------------------------------------------- */}
        {(isActive || isFinished) && (
          <div className="space-y-6">
            {/* Victory Podium Banner when finished */}
            {isFinished && (
              <div className="max-w-3xl mx-auto w-full text-center bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest mb-3">
                  <Trophy className="w-4 h-4" />
                  <span>Grande Campeã</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {game.winner === 'teamA' ? (
                    <span className="text-sky-400">🏆 {teamA.name} É A VENCEDORA!</span>
                  ) : game.winner === 'teamB' ? (
                    <span className="text-amber-400">🏆 {teamB.name} É A VENCEDORA!</span>
                  ) : (
                    <span className="text-emerald-400">🤝 EMPATE HISTÓRICO!</span>
                  )}
                </h2>

                <p className="text-sm font-semibold text-slate-300 mt-2">
                  {teamA.score} pts ({teamA.correctCount} acertos) vs {teamB.score} pts (
                  {teamB.correctCount} acertos)
                </p>
              </div>
            )}

            {/* Split Screen 2 Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto w-full">
              {/* EQUIPE A (Blue) */}
              <div
                className={`relative bg-slate-900/80 border-2 rounded-3xl p-6 lg:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xl backdrop-blur-md ${
                  teamA.score > teamB.score && isActive
                    ? 'border-blue-500 shadow-blue-500/25 ring-2 ring-blue-500/30'
                    : 'border-blue-700/50'
                } ${animatingA ? 'scale-[1.02] bg-blue-950/70 border-sky-400' : ''}`}
              >
                {/* Team header */}
                <div className="flex items-center justify-between border-b border-blue-900/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                      A
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-black text-white">{teamA.name}</h3>
                      <span className="text-xs uppercase font-bold tracking-wider text-sky-400">
                        Equipe Azul
                      </span>
                    </div>
                  </div>

                  {/* Leader badge */}
                  {teamA.score > teamB.score && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-black uppercase tracking-wider border border-blue-500/40">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Liderando</span>
                    </div>
                  )}
                </div>

                {/* Monumental Score Counter */}
                <div className="my-8 text-center">
                  <span
                    className={`font-mono font-black text-7xl lg:text-8xl tracking-tight transition-all duration-200 block drop-shadow-lg ${
                      animatingA ? 'text-white scale-110' : 'text-sky-400'
                    }`}
                  >
                    {teamA.score}
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-1 block">
                    PONTOS
                  </span>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-3 gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Acertos
                    </span>
                    <strong className="text-2xl font-mono font-black text-emerald-400">
                      {teamA.correctCount}
                    </strong>
                  </div>

                  <div className="text-center border-x border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Respondidas
                    </span>
                    <strong className="text-2xl font-mono font-black text-sky-400">
                      {teamA.answeredCount}
                    </strong>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Precisão
                    </span>
                    <strong className="text-2xl font-mono font-black text-amber-400">
                      {accuracyA}%
                    </strong>
                  </div>
                </div>

                {/* Progress bar showing Independent Question Index */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                    <span>
                      {teamA.currentIndex >= totalQuestions
                        ? 'Banco de Perguntas Concluído!'
                        : `Na Pergunta #${teamA.currentIndex + 1} de ${totalQuestions}`}
                    </span>
                    <span className="font-mono text-sky-400">
                      {Math.min(100, Math.round((teamA.currentIndex / totalQuestions) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (teamA.currentIndex / totalQuestions) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* EQUIPE B (Amber/Orange) */}
              <div
                className={`relative bg-slate-900/80 border-2 rounded-3xl p-6 lg:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xl backdrop-blur-md ${
                  teamB.score > teamA.score && isActive
                    ? 'border-amber-500 shadow-amber-500/25 ring-2 ring-amber-500/30'
                    : 'border-amber-700/50'
                } ${animatingB ? 'scale-[1.02] bg-amber-950/70 border-amber-400' : ''}`}
              >
                {/* Team header */}
                <div className="flex items-center justify-between border-b border-amber-900/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-600/40">
                      B
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-black text-white">{teamB.name}</h3>
                      <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                        Equipe Laranja
                      </span>
                    </div>
                  </div>

                  {/* Leader badge */}
                  {teamB.score > teamA.score && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/40">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Liderando</span>
                    </div>
                  )}
                </div>

                {/* Monumental Score Counter */}
                <div className="my-8 text-center">
                  <span
                    className={`font-mono font-black text-7xl lg:text-8xl tracking-tight transition-all duration-200 block drop-shadow-lg ${
                      animatingB ? 'text-white scale-110' : 'text-amber-400'
                    }`}
                  >
                    {teamB.score}
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-1 block">
                    PONTOS
                  </span>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-3 gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Acertos
                    </span>
                    <strong className="text-2xl font-mono font-black text-emerald-400">
                      {teamB.correctCount}
                    </strong>
                  </div>

                  <div className="text-center border-x border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Respondidas
                    </span>
                    <strong className="text-2xl font-mono font-black text-sky-400">
                      {teamB.answeredCount}
                    </strong>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Precisão
                    </span>
                    <strong className="text-2xl font-mono font-black text-amber-400">
                      {accuracyB}%
                    </strong>
                  </div>
                </div>

                {/* Progress bar showing Independent Question Index */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                    <span>
                      {teamB.currentIndex >= totalQuestions
                        ? 'Banco de Perguntas Concluído!'
                        : `Na Pergunta #${teamB.currentIndex + 1} de ${totalQuestions}`}
                    </span>
                    <span className="font-mono text-amber-400">
                      {Math.min(100, Math.round((teamB.currentIndex / totalQuestions) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-orange-400 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (teamB.currentIndex / totalQuestions) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Activity Ticker */}
            {game.events && game.events.length > 0 && (
              <div className="max-w-4xl mx-auto w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 overflow-hidden shadow-lg">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 shrink-0 border-r border-slate-800 pr-3">
                  <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span>Ao Vivo</span>
                </div>
                <div className="flex-1 overflow-hidden whitespace-nowrap text-xs text-slate-300 font-medium">
                  {game.events.slice(0, 3).map((ev, i) => (
                    <span key={ev.id || i} className="inline-block mr-6 animate-in fade-in">
                      <strong
                        className={
                          ev.teamId === 'teamA' ? 'text-sky-400' : 'text-amber-400'
                        }
                      >
                        {ev.teamName}
                      </strong>
                      : {ev.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer info for TV audience */}
      <footer className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Mecânica simultânea: cada equipe avança de forma 100% autônoma até o tempo esgotar.</span>
        </div>
        <div className="font-mono text-slate-400">
          BELZ QUIZ • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
