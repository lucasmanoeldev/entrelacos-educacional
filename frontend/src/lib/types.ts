export type Template = 'quiz' | 'true-false' | 'flashcards' | 'match' | 'roulette';
export type Answer = { id?: string; text: string; correct: boolean };
export type Question = { id?: string; text: string; explanation: string; answers: Answer[] };
export type Activity = { id: string; title: string; description: string; subject: string; school_year: string; language: string; template: Template; visibility: string; published: boolean; code: string; questions: Question[]; creator_name: string; plays: number; question_count?: number };
export type User = { id: number; name: string; email: string; role: string };
export type GameQuestion = { id: string; text: string; index: number; total: number; answers?: { id: string; text: string }[]; candidate?: string; spun?: boolean; wheel_number?: number; wheel_slots?: number[] };
export type GameResult = { id: string; name: string; score: number; correct: number; total: number; percentage: number; seconds: number; template: Template; ranking: { guest_name: string; score: number }[]; responses: { question_id: string; correct: boolean; seconds: number; points: number }[] };
export const templates: { id: Template; name: string; description: string; symbol: string; color: string }[] = [
  { id: 'quiz', name: 'Quiz', description: 'Uma pergunta, novas descobertas.', symbol: '✦', color: 'purple' },
  { id: 'true-false', name: 'Verdadeiro ou falso', description: 'Pense, decida e aprenda.', symbol: '✓', color: 'green' },
  { id: 'flashcards', name: 'Flashcards', description: 'Vire o cartão. Amplie o saber.', symbol: '▱', color: 'orange' },
  { id: 'match', name: 'Combine os pares', description: 'Conecte ideias e respostas.', symbol: '⌘', color: 'blue' },
  { id: 'roulette', name: 'Roleta', description: 'Gire, descubra e responda.', symbol: '◉', color: 'orange' },
];
export const subjects = ['Ciências', 'Matemática', 'Português', 'História', 'Geografia', 'Inglês', 'Outros'];
