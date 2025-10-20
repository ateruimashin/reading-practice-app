// データベースモデルの型定義

export interface Document {
  id: number;
  title: string;
  source_language: string;
  translation_language: string;
  total_study_time: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentContent {
  id: number;
  document_id: number;
  source_text: string;
  translation_text: string;
}

export interface StudySession {
  id: number;
  document_id: number;
  started_at: string;
  ended_at: string | null;
  total_duration: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Vocabulary {
  id: number;
  term: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface VocabularyMeaning {
  id: number;
  vocabulary_id: number;
  meaning: string;
  context: string | null;
  created_at: string;
}

export interface VocabularyExample {
  id: number;
  meaning_id: number;
  example_sentence: string;
  document_id: number | null;
  created_at: string;
}

export interface VocabularyDocument {
  id: number;
  vocabulary_id: number;
  document_id: number;
  created_at: string;
}

export interface Settings {
  id: number;
  key: string;
  value: string;
  updated_at: string;
}

// UI用の拡張型

export interface DocumentWithContent extends Document {
  source_text: string;
  translation_text: string;
}

export interface VocabularyWithDetails extends Vocabulary {
  meanings: VocabularyMeaningWithExamples[];
}

export interface VocabularyMeaningWithExamples extends VocabularyMeaning {
  examples: VocabularyExample[];
}

// 言語コード（noneを追加）
export type LanguageCode = 'none' | 'en' | 'ja' | 'zh' | 'ko' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'ru' | 'other';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'none', name: 'None', nativeName: '-- Select --' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'other', name: 'Other', nativeName: 'Other' },
];

// テーマ
export type Theme = 'light' | 'dark' | 'system';
