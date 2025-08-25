
export enum Role {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string;
}

export enum StudyLevel {
  REGULAR = 'רגילה',
  ADVANCED = 'מוגברת',
}

export enum AppState {
  SETUP = 'SETUP',
  CHAT = 'CHAT',
}

export interface ChatConfig {
    grade: string;
    level: StudyLevel;
    topic: string;
}
