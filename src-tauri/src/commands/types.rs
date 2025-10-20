// 将来的な拡張用の型定義
// 現在はフロントエンドからSQLプラグインを直接使用しているため未使用

#[allow(dead_code)]
use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct Document {
    pub id: i64,
    pub title: String,
    pub source_language: String,
    pub translation_language: String,
    pub total_study_time: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct DocumentContent {
    pub id: i64,
    pub document_id: i64,
    pub source_text: String,
    pub translation_text: String,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct DocumentWithContent {
    #[serde(flatten)]
    pub document: Document,
    pub source_text: String,
    pub translation_text: String,
}

#[allow(dead_code)]
#[derive(Debug, Deserialize)]
pub struct CreateDocumentInput {
    pub title: String,
    pub source_language: String,
    pub translation_language: String,
}

#[allow(dead_code)]
#[derive(Debug, Deserialize)]
pub struct UpdateDocumentInput {
    pub id: i64,
    pub title: String,
    pub source_text: String,
    pub translation_text: String,
    pub source_language: String,
    pub translation_language: String,
}
