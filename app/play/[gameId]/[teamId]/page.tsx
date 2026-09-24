'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BelzLogo } from '@/components/BelzLogo';
import { GameTimer } from '@/components/GameTimer';
import { SoundToggle } from '@/components/SoundToggle';
import { subscribeToGame, submitTeamAnswer, finishGame } from '@/lib/game-service';
import { GameDoc, TeamId, QuizQuestion } from '@/lib/types';
import { sounds } from '@/lib/sound-effects';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
  Zap,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();

  const gameId = params.gameId as string;
  const teamId = (params.teamId as TeamId) || 'teamA';

  const [game, setGame] = useState<GameDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [localFeedback, setLocalFeedback] = useState<{
    correct: boolean;
    points: number;
    optionIndex: number;
  } | null>(null);

  const prevStatusRef = useRef<string>('WAITING');
  const advancingRef = useRef(false);

  // Subscribe to live game doc
  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(
      gameId,
      (updatedGame) => {
        setLoading(false);
        if (updatedGame) {
          // Play start sound when transitioning to ACTIVE
          if (prevStatusRef.current !== 'ACTIVE' && updatedGame.status === 'ACTIVE') {
            sounds.playStart();
          }
          prevStatusRef.current = updatedGame.status;
          setGame(updatedGame);
        } else {
          setGame(null);
        }
      },
      (err) => {
        console.error('Play subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-10 h-10 animate-spin text-sky-400 mb-4" />
        <p className="text-slate-400 font-semibold tracking-wide">Sincronizando com a partida...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-400 mb-3" />
        <h1 className="text-2xl font-bold">Partida não encontrada</h1>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          O código da partida pode estar incorreto ou a partida foi removida.
        </p>
        <Link
          href="/join"
          className="px-6 py-2.5 rounded-xl bg-slate-800 text-sky-400 hover:text-white border border-slate-700 font-bold text-sm"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const team = game[teamId];
  const isTeamA = teamId === 'teamA';
  const teamColor = isTeamA ? 'blue' : 'amber';
  const teamTheme = isTeamA
    ? {
        badgeBg: 'bg-blue-600/20 text-sky-400 border-blue-500/30',
        activeGlow: 'shadow-blue-500/20',
        btnGrad: 'from-blue-600 to-sky-500',
        accentText: 'text-sky-400',
      }
    : {
        badgeBg: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
        activeGlow: 'shadow-amber-500/20',
        btnGrad: 'from-amber-600 to-orange-500',
        accentText: 'text-amber-400',
      };

  const currentIndex = team.currentIndex;
  const questions = game.questions || [];
  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];
  const isFinishedAllQuestions = currentIndex >= questions.length;
  const isMatchFinished = game.status === 'FINISHED';

  // Handle Answer Selection
  const handleSelectOption = async (optionIndex: number) => {
    if (submitting || advancingRef.current || isMatchFinished || isFinishedAllQuestions) {
      return;
    }

    if (!currentQuestion) return;

    setSubmitting(true);
    setSelectedOption(optionIndex);
    advancingRef.current = true;

    // Check correctness
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const pointsAwarded = isCorrect ? (currentQuestion.points || 100) : 0;

    // Audio cue
    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    // Immediate local visual feedback
    setLocalFeedback({
      correct: isCorrect,
      points: pointsAwarded,
      optionIndex,
    });

    try {
      // Send answer to server/Firestore
      await submitTeamAnswer({
        gameId: game.id,
        teamId,
        questionIndex: currentIndex,
        selectedOption: optionIndex,
      });

      // Brief pause (<250ms) so player sees their tap registration without breaking velocity
      setTimeout(() => {
        setLocalFeedback(null);
        setSelectedOption(null);
        setSubmitting(false);
        advancingRef.current = false;
      }, 240);
    } catch (err) {
      console.error('Answer submission error:', err);
      setSubmitting(false);
      advancingRef.current = false;
    }
  };

  const handleTimeUp = async () => {
    if (game.status === 'ACTIVE') {
      try {
        await finishGame(game.id);
      } catch (err) {
        console.error('Error finishing game on timer:', err);
      }
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: WAITING / READY FOR HOST TO START
  // -------------------------------------------------------------
  if (game.status === 'WAITING' || game.status === 'READY') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
        <header className="flex items-center justify-between">
          <BelzLogo size="sm" showSubtitle={false} />
          <SoundToggle />
        </header>

        <main className="max-w-md mx-auto w-full my-auto text-center space-y-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider ${teamTheme.badgeBg}`}
          >
            <span>{team.name}</span>
          </div>

          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                isTeamA ? 'bg-blue-500' : 'bg-amber-500'
              }`}
            />
            <div
              className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl border ${
                isTeamA
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-amber-600 border-amber-400 text-white'
              }`}
            >
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">✓ Conectado!</h1>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Seu celular está pronto. Aguarde o Host iniciar a partida no painel central.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Duração da Partida
            </div>
            <div className="font-mono text-2xl font-bold text-white">
              {Math.floor(game.durationSeconds / 60)}:
              {String(game.durationSeconds % 60).padStart(2, '0')}
            </div>
            <div className="text-[11px] text-slate-500">
              ⚡ Dica: responda rápido! Ao tocar na alternativa, você avança imediatamente.
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-500">
          Partida: <span className="text-slate-400 font-semibold">{game.name}</span> ({game.code})
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: MATCH FINISHED
  // -------------------------------------------------------------
  if (isMatchFinished) {
    const isWinner = game.winner === teamId;
    const isTie = game.winner === 'TIE';
    const otherTeamId: TeamId = isTeamA ? 'teamB' : 'teamA';
    const otherTeam = game[otherTeamId];
    const accuracy =
      team.answeredCount > 0 ? Math.round((team.correctCount / team.answeredCount) * 100) : 0;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
        <header className="flex items-center justify-between">
          <BelzLogo size="sm" showSubtitle={false} />
          <SoundToggle />
        </header>

        <main className="max-w-md mx-auto w-full my-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider">
            <span>Tempo Esgotado!</span>
          </div>

          {/* Outcome Emblem */}
          <div className="space-y-3">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl border ${
                  isWinner
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-slate-950'
                    : isTie
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-white'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Trophy className="w-12 h-12" />
              </div>
            </div>

            <h1 className="text-3xl font-black text-white">
              {isWinner ? '🏆 VITÓRIA!' : isTie ? 'EMPATE!' : 'FIM DE JOGO'}
            </h1>
            <p className="text-sm font-semibold text-slate-300">
              {team.name}: <strong className="text-amber-400 text-lg">{team.score}</strong> pts
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="text-center p-2 rounded-xl bg-slate-950">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Acertos</span>
              <strong className="text-xl font-mono font-bold text-emerald-400">
                {team.correctCount}
              </strong>
            </div>

            <div className="text-center p-2 rounded-xl bg-slate-950">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Respondidas</span>
              <strong className="text-xl font-mono font-bold text-sky-400">
                {team.answeredCount}
              </strong>
            </div>

            <div className="text-center p-2 rounded-xl bg-slate-950">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Precisão</span>
              <strong className="text-xl font-mono font-bold text-amber-400">{accuracy}%</strong>
            </div>
          </div>

          {/* Opponent comparison */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>{otherTeam.name}</span>
            <span className="font-mono font-bold text-slate-200">
              {otherTeam.score} pts ({otherTeam.correctCount} acertos)
            </span>
          </div>

          <div className="pt-2">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-sky-400" />
              <span>Entrar em Outra Partida</span>
            </Link>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-500">
          Confira o pódio completo e comemoração no telão da TV!
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: TEAM FINISHED ALL QUESTIONS EARLY
  // -------------------------------------------------------------
  if (isFinishedAllQuestions) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
        <header className="flex items-center justify-between">
          <div
            className={`px-3 py-1 rounded-lg border text-xs font-black uppercase ${teamTheme.badgeBg}`}
          >
            {team.name}
          </div>
          <GameTimer
            endsAt={game.endsAt}
            durationSeconds={game.durationSeconds}
            status={game.status}
            onTimeUp={handleTimeUp}
            size="sm"
            enableAudioWarning={true}
          />
        </header>

        <main className="max-w-md mx-auto w-full my-auto text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Você Chegou ao Fim do Banco!
            </h1>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Sua equipe respondeu todas as {questions.length} perguntas disponíveis com velocidade recorde!
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs uppercase font-bold text-slate-400">Pontuação Conquistada</div>
            <div className="font-mono text-5xl font-black text-amber-400">{team.score}</div>
            <div className="text-xs text-emerald-400 font-semibold">
              {team.correctCount} acertos de {team.answeredCount} respondidas
            </div>
          </div>

          <div className="text-xs text-slate-500 animate-pulse">
            Aguardando o cronômetro global da partida encerrar...
          </div>
        </main>

        <footer className="text-center text-xs text-slate-500">
          Fique de olho no telão central da TV!
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 4: ACTIVE PLAYING (CORE SPEED ENGINE)
  // -------------------------------------------------------------
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3.5 md:p-6 select-none touch-manipulation">
      {/* Dynamic Header */}
      <header className="flex items-center justify-between gap-2 max-w-md mx-auto w-full">
        {/* Team identity pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black uppercase ${teamTheme.badgeBg}`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{team.name}</span>
        </div>

        {/* Global Synchronized Countdown Timer */}
        <GameTimer
          endsAt={game.endsAt}
          durationSeconds={game.durationSeconds}
          status={game.status}
          onTimeUp={handleTimeUp}
          size="md"
          enableAudioWarning={true}
        />

        {/* Live Score Counter */}
        <div className="flex flex-col items-end">
          <span className="font-mono font-black text-xl text-amber-400 leading-none">
            {team.score}
          </span>
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
            {team.correctCount} acertos
          </span>
        </div>
      </header>

      {/* Main Question & Rapid Alternative Container */}
      <main className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center my-3 space-y-4">
        {/* Progress Tracker Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>
              Pergunta {currentIndex + 1} de {questions.length}
            </span>
            <span className="text-slate-500 font-mono">
              {Math.round(((currentIndex) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isTeamA ? 'bg-sky-500' : 'bg-amber-500'
              }`}
              style={{
                width: `${Math.min(100, ((currentIndex + 1) / questions.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl min-h-[120px] flex flex-col justify-center relative overflow-hidden">
          {/* Micro feedback banner overlay */}
          {localFeedback && (
            <div
              className={`absolute inset-0 flex items-center justify-center font-black text-xl tracking-wide uppercase transition-all duration-150 z-20 ${
                localFeedback.correct
                  ? 'bg-emerald-600/95 text-white shadow-emerald-500/50'
                  : 'bg-rose-600/95 text-white shadow-rose-500/50'
              }`}
            >
              {localFeedback.correct ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-7 h-7" />
                  <span>✓ CORRETO! +{localFeedback.points}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-7 h-7" />
                  <span>✕ INCORRETO</span>
                </div>
              )}
            </div>
          )}

          {currentQuestion?.category && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 mb-1 block">
              {currentQuestion.category}
            </span>
          )}

          <h2 className="text-lg md:text-xl font-extrabold text-white leading-snug">
            {currentQuestion?.question}
          </h2>
        </div>

        {/* 4 Large Touch Target Alternatives */}
        <div className="grid grid-cols-1 gap-2.5">
          {currentQuestion?.options.map((optionText, idx) => {
            const isSelected = selectedOption === idx;
            const isFeedbackTarget = localFeedback?.optionIndex === idx;

            let btnStyle =
              'bg-slate-900/95 hover:bg-slate-800/95 border-slate-800 text-slate-100 active:scale-[0.98] active:bg-slate-800';

            if (isFeedbackTarget) {
              if (localFeedback?.correct) {
                btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30';
              } else {
                btnStyle = 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30';
              }
            } else if (isSelected) {
              btnStyle = isTeamA
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-amber-600 border-amber-400 text-white';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={submitting}
                className={`w-full min-h-[60px] p-3.5 rounded-xl border text-left font-semibold text-sm md:text-base flex items-center gap-3 transition-all duration-100 shadow-sm ${btnStyle} disabled:cursor-not-allowed`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 border transition-colors ${
                    isFeedbackTarget
                      ? 'bg-white text-slate-900 border-transparent'
                      : isSelected
                      ? 'bg-white text-slate-900 border-transparent'
                      : 'bg-slate-950 text-slate-300 border-slate-700'
                  }`}
                >
                  {optionLetters[idx]}
                </div>
                <span className="flex-1 leading-snug">{optionText}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom status badge */}
      <footer className="max-w-md mx-auto w-full flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Belz Quiz • Resposta Instantânea</span>
        <span className="font-mono text-slate-400">
          Equipe {isTeamA ? 'A' : 'B'} • {team.answeredCount} respondidas
        </span>
      </footer>
    </div>
  );
}
