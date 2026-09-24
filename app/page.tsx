'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BelzLogo } from '@/components/BelzLogo';
import { SoundToggle } from '@/components/SoundToggle';
import {
  Smartphone,
  Tv,
  Settings,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Timer,
  Trophy,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim()) {
      setErrorMsg('Digite o código da partida.');
      return;
    }
    router.push(`/join?code=${encodeURIComponent(gameCode.trim().toUpperCase())}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <BelzLogo size="md" />
          <div className="flex items-center gap-3">
            <SoundToggle />
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Painel Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 md:py-16 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Batalha de Conhecimento em Tempo Real</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Competição Simultânea de Quiz da{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              Belz Seguros
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 font-normal leading-relaxed">
            Duas equipes. Dois celulares. Um cronômetro global compartilhado. Cada equipe responde o
            máximo de perguntas que puder de forma <strong className="text-slate-200">100% independente</strong>.
          </p>
        </div>

        {/* Quick Join Box */}
        <div className="mt-8 max-w-md mx-auto w-full">
          <form
            onSubmit={handleQuickJoin}
            className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3"
          >
            <label className="text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center justify-between">
              <span>Tem um código de partida?</span>
              <span className="text-amber-400 font-mono text-[11px]">Ex: BELZ-42</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={gameCode}
                onChange={(e) => {
                  setGameCode(e.target.value.toUpperCase());
                  setErrorMsg('');
                }}
                placeholder="DIGITE O CÓDIGO"
                maxLength={16}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono font-bold tracking-widest text-lg text-white uppercase placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-center"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {errorMsg && (
              <span className="text-rose-400 text-xs text-center font-medium">{errorMsg}</span>
            )}
          </form>
        </div>

        {/* Role Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Player */}
          <Link
            href="/join"
            className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                Entrar como Jogador
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Conecte o smartphone da sua equipe (Equipe A ou Equipe B). Interface veloz feita para toque rápido.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>Ir para a tela de entrada</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: TV Display */}
          <Link
            href="/display"
            className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Tv className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                Painel TV / Telão
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Visualização monumental em 16:9 para projetores ou TVs. Cronômetro global e placar dinâmico em tempo real.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Abrir tela de transmissão</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: Host Admin */}
          <Link
            href="/admin"
            className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                Painel do Administrador
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Crie novas partidas, configure tempo de jogo, importe perguntas customizadas em JSON e comande o início da rodada.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Acessar painel do host</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Core Rules Highlights */}
        <div className="mt-14 border border-slate-800 rounded-2xl p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Regras Fundamentais do BELZ QUIZ</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Timer className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">1 Cronômetro Global</strong>
                <span className="text-slate-400 text-xs">Tempo compartilhado para a partida (ex: 2 min). Não há timer por pergunta.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Avanço Independente</strong>
                <span className="text-slate-400 text-xs">Respondeu, avança imediatamente! Nenhuma equipe espera pela outra.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Users className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Duas Equipes</strong>
                <span className="text-slate-400 text-xs">Equipe A vs Equipe B em disputa direta de conhecimento e velocidade.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Trophy className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">+100 Pontos por Acerto</strong>
                <span className="text-slate-400 text-xs">Vence quem acumular o maior número de pontos ao término do tempo.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} BELZ QUIZ — Grupo Belz • Corretora de Seguros. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
