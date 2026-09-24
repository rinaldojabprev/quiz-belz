export type TeamId = 'teamA' | 'teamB';

export type GameStatus = 'WAITING' | 'READY' | 'ACTIVE' | 'FINISHED';

export type TeamStatus = 'WAITING' | 'READY' | 'PLAYING' | 'FINISHED';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  points: number;
  category?: string;
  explanation?: string;
}

export interface TeamData {
  id: TeamId;
  name: string;
  connected: boolean;
  score: number;
  correctCount: number;
  answeredCount: number;
  currentIndex: number;
  status: TeamStatus;
  lastAnswerAt?: number | null;
  lastFeedback?: {
    correct: boolean;
    points: number;
    timestamp: number;
  } | null;
}

export interface MatchEvent {
  id: string;
  teamId: TeamId;
  teamName: string;
  text: string;
  points?: number;
  correct: boolean;
  timestamp: number;
}

export interface GameDoc {
  id: string;
  code: string;
  name: string;
  status: GameStatus;
  durationSeconds: number;
  startedAt: number | null;
  endsAt: number | null;
  createdAt: number;
  winner: TeamId | 'TIE' | null;
  teamA: TeamData;
  teamB: TeamData;
  questions: QuizQuestion[];
  events?: MatchEvent[];
}

export interface AnswerPayload {
  teamId: TeamId;
  questionIndex: number;
  selectedOption: number;
}
