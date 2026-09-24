'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BelzLogo } from '@/components/BelzLogo';
import { SoundToggle } from '@/components/SoundToggle';
import { listRecentGames, findGameByCode } from '@/lib/game-service';
import { GameDoc } from '@/lib/types';
import { Tv, ArrowLeft, ArrowRight, Play, Clock, Users, Loader2 } from 'lucide-react';

export default function DisplayIndexPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentGames, setRecentGames] = useState<GameDoc[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    listRecentGames()
      .then((games) => setRecentGames(games))
      .catch((err) => console.error(err))
      .finally(() => setLoadingList(false));
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const g = await findGameByCode(code.trim().toUpperCase());
      if (g) {
        router.push(`/display/${g.id}`);
      } else {
        setErrorMsg('Partida não encontrada para este código.');
      }
    } catch {
      setErrorMsg('Erro ao buscar partida.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Início</span>
        </Link>
        <BelzLogo size="sm" showSubtitle={false} />
        <SoundToggle />
      </header>

      <main className="max-w-2xl mx-auto w-full my-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
            <Tv className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-white">Painel de TV / Projetor</h1>
          <p className="text-sm text-slate-400">
            Abra a transmissão da partida em tela cheia para a plateia e competidores.
          </p>
        </div>

        {/* Code lookup form */}
        <form
          onSubmit={handleLookup}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
        >
          <label className="text-xs uppercase tracking-wider font-bold text-slate-300 block">
            Código da Partida
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="DIGITE O CÓDIGO (EX: BELZ-42)"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono font-bold text-center tracking-widest text-white uppercase focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Abrir</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          {errorMsg && <p className="text-xs text-rose-400 text-center">{errorMsg}</p>}
        </form>

        {/* Recent matches list */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Partidas Recentes
          </h2>

          {loadingList ? (
            <div className="p-4 text-center text-xs text-slate-500">Carregando partidas...</div>
          ) : recentGames.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
              Nenhuma partida recente encontrada.{' '}
              <Link href="/admin" className="text-sky-400 hover:underline font-semibold">
                Crie uma no Painel Admin
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-2">
              {recentGames.map((g) => (
                <Link
                  key={g.id}
                  href={`/display/${g.id}`}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                        {g.name}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-amber-500/30">
                        {g.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(g.durationSeconds / 60)} min
                      </span>
                      <span>•</span>
                      <span>
                        Status: <strong className="text-slate-300">{g.status}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>Exibir na TV</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500">BELZ QUIZ • Painel de Exibição</footer>
    </div>
  );
}
