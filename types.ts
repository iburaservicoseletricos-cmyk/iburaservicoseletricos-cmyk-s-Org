
export interface User {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  examType: string;
  joinedAt: string;
  status: 'active' | 'inactive';
  messages?: string[];
  progress?: Record<string, number>; // Mapeia matéria -> quantidade de questões respondidas
  totalStudyTimeSeconds?: number; // Tempo total acumulado em simulados
  profilePicture?: string; // String Base64 da imagem de perfil
}

export interface Question {
  id: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ExamAttempt {
  id: string;
  userCpf: string;
  subject: string;
  score: number;
  total: number;
  date: string;
  examName: string;
  timeSpentSeconds: number;
}

export type AppView = 'LANDING' | 'REGISTER' | 'LOGIN' | 'STUDENT_DASHBOARD' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'SIMULATOR';

export interface AppState {
  view: AppView;
  currentUser: User | null;
  currentSubject: string | null;
  examHistory: ExamAttempt[];
}
