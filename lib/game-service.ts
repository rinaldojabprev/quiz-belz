import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  runTransaction,
  limit,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { GameDoc, QuizQuestion, TeamId, MatchEvent } from './types';
import { DEFAULT_BELZ_QUESTIONS } from './default-questions';

export function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function generateShortGameCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BELZ-${random}`;
}

export async function createGame(params: {
  name: string;
  durationSeconds: number;
  questions?: QuizQuestion[];
  customCode?: string;
}): Promise<GameDoc> {
  const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const code = (params.customCode || generateShortGameCode()).toUpperCase().trim();
  const questions = params.questions && params.questions.length > 0 ? params.questions : DEFAULT_BELZ_QUESTIONS;

  const newGame: GameDoc = {
    id: gameId,
    code,
    name: params.name || 'Desafio Belz Quiz',
    status: 'WAITING',
    durationSeconds: params.durationSeconds || 120,
    startedAt: null,
    endsAt: null,
    createdAt: Date.now(),
    winner: null,
    teamA: {
      id: 'teamA',
      name: 'Equipe A',
      connected: false,
      score: 0,
      correctCount: 0,
      answeredCount: 0,
      currentIndex: 0,
      status: 'WAITING',
      lastAnswerAt: null,
      lastFeedback: null,
    },
    teamB: {
      id: 'teamB',
      name: 'Equipe B',
      connected: false,
      score: 0,
      correctCount: 0,
      answeredCount: 0,
      currentIndex: 0,
      status: 'WAITING',
      lastAnswerAt: null,
      lastFeedback: null,
    },
    questions,
    events: [],
  };

  try {
    const docRef = doc(db, 'games', gameId);
    await setDoc(docRef, cleanForFirestore(newGame));
    return newGame;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `games/${gameId}`);
    throw err;
  }
}

export async function findGameByCode(code: string): Promise<GameDoc | null> {
  const cleanCode = code.trim().toUpperCase();
  try {
    const q = query(
      collection(db, 'games'),
      where('code', '==', cleanCode),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as GameDoc;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'games');
    return null;
  }
}

export async function getGame(gameId: string): Promise<GameDoc | null> {
  try {
    const docRef = doc(db, 'games', gameId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as GameDoc;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `games/${gameId}`);
    return null;
  }
}

export function subscribeToGame(
  gameId: string,
  onUpdate: (game: GameDoc | null) => void,
  onError?: (err: Error) => void
): () => void {
  const docRef = doc(db, 'games', gameId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
      } else {
        onUpdate(snap.data() as GameDoc);
      }
    },
    (err) => {
      console.error('Subscription error on game:', gameId, err);
      onError?.(err);
    }
  );
}

export async function joinTeam(gameId: string, teamId: TeamId, customName?: string): Promise<void> {
  const docRef = doc(db, 'games', gameId);
  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(docRef);
      if (!snap.exists()) {
        throw new Error('Partida não encontrada.');
      }
      const data = snap.data() as GameDoc;
      const otherTeamId: TeamId = teamId === 'teamA' ? 'teamB' : 'teamA';
      const otherTeam = data[otherTeamId];

      const updatedTeam = {
        ...data[teamId],
        connected: true,
        name: customName || data[teamId].name || (teamId === 'teamA' ? 'Equipe A' : 'Equipe B'),
        status: data.status === 'ACTIVE' ? 'PLAYING' : 'READY',
      };

      // If both teams are now connected and game is WAITING, move to READY
      let newGameStatus = data.status;
      if (data.status === 'WAITING' && (otherTeam.connected || otherTeam.status === 'READY')) {
        newGameStatus = 'READY';
      }

      transaction.update(docRef, {
        [teamId]: updatedTeam,
        status: newGameStatus,
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `games/${gameId}`);
    throw err;
  }
}

export async function startGame(gameId: string): Promise<void> {
  const docRef = doc(db, 'games', gameId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Partida não encontrada');
    const data = snap.data() as GameDoc;

    const now = Date.now();
    const durationMs = (data.durationSeconds || 120) * 1000;
    const endsAt = now + durationMs;

    const initialEvent: MatchEvent = {
      id: `ev_${now}`,
      teamId: 'teamA',
      teamName: 'Sistema',
      text: 'Partida iniciada! O tempo está correndo!',
      correct: true,
      timestamp: now,
    };

    await updateDoc(docRef, {
      status: 'ACTIVE',
      startedAt: now,
      endsAt,
      winner: null,
      'teamA.status': 'PLAYING',
      'teamB.status': 'PLAYING',
      events: [initialEvent],
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `games/${gameId}`);
    throw err;
  }
}

export async function finishGame(gameId: string): Promise<void> {
  const docRef = doc(db, 'games', gameId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data() as GameDoc;

    if (data.status === 'FINISHED') return; // already finished

    let winner: TeamId | 'TIE' = 'TIE';
    if (data.teamA.score > data.teamB.score) {
      winner = 'teamA';
    } else if (data.teamB.score > data.teamA.score) {
      winner = 'teamB';
    } else {
      // Tie breaker by correct count
      if (data.teamA.correctCount > data.teamB.correctCount) {
        winner = 'teamA';
      } else if (data.teamB.correctCount > data.teamA.correctCount) {
        winner = 'teamB';
      } else {
        winner = 'TIE';
      }
    }

    const finishEvent: MatchEvent = {
      id: `ev_finish_${Date.now()}`,
      teamId: winner === 'teamB' ? 'teamB' : 'teamA',
      teamName: 'Fim de Jogo',
      text: winner === 'TIE' ? 'Partida encerrada em empate!' : `Partida encerrada! Vitória da ${winner === 'teamA' ? data.teamA.name : data.teamB.name}!`,
      correct: true,
      timestamp: Date.now(),
    };

    const currentEvents = data.events || [];
    const updatedEvents = [finishEvent, ...currentEvents].slice(0, 20);

    await updateDoc(docRef, {
      status: 'FINISHED',
      winner,
      'teamA.status': 'FINISHED',
      'teamB.status': 'FINISHED',
      events: updatedEvents,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `games/${gameId}`);
    throw err;
  }
}

export async function resetGame(gameId: string): Promise<void> {
  const docRef = doc(db, 'games', gameId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data() as GameDoc;

    await updateDoc(docRef, {
      status: 'READY',
      startedAt: null,
      endsAt: null,
      winner: null,
      events: [],
      'teamA.score': 0,
      'teamA.correctCount': 0,
      'teamA.answeredCount': 0,
      'teamA.currentIndex': 0,
      'teamA.status': data.teamA.connected ? 'READY' : 'WAITING',
      'teamA.lastFeedback': null,
      'teamA.lastAnswerAt': null,
      'teamB.score': 0,
      'teamB.correctCount': 0,
      'teamB.answeredCount': 0,
      'teamB.currentIndex': 0,
      'teamB.status': data.teamB.connected ? 'READY' : 'WAITING',
      'teamB.lastFeedback': null,
      'teamB.lastAnswerAt': null,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `games/${gameId}`);
    throw err;
  }
}

export async function submitTeamAnswer(params: {
  gameId: string;
  teamId: TeamId;
  questionIndex: number;
  selectedOption: number;
}): Promise<{ isCorrect: boolean; points: number; nextIndex: number; finished: boolean }> {
  const { gameId, teamId, questionIndex, selectedOption } = params;
  const docRef = doc(db, 'games', gameId);

  try {
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error('Partida inexistente');
      const game = snap.data() as GameDoc;

      const now = Date.now();

      // Check game status & time
      if (game.status !== 'ACTIVE') {
        throw new Error('A partida não está ativa.');
      }
      if (game.endsAt && now >= game.endsAt) {
        throw new Error('O tempo da partida acabou!');
      }

      const team = game[teamId];

      // Anti-concurrency guard: Ensure team is still at this exact question index
      if (team.currentIndex !== questionIndex) {
        // Already processed or stale click
        return {
          isCorrect: false,
          points: 0,
          nextIndex: team.currentIndex,
          finished: team.currentIndex >= game.questions.length,
        };
      }

      const currentQuestion = game.questions[questionIndex];
      if (!currentQuestion) {
        return {
          isCorrect: false,
          points: 0,
          nextIndex: questionIndex,
          finished: true,
        };
      }

      const isCorrect = selectedOption === currentQuestion.correctAnswer;
      const pointsToAdd = isCorrect ? (currentQuestion.points || 100) : 0;

      const newScore = team.score + pointsToAdd;
      const newCorrectCount = team.correctCount + (isCorrect ? 1 : 0);
      const newAnsweredCount = team.answeredCount + 1;
      const nextIndex = questionIndex + 1;
      const isTeamFinished = nextIndex >= game.questions.length;

      const newTeamStatus = isTeamFinished ? 'FINISHED' : 'PLAYING';

      // Create live activity event for Display TV
      const newEvent: MatchEvent = {
        id: `ev_${now}_${Math.random().toString(36).substring(2, 6)}`,
        teamId,
        teamName: team.name,
        text: isCorrect
          ? `${team.name} acertou (+${pointsToAdd} pts)!`
          : `${team.name} respondeu.`,
        points: pointsToAdd,
        correct: isCorrect,
        timestamp: now,
      };

      const existingEvents = game.events || [];
      const updatedEvents = [newEvent, ...existingEvents].slice(0, 15);

      const feedback = {
        correct: isCorrect,
        points: pointsToAdd,
        timestamp: now,
      };

      transaction.update(docRef, {
        [`${teamId}.score`]: newScore,
        [`${teamId}.correctCount`]: newCorrectCount,
        [`${teamId}.answeredCount`]: newAnsweredCount,
        [`${teamId}.currentIndex`]: nextIndex,
        [`${teamId}.status`]: newTeamStatus,
        [`${teamId}.lastAnswerAt`]: now,
        [`${teamId}.lastFeedback`]: feedback,
        events: updatedEvents,
      });

      return {
        isCorrect,
        points: pointsToAdd,
        nextIndex,
        finished: isTeamFinished,
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `games/${gameId}`);
    throw err;
  }
}

export async function listRecentGames(): Promise<GameDoc[]> {
  try {
    const q = query(
      collection(db, 'games'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as GameDoc);
  } catch (err) {
    // If indexing is needed or empty, fallback
    console.warn('Error querying recent games:', err);
    return [];
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'games', gameId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `games/${gameId}`);
    throw err;
  }
}
