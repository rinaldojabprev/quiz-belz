'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BelzLogo } from '@/components/BelzLogo';
import { SoundToggle } from '@/components/SoundToggle';
import { findGameByCode, joinTeam } from '@/lib/game-service';
import { TeamId, GameDoc } from '@/lib/types';
import { ArrowLeft, AlertCircle, Loader2, Zap } from 'lucide-react';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState(() => searchParams.get('code')?.toUpperCase() || '');
  const [selectedTeam, setSelectedTeam] = useState<TeamId>(() => {
    const t = searchParams.get('team');
    return t === 'teamA' || t === 'teamB' ? t : 'teamA';
  });
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [gamePreview, setGamePreview] = useState<GameDoc | null>(null);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (!codeParam || codeParam.length < 3) return;

    let mounted = true;
    findGameByCode(codeParam.toUpperCase())
      .then((g) => {
        if (mounted) setGamePreview(g);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const handleCodeBlur = async () => {
    const clean = code.trim().toUpperCase();
    if (!clean || clean.length < 3) return;
    setVerifying(true);
    try {
      const g = await findGameByCode(clean);
      setGamePreview(g);
    } catch {
      setGamePreview(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Informe o código da partida.');
      return;
    }

    setLoading(true);
    try {
      const game = await findGameByCode(cleanCode);
      if (!game) {
        setErrorMsg('Partida não encontrada. Verifique o código exibido no telão.');
        setLoading(false);
        return;
      }

      if (game.status === 'FINISHED') {
        setErrorMsg('Esta partida já foi encerrada.');
        setLoading(false);
        return;
      }

      // Join the team
      const finalName = teamName.trim() || (selectedTeam === 'teamA' ? 'Equipe A' : 'Equipe B');
      await joinTeam(game.id, selectedTeam, finalName);

      // Redirect directly to play screen
      router.push(`/play/${game.id}/${selectedTeam}`);
    } catch (err: unknown) {
      console.error('Join error:', err);
      setErrorMsg('Erro ao entrar na partida. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Top bar */}
      <header className="flex items-center justify-between max-w-md mx-auto w-full mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
        <SoundToggle />
      </header>

      {/* Main card */}
      <main className="max-w-md mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center mb-6">
          <BelzLogo size="sm" showSubtitle={false} />
          <h1 className="text-2xl font-black text-white mt-3">Entrar na Partida</h1>
          <p className="text-xs text-slate-400 mt-1">
            Conecte este celular para responder perguntas em tempo real
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Game Code Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Código da Partida
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onBlur={handleCodeBlur}
                placeholder="EX: BELZ-42"
                maxLength={16}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 font-mono text-xl font-black tracking-widest text-amber-400 text-center uppercase placeholder:text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
              {verifying && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                </div>
              )}
            </div>

            {gamePreview && (
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                <span className="font-semibold">{gamePreview.name}</span>
                <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-950">
                  {gamePreview.status === 'ACTIVE' ? 'Partida em Andamento' : 'Aguardando Início'}
                </span>
              </div>
            )}
          </div>

          {/* Team Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Selecione sua Equipe
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Equipe A */}
              <button
                type="button"
                onClick={() => setSelectedTeam('teamA')}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  selectedTeam === 'teamA'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                      selectedTeam === 'teamA'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    A
                  </div>
                  {gamePreview?.teamA.connected && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Ocupada
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-base block text-white">Equipe A</span>
                  <span className="text-[11px] text-blue-400 font-medium">Azul Belz</span>
                </div>
              </button>

              {/* Equipe B */}
              <button
                type="button"
                onClick={() => setSelectedTeam('teamB')}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  selectedTeam === 'teamB'
                    ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                      selectedTeam === 'teamB'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    B
                  </div>
                  {gamePreview?.teamB.connected && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Ocupada
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-base block text-white">Equipe B</span>
                  <span className="text-[11px] text-amber-400 font-medium">Laranja Âmbar</span>
                </div>
              </button>
            </div>
          </div>

          {/* Optional Custom Team Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Nome da Equipe <span className="text-slate-500 font-normal lowercase">(opcional)</span>
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={selectedTeam === 'teamA' ? 'Equipe A' : 'Equipe B'}
              maxLength={30}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-base tracking-wide uppercase shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 ${
              selectedTeam === 'teamA'
                ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-blue-600/30'
                : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-amber-600/30'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Entrar no Jogo</span>
              </>
            )}
          </button>
        </form>
      </main>

      <footer className="text-center text-[11px] text-slate-500 mt-4">
        Ao entrar, seu celular será sincronizado automaticamente com a partida ao vivo.
      </footer>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
