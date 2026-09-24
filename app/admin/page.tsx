'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BelzLogo } from '@/components/BelzLogo';
import { SoundToggle } from '@/components/SoundToggle';
import { QRCodeCard } from '@/components/QRCodeCard';
import { GameTimer } from '@/components/GameTimer';
import {
  createGame,
  subscribeToGame,
  startGame,
  finishGame,
  resetGame,
  listRecentGames,
  deleteGame,
} from '@/lib/game-service';
import { DEFAULT_BELZ_QUESTIONS } from '@/lib/default-questions';
import { GameDoc, QuizQuestion, TeamId } from '@/lib/types';
import { sounds } from '@/lib/sound-effects';
import {
  Plus,
  Play,
  Square,
  RotateCcw,
  Tv,
  Clock,
  FileCode,
  Trash2,
  Copy,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const [activeGame, setActiveGame] = useState<GameDoc | null>(null);
  const [recentGames, setRecentGames] = useState<GameDoc[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState<'A' | 'B' | null>(null);

  // Modal / Creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMatchName, setNewMatchName] = useState('Desafio Belz Quiz');
  const [newDuration, setNewDuration] = useState<number>(120); // 2 minutes
  const [customCode, setCustomCode] = useState('');
  const [customQuestionsJson, setCustomQuestionsJson] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Load recent games
  const refreshGames = useCallback(async () => {
    try {
      const list = await listRecentGames();
      setRecentGames(list);
      setActiveGame((prev) => prev ?? (list.length > 0 ? list[0] : null));
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    listRecentGames()
      .then((list) => {
        if (!active) return;
        setRecentGames(list);
        setActiveGame((prev) => prev ?? (list.length > 0 ? list[0] : null));
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoadingList(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Subscribe to currently active game
  useEffect(() => {
    if (!activeGame?.id) return;

    const unsubscribe = subscribeToGame(
      activeGame.id,
      (updated) => {
        if (updated) {
          setActiveGame(updated);
        }
      },
      (err) => console.error('Admin game subscription error:', err)
    );

    return () => unsubscribe();
  }, [activeGame?.id]);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setJsonError('');

    let questionsToUse = DEFAULT_BELZ_QUESTIONS;

    if (customQuestionsJson.trim()) {
      try {
        const parsed = JSON.parse(customQuestionsJson);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('O JSON deve ser um array com pelo menos 1 pergunta.');
        }
        for (let i = 0; i < parsed.length; i++) {
          const q = parsed[i];
          if (
            !q.question ||
            !Array.isArray(q.options) ||
            q.options.length < 2 ||
            typeof q.correctAnswer !== 'number'
          ) {
            throw new Error(
              `Pergunta #${i + 1} inválida. Certifique-se de ter "question", "options" (array) e "correctAnswer" (número).`
            );
          }
          if (!q.id) q.id = `custom-q-${i + 1}`;
          if (!q.points) q.points = 100;
        }
        questionsToUse = parsed;
      } catch (err: unknown) {
        setJsonError(err instanceof Error ? err.message : 'JSON inválido');
        setActionLoading(false);
        return;
      }
    }

    try {
      const created = await createGame({
        name: newMatchName.trim() || 'Desafio Belz Quiz',
        durationSeconds: newDuration,
        customCode: customCode.trim() || undefined,
        questions: questionsToUse,
      });

      setActiveGame(created);
      setShowCreateModal(false);
      setCustomQuestionsJson('');
      setCustomCode('');
      sounds.playTick();
      await refreshGames();
    } catch (err) {
      console.error('Error creating game:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!activeGame) return;
    setActionLoading(true);
    try {
      sounds.playStart();
      await startGame(activeGame.id);
    } catch (err) {
      console.error('Error starting game:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishGame = async () => {
    if (!activeGame) return;
    if (!confirm('Deseja realmente encerrar a partida agora?')) return;
    setActionLoading(true);
    try {
      await finishGame(activeGame.id);
    } catch (err) {
      console.error('Error finishing game:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetGame = async () => {
    if (!activeGame) return;
    if (
      !confirm('Deseja reiniciar a pontuação e o cronômetro para uma nova rodada nesta mesma partida?')
    )
      return;
    setActionLoading(true);
    try {
      await resetGame(activeGame.id);
      sounds.playTick();
    } catch (err) {
      console.error('Error resetting game:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm('Excluir esta partida permanentemente?')) return;
    try {
      await deleteGame(id);
      if (activeGame?.id === id) {
        setActiveGame(null);
      }
      await refreshGames();
    } catch (err) {
      console.error('Error deleting game:', err);
    }
  };

  const copyDirectPlayerLink = (teamId: TeamId) => {
    if (!activeGame || typeof window === 'undefined') return;
    const url = `${window.location.origin}/play/${activeGame.id}/${teamId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(teamId === 'teamA' ? 'A' : 'B');
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const handleJsonTemplateDownload = () => {
    const sample = [
      {
        question: 'Qual o prazo padrão para regulação de sinistro após entrega de documentação?',
        options: ['30 dias', '15 dias', '60 dias', '90 dias'],
        correctAnswer: 0,
        points: 100,
        category: 'Regulação',
      },
      {
        question: 'Quem é a entidade garantidora do sistema de previdência complementar fechada?',
        options: ['PREVIC', 'SUSEP', 'BACEN', 'FEBRABAN'],
        correctAnswer: 0,
        points: 100,
        category: 'Previdência',
      },
    ];
    setCustomQuestionsJson(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Link href="/">
            <BelzLogo size="sm" showSubtitle={false} />
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-blue-500/10 text-sky-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            Painel do Host / Administrador
          </span>
        </div>

        <div className="flex items-center gap-3">
          <SoundToggle />
          <button
            onClick={() => setShowCreateModal(true)}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Partida</span>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto w-full my-6 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Match Command Deck (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {activeGame ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6">
              {/* Match Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h1 className="text-2xl font-black text-white">{activeGame.name}</h1>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        activeGame.status === 'ACTIVE'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                          : activeGame.status === 'FINISHED'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : activeGame.status === 'READY'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {activeGame.status === 'ACTIVE'
                        ? 'Partida Ativa'
                        : activeGame.status === 'FINISHED'
                        ? 'Finalizada'
                        : activeGame.status === 'READY'
                        ? 'Pronta p/ Iniciar'
                        : 'Aguardando Equipes'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      Duração:{' '}
                      <strong className="text-slate-200">
                        {Math.floor(activeGame.durationSeconds / 60)}:00
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Banco:{' '}
                      <strong className="text-slate-200">
                        {activeGame.questions?.length || 30} perguntas
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Primary Game Code pill */}
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/30 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Código
                    </span>
                    <span className="font-mono font-black text-xl text-amber-400 tracking-widest">
                      {activeGame.code}
                    </span>
                  </div>

                  <Link
                    href={`/display/${activeGame.id}`}
                    target="_blank"
                    className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs flex flex-col items-center justify-center transition-colors"
                    title="Abrir Telão da TV em nova aba"
                  >
                    <Tv className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] whitespace-nowrap">Telão TV</span>
                  </Link>
                </div>
              </div>

              {/* Host Primary Action Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeGame.status === 'WAITING' || activeGame.status === 'READY' ? (
                  <button
                    onClick={handleStartGame}
                    disabled={actionLoading}
                    type="button"
                    className="sm:col-span-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-lg tracking-wide uppercase shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Play className="w-6 h-6 fill-current" />
                        <span>INICIAR PARTIDA AGORA</span>
                      </>
                    )}
                  </button>
                ) : activeGame.status === 'ACTIVE' ? (
                  <button
                    onClick={handleFinishGame}
                    disabled={actionLoading}
                    type="button"
                    className="sm:col-span-2 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-base tracking-wide uppercase shadow-xl shadow-rose-600/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Square className="w-5 h-5 fill-current" />
                        <span>ENCERRAR PARTIDA</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleResetGame}
                    disabled={actionLoading}
                    type="button"
                    className="sm:col-span-2 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-black text-base tracking-wide uppercase shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="w-5 h-5" />
                        <span>REINICIAR PLACAR E JOGAR DE NOVO</span>
                      </>
                    )}
                  </button>
                )}

                {/* Secondary Reset button if active */}
                {activeGame.status !== 'FINISHED' && (
                  <button
                    onClick={handleResetGame}
                    disabled={actionLoading}
                    type="button"
                    className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4 text-sky-400" />
                    <span>Zerar Partida</span>
                  </button>
                )}
              </div>

              {/* Timer in Admin */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-sky-400" />
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 block">
                      Cronômetro Global da Partida
                    </span>
                    <span className="text-xs text-slate-500">
                      Sincronizado simultaneamente com ambos os celulares e a TV
                    </span>
                  </div>
                </div>

                <GameTimer
                  endsAt={activeGame.endsAt}
                  durationSeconds={activeGame.durationSeconds}
                  status={activeGame.status}
                  size="md"
                />
              </div>

              {/* Team 2-Card Live Telemetry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Equipe A */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-blue-900/60 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                        A
                      </div>
                      <div>
                        <span className="font-bold text-white text-base block">
                          {activeGame.teamA.name}
                        </span>
                        <span className="text-[11px] text-sky-400 font-medium">Equipe Azul</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        activeGame.teamA.connected
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {activeGame.teamA.connected ? '✓ Conectada' : 'Desconectada'}
                    </span>
                  </div>

                  {/* Telemetry numbers */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Pontos
                      </span>
                      <strong className="text-2xl font-mono font-bold text-sky-400">
                        {activeGame.teamA.score}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Acertos
                      </span>
                      <strong className="text-2xl font-mono font-bold text-emerald-400">
                        {activeGame.teamA.correctCount}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Respondidas
                      </span>
                      <strong className="text-2xl font-mono font-bold text-white">
                        {activeGame.teamA.answeredCount}
                      </strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>
                      Progresso: Pergunta #{activeGame.teamA.currentIndex + 1} de{' '}
                      {activeGame.questions?.length || 30}
                    </span>
                    <button
                      onClick={() => copyDirectPlayerLink('teamA')}
                      type="button"
                      className="text-[11px] text-sky-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      {copiedLink === 'A' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Link copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar link Equipe A</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Equipe B */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-amber-900/60 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center text-sm">
                        B
                      </div>
                      <div>
                        <span className="font-bold text-white text-base block">
                          {activeGame.teamB.name}
                        </span>
                        <span className="text-[11px] text-amber-400 font-medium">Equipe Laranja</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        activeGame.teamB.connected
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {activeGame.teamB.connected ? '✓ Conectada' : 'Desconectada'}
                    </span>
                  </div>

                  {/* Telemetry numbers */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Pontos
                      </span>
                      <strong className="text-2xl font-mono font-bold text-amber-400">
                        {activeGame.teamB.score}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Acertos
                      </span>
                      <strong className="text-2xl font-mono font-bold text-emerald-400">
                        {activeGame.teamB.correctCount}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Respondidas
                      </span>
                      <strong className="text-2xl font-mono font-bold text-white">
                        {activeGame.teamB.answeredCount}
                      </strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>
                      Progresso: Pergunta #{activeGame.teamB.currentIndex + 1} de{' '}
                      {activeGame.questions?.length || 30}
                    </span>
                    <button
                      onClick={() => copyDirectPlayerLink('teamB')}
                      type="button"
                      className="text-[11px] text-amber-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      {copiedLink === 'B' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Link copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar link Equipe B</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-sky-400 flex items-center justify-center border border-blue-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Nenhuma Partida Selecionada</h2>
              <p className="text-sm text-slate-400 max-w-sm">
                Crie uma nova partida para iniciar uma dinâmica de perguntas entre duas equipes da Belz.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                type="button"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white shadow-lg shadow-blue-600/30"
              >
                + Criar Primeira Partida
              </button>
            </div>
          )}
        </div>

        {/* Right Column: QR Code + Match History */}
        <div className="space-y-6">
          {/* Quick QR Code for Host Screen */}
          {activeGame && <QRCodeCard code={activeGame.code} gameId={activeGame.id} />}

          {/* Matches List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Partidas Cadastradas
              </h2>
              <span className="text-[11px] font-mono text-slate-500">
                {recentGames.length} partidas
              </span>
            </div>

            {loadingList ? (
              <div className="text-center py-4 text-xs text-slate-500">Carregando lista...</div>
            ) : recentGames.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                Nenhuma partida registrada ainda.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {recentGames.map((g) => {
                  const isCurrent = activeGame?.id === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setActiveGame(g)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-blue-950/60 border-blue-500/80 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <span className="font-bold text-xs text-white block truncate">{g.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono text-amber-400 font-semibold">{g.code}</span>
                          <span>•</span>
                          <span>{Math.floor(g.durationSeconds / 60)} min</span>
                          <span>•</span>
                          <span className="uppercase">{g.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGame(g.id);
                          }}
                          type="button"
                          title="Excluir partida"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* -----------------------------------------------------------------
          CREATE MATCH MODAL
      ------------------------------------------------------------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-black text-white">Criar Nova Partida</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure o nome, tempo total e banco de perguntas para a dinâmica
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGame} className="space-y-4">
              {/* Match Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Nome da Partida
                </label>
                <input
                  type="text"
                  value={newMatchName}
                  onChange={(e) => setNewMatchName(e.target.value)}
                  placeholder="Ex: Desafio Belz Quiz"
                  required
                  maxLength={50}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Match Duration Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Tempo Total da Partida (Cronômetro Global)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '1 min', sec: 60 },
                    { label: '2 min', sec: 120 },
                    { label: '3 min', sec: 180 },
                    { label: '5 min', sec: 300 },
                  ].map((dur) => (
                    <button
                      key={dur.sec}
                      type="button"
                      onClick={() => setNewDuration(dur.sec)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        newDuration === dur.sec
                          ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Custom Short Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Código Curto da Partida{' '}
                  <span className="text-slate-500 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="Deixe em branco para gerar BELZ-XXXX"
                  maxLength={12}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-sm uppercase text-amber-400 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Question Bank Option */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Banco de Perguntas (JSON Customizado)
                  </label>
                  <button
                    type="button"
                    onClick={handleJsonTemplateDownload}
                    className="text-[11px] text-sky-400 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Inserir Modelo JSON</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={customQuestionsJson}
                  onChange={(e) => setCustomQuestionsJson(e.target.value)}
                  placeholder="Deixe em branco para usar as 30 perguntas oficiais da Belz sobre seguros, regulação e cultura corporativa..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />

                {jsonError && (
                  <p className="text-xs text-rose-400 font-medium">{jsonError}</p>
                )}

                <div className="text-[11px] text-slate-500">
                  {customQuestionsJson.trim()
                    ? 'Será utilizado o banco customizado informado acima.'
                    : 'Padrão: 30 perguntas técnicas e de agilidade prontas para a competição.'}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Criar Partida</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 max-w-7xl mx-auto w-full pt-4 border-t border-slate-800/80">
        BELZ QUIZ • Painel de Controle de Partidas em Tempo Real
      </footer>
    </div>
  );
}
