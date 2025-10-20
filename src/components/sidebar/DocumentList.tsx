import { useState, useEffect } from 'react';
import { getAllDocuments, createDocument, deleteDocument } from '../../utils/database';
import ConfirmModal from '../modals/ConfirmModal';
import type { Document } from '../../types';
import './DocumentList.css';

interface DocumentListProps {
  onDocumentSelect: (id: number | null) => void;
  selectedDocumentId: number | null;
  onCreateDocument?: () => void;
}

function DocumentList({ onDocumentSelect, selectedDocumentId, onCreateDocument }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; documentId: number | null; documentTitle: string }>({
    isOpen: false,
    documentId: null,
    documentTitle: ''
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getAllDocuments();
      console.log('Loaded documents:', docs);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // 親コンポーネントから呼び出せるようにする
  (window as any).reloadDocuments = loadDocuments;

  const handleDeleteClick = (id: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      documentId: id,
      documentTitle: title
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.documentId === null) return;

    try {
      await deleteDocument(deleteConfirm.documentId);
      await loadDocuments();
      if (selectedDocumentId === deleteConfirm.documentId) {
        onDocumentSelect(null);
      }
      setDeleteConfirm({ isOpen: false, documentId: null, documentTitle: '' });
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document: ' + error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, documentId: null, documentTitle: '' });
  };

  const formatDate = (dateString: string): string => {
    // SQLiteのdatetime('now')はUTC時刻を返すため、'Z'を付けてUTCとして扱う
    const date = new Date(dateString + (dateString.endsWith('Z') ? '' : 'Z'));
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatStudyTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const formatLanguage = (lang: string): string => {
    if (!lang || lang === 'none') return '--';
    return lang.toUpperCase();
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="document-list">
      <div className="document-list-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="document-list-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? (
              <>
                <p>No documents found</p>
                <p className="empty-hint">Try a different search term</p>
              </>
            ) : (
              <>
                <p>No documents yet</p>
                <p className="empty-hint">Click "+" to get started</p>
              </>
            )}
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`document-item ${selectedDocumentId === doc.id ? 'selected' : ''}`}
              onClick={() => onDocumentSelect(doc.id)}
            >
              <div className="document-item-header">
                <span className="document-title">{doc.title}</span>
                <button
                  className="btn-delete"
                  onClick={(e) => handleDeleteClick(doc.id, doc.title, e)}
                  title="Delete document"
                >
                  ×
                </button>
              </div>
              <div className="document-item-meta">
                <span className="document-date">{formatDate(doc.updated_at)}</span>
                {doc.total_study_time > 0 && (
                  <span className="document-study-time">
                    ⏱️ {formatStudyTime(doc.total_study_time)}
                  </span>
                )}
              </div>
              <div className="document-item-languages">
                <span className="language-badge">{formatLanguage(doc.source_language)}</span>
                <span className="arrow">→</span>
                <span className="language-badge">{formatLanguage(doc.translation_language)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteConfirm.documentTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />
    </div>
  );
}

export default DocumentList;
