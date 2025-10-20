-- 初期スキーマ: Reading Practice App データベース

-- 1. 文書テーブル
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    source_language TEXT NOT NULL DEFAULT 'en',
    translation_language TEXT NOT NULL DEFAULT 'ja',
    total_study_time INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. 文書内容テーブル
CREATE TABLE IF NOT EXISTS document_contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    source_text TEXT NOT NULL DEFAULT '',
    translation_text TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- 3. 学習セッションテーブル
CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    total_duration INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('active', 'paused', 'completed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- 4. 語彙テーブル
CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL,
    language TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(term, language)
);

-- 5. 意味テーブル
CREATE TABLE IF NOT EXISTS vocabulary_meanings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vocabulary_id INTEGER NOT NULL,
    meaning TEXT NOT NULL,
    context TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE
);

-- 6. 例文テーブル
CREATE TABLE IF NOT EXISTS vocabulary_examples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meaning_id INTEGER NOT NULL,
    example_sentence TEXT NOT NULL,
    document_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (meaning_id) REFERENCES vocabulary_meanings(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);

-- 7. 語彙と文書の関連テーブル
CREATE TABLE IF NOT EXISTS vocabulary_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vocabulary_id INTEGER NOT NULL,
    document_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE(vocabulary_id, document_id)
);

-- 8. 設定テーブル
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_vocabulary_term ON vocabulary(term);
CREATE INDEX IF NOT EXISTS idx_vocabulary_language ON vocabulary(language);
CREATE INDEX IF NOT EXISTS idx_study_sessions_document_id ON study_sessions(document_id);

-- デフォルト設定の挿入
INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('theme', 'system'),
    ('default_source_language', 'en'),
    ('default_translation_language', 'ja');
