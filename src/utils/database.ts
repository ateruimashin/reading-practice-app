import Database from '@tauri-apps/plugin-sql';
import type { 
  Document, 
  DocumentContent, 
  DocumentWithContent,
  Vocabulary,
  VocabularyMeaning,
  VocabularyExample,
  VocabularyWithDetails,
  VocabularyMeaningWithExamples,
  StudySession,
  Settings
} from '../types';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:reading_practice.db');
  }
  return db;
}

// ========================================
// Document operations
// ========================================

export async function getAllDocuments(): Promise<Document[]> {
  const database = await getDatabase();
  return await database.select<Document[]>(
    'SELECT * FROM documents ORDER BY updated_at DESC'
  );
}

export async function getDocumentById(id: number): Promise<DocumentWithContent | null> {
  const database = await getDatabase();
  
  const result = await database.select<Array<Document & { source_text: string; translation_text: string }>>(
    `SELECT d.*, dc.source_text, dc.translation_text 
     FROM documents d 
     LEFT JOIN document_contents dc ON d.id = dc.document_id 
     WHERE d.id = ?`,
    [id]
  );
  
  if (result.length === 0) return null;
  
  return result[0] as DocumentWithContent;
}

export async function createDocument(
  title: string,
  sourceLanguage: string = 'none',
  translationLanguage: string = 'none'
): Promise<number> {
  const database = await getDatabase();
  
  try {
    const result = await database.execute(
      `INSERT INTO documents (title, source_language, translation_language, created_at, updated_at) 
       VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      [title, sourceLanguage, translationLanguage]
    );
    
    console.log('Document created, result:', result);
    
    const docId = Number(result.lastInsertId);
    
    // 空の content も作成
    await database.execute(
      'INSERT INTO document_contents (document_id, source_text, translation_text) VALUES (?, ?, ?)',
      [docId, '', '']
    );
    
    console.log('Document content created for id:', docId);
    
    return docId;
  } catch (error) {
    console.error('Error in createDocument:', error);
    throw error;
  }
}

export async function updateDocument(
  id: number,
  title: string,
  sourceText: string,
  translationText: string,
  sourceLanguage: string,
  translationLanguage: string
): Promise<void> {
  const database = await getDatabase();
  
  await database.execute(
    `UPDATE documents 
     SET title = ?, source_language = ?, translation_language = ?, updated_at = datetime('now') 
     WHERE id = ?`,
    [title, sourceLanguage, translationLanguage, id]
  );
  
  await database.execute(
    `UPDATE document_contents 
     SET source_text = ?, translation_text = ? 
     WHERE document_id = ?`,
    [sourceText, translationText, id]
  );
}

export async function deleteDocument(id: number): Promise<void> {
  const database = await getDatabase();
  await database.execute('DELETE FROM documents WHERE id = ?', [id]);
}

export async function searchDocuments(query: string): Promise<Document[]> {
  const database = await getDatabase();
  return await database.select<Document[]>(
    `SELECT * FROM documents 
     WHERE title LIKE ? 
     ORDER BY updated_at DESC`,
    [`%${query}%`]
  );
}

// ========================================
// Study Session operations
// ========================================

export async function createStudySession(documentId: number): Promise<number> {
  const database = await getDatabase();
  
  try {
    const result = await database.execute(
      `INSERT INTO study_sessions (document_id, started_at, status) 
       VALUES (?, datetime('now'), 'active')`,
      [documentId]
    );
    
    return Number(result.lastInsertId);
  } catch (error) {
    console.error('Error in createStudySession:', error);
    throw error;
  }
}

export async function updateStudySession(
  sessionId: number,
  duration: number,
  status: 'active' | 'paused' | 'completed'
): Promise<void> {
  const database = await getDatabase();
  
  await database.execute(
    `UPDATE study_sessions 
     SET total_duration = ?, status = ?, updated_at = datetime('now') 
     WHERE id = ?`,
    [duration, status, sessionId]
  );
}

export async function completeStudySession(sessionId: number, duration: number): Promise<void> {
  const database = await getDatabase();
  
  try {
    // セッションを完了状態に更新
    await database.execute(
      `UPDATE study_sessions 
       SET total_duration = ?, status = 'completed', ended_at = datetime('now'), updated_at = datetime('now') 
       WHERE id = ?`,
      [duration, sessionId]
    );
    
    // セッション情報を取得
    const session = await database.select<StudySession[]>(
      'SELECT * FROM study_sessions WHERE id = ?',
      [sessionId]
    );
    
    if (session.length > 0) {
      // 文書の total_study_time を更新
      await database.execute(
        `UPDATE documents 
         SET total_study_time = total_study_time + ? 
         WHERE id = ?`,
        [duration, session[0].document_id]
      );
    }
  } catch (error) {
    console.error('Error in completeStudySession:', error);
    throw error;
  }
}

// ========================================
// Vocabulary operations
// ========================================

export async function getAllVocabulary(): Promise<Vocabulary[]> {
  const database = await getDatabase();
  return await database.select<Vocabulary[]>(
    'SELECT * FROM vocabulary ORDER BY created_at DESC'
  );
}

export async function getVocabularyByLanguage(language: string): Promise<Vocabulary[]> {
  const database = await getDatabase();
  return await database.select<Vocabulary[]>(
    'SELECT * FROM vocabulary WHERE language = ? ORDER BY created_at DESC',
    [language]
  );
}

export async function getVocabularyWithDetails(id: number): Promise<VocabularyWithDetails | null> {
  const database = await getDatabase();
  
  const vocabResult = await database.select<Vocabulary[]>(
    'SELECT * FROM vocabulary WHERE id = ?',
    [id]
  );
  
  if (vocabResult.length === 0) return null;
  
  const vocab = vocabResult[0];
  
  const meanings = await database.select<VocabularyMeaning[]>(
    'SELECT * FROM vocabulary_meanings WHERE vocabulary_id = ?',
    [id]
  );
  
  const meaningsWithExamples: VocabularyMeaningWithExamples[] = await Promise.all(
    meanings.map(async (meaning) => {
      const examples = await database.select<VocabularyExample[]>(
        'SELECT * FROM vocabulary_examples WHERE meaning_id = ?',
        [meaning.id]
      );
      return { ...meaning, examples };
    })
  );
  
  return {
    ...vocab,
    meanings: meaningsWithExamples,
  };
}

export async function searchVocabulary(query: string, language?: string): Promise<Vocabulary[]> {
  const database = await getDatabase();
  
  if (language && language !== 'all') {
    return await database.select<Vocabulary[]>(
      'SELECT * FROM vocabulary WHERE term LIKE ? AND language = ? ORDER BY created_at DESC',
      [`%${query}%`, language]
    );
  } else {
    return await database.select<Vocabulary[]>(
      'SELECT * FROM vocabulary WHERE term LIKE ? ORDER BY created_at DESC',
      [`%${query}%`]
    );
  }
}

export async function createOrGetVocabulary(term: string, language: string): Promise<number> {
  const database = await getDatabase();
  
  // 既存チェック
  const existing = await database.select<Vocabulary[]>(
    'SELECT * FROM vocabulary WHERE term = ? AND language = ?',
    [term, language]
  );
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  // 新規作成
  const result = await database.execute(
    'INSERT INTO vocabulary (term, language) VALUES (?, ?)',
    [term, language]
  );
  
  return Number(result.lastInsertId);
}

export async function addVocabularyMeaning(
  vocabularyId: number,
  meaning: string,
  context?: string
): Promise<number> {
  const database = await getDatabase();
  
  const result = await database.execute(
    'INSERT INTO vocabulary_meanings (vocabulary_id, meaning, context) VALUES (?, ?, ?)',
    [vocabularyId, meaning, context || null]
  );
  
  return Number(result.lastInsertId);
}

export async function addVocabularyExample(
  meaningId: number,
  exampleSentence: string,
  documentId?: number
): Promise<number> {
  const database = await getDatabase();
  
  const result = await database.execute(
    'INSERT INTO vocabulary_examples (meaning_id, example_sentence, document_id) VALUES (?, ?, ?)',
    [meaningId, exampleSentence, documentId || null]
  );
  
  return Number(result.lastInsertId);
}

export async function updateVocabularyTerm(
  id: number,
  term: string,
  language: string
): Promise<void> {
  const database = await getDatabase();
  
  await database.execute(
    'UPDATE vocabulary SET term = ?, language = ?, updated_at = datetime("now") WHERE id = ?',
    [term, language, id]
  );
}

export async function updateVocabularyMeaning(
  id: number,
  meaning: string,
  context?: string
): Promise<void> {
  const database = await getDatabase();
  
  await database.execute(
    'UPDATE vocabulary_meanings SET meaning = ?, context = ? WHERE id = ?',
    [meaning, context || null, id]
  );
}

export async function deleteVocabulary(id: number): Promise<void> {
  const database = await getDatabase();
  await database.execute('DELETE FROM vocabulary WHERE id = ?', [id]);
}

export async function deleteVocabularyMeaning(id: number): Promise<void> {
  const database = await getDatabase();
  await database.execute('DELETE FROM vocabulary_meanings WHERE id = ?', [id]);
}

export async function deleteVocabularyExample(id: number): Promise<void> {
  const database = await getDatabase();
  await database.execute('DELETE FROM vocabulary_examples WHERE id = ?', [id]);
}

// ========================================
// Settings operations
// ========================================

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDatabase();
  
  const result = await database.select<Settings[]>(
    'SELECT * FROM settings WHERE key = ?',
    [key]
  );
  
  return result.length > 0 ? result[0].value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  
  await database.execute(
    `INSERT INTO settings (key, value) VALUES (?, ?) 
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')`,
    [key, value, value]
  );
}

// ========================================
// Statistics
// ========================================

export async function getStatistics() {
  const database = await getDatabase();
  
  const documentCount = await database.select<Array<{ count: number }>>(
    'SELECT COUNT(*) as count FROM documents'
  );
  
  const vocabularyCount = await database.select<Array<{ count: number }>>(
    'SELECT COUNT(*) as count FROM vocabulary'
  );
  
  const totalStudyTime = await database.select<Array<{ total: number | null }>>(
    'SELECT SUM(total_study_time) as total FROM documents'
  );
  
  return {
    documentCount: documentCount[0]?.count || 0,
    vocabularyCount: vocabularyCount[0]?.count || 0,
    totalStudyTime: totalStudyTime[0]?.total || 0,
  };
}
