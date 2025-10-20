import { useState, useEffect } from 'react';
import {
  getVocabularyWithDetails,
  updateVocabularyTerm,
  updateVocabularyMeaning,
  addVocabularyMeaning,
  deleteVocabularyMeaning,
  deleteVocabularyExample,
  addVocabularyExample
} from '../../utils/database';
import type { VocabularyWithDetails, VocabularyMeaningWithExamples } from '../../types';
import './VocabularyDetailModal.css';

interface VocabularyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocabularyId: number;
}

function VocabularyDetailModal({ isOpen, onClose, vocabularyId }: VocabularyDetailModalProps) {
  const [vocabulary, setVocabulary] = useState<VocabularyWithDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTerm, setEditedTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newMeaning, setNewMeaning] = useState('');
  const [newMeaningContext, setNewMeaningContext] = useState('');
  const [isAddingMeaning, setIsAddingMeaning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadVocabulary();
    }
  }, [isOpen, vocabularyId]);

  const loadVocabulary = async () => {
    setIsLoading(true);
    try {
      const vocab = await getVocabularyWithDetails(vocabularyId);
      setVocabulary(vocab);
      setEditedTerm(vocab?.term || '');
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTerm = async () => {
    if (!vocabulary || !editedTerm.trim()) return;

    try {
      await updateVocabularyTerm(vocabulary.id, editedTerm.trim(), vocabulary.language);
      setIsEditing(false);
      await loadVocabulary();
    } catch (error) {
      console.error('Failed to update term:', error);
      alert('Failed to update term');
    }
  };

  const handleUpdateMeaning = async (meaningId: number, meaning: string, context: string) => {
    try {
      await updateVocabularyMeaning(meaningId, meaning, context || undefined);
      await loadVocabulary();
    } catch (error) {
      console.error('Failed to update meaning:', error);
      alert('Failed to update meaning');
    }
  };

  const handleDeleteMeaning = async (meaningId: number) => {
    if (!confirm('Are you sure you want to delete this meaning?')) return;

    try {
      await deleteVocabularyMeaning(meaningId);
      await loadVocabulary();
    } catch (error) {
      console.error('Failed to delete meaning:', error);
      alert('Failed to delete meaning');
    }
  };

  const handleDeleteExample = async (exampleId: number) => {
    if (!confirm('Are you sure you want to delete this example?')) return;

    try {
      await deleteVocabularyExample(exampleId);
      await loadVocabulary();
    } catch (error) {
      console.error('Failed to delete example:', error);
      alert('Failed to delete example');
    }
  };

  const handleAddMeaning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabulary || !newMeaning.trim()) return;

    setIsAddingMeaning(true);
    try {
      await addVocabularyMeaning(
        vocabulary.id,
        newMeaning.trim(),
        newMeaningContext.trim() || undefined
      );
      setNewMeaning('');
      setNewMeaningContext('');
      await loadVocabulary();
    } catch (error) {
      console.error('Failed to add meaning:', error);
      alert('Failed to add meaning');
    } finally {
      setIsAddingMeaning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content vocabulary-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Vocabulary Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {isLoading ? (
          <div className="modal-body">
            <p>Loading...</p>
          </div>
        ) : !vocabulary ? (
          <div className="modal-body">
            <p>Vocabulary not found</p>
          </div>
        ) : (
          <div className="modal-body">
            <div className="vocab-detail-section">
              <div className="vocab-detail-header">
                <span className="vocab-language-badge">{vocabulary.language.toUpperCase()}</span>
                {isEditing ? (
                  <div className="term-edit-controls">
                    <input
                      type="text"
                      className="term-edit-input"
                      value={editedTerm}
                      onChange={(e) => setEditedTerm(e.target.value)}
                      autoFocus
                    />
                    <button className="btn btn-sm btn-primary" onClick={handleSaveTerm}>
                      Save
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => {
                      setIsEditing(false);
                      setEditedTerm(vocabulary.term);
                    }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="term-display">
                    <h3>{vocabulary.term}</h3>
                    <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit term">
                      ✏️
                    </button>
                  </div>
                )}
              </div>

              <div className="vocab-meta">
                <p>Added: {new Date(vocabulary.created_at).toLocaleString()}</p>
                {vocabulary.updated_at !== vocabulary.created_at && (
                  <p>Updated: {new Date(vocabulary.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="meanings-section">
              <h4>Meanings</h4>
              {vocabulary.meanings.length === 0 ? (
                <p className="empty-message">No meanings added yet</p>
              ) : (
                <div className="meanings-list">
                  {vocabulary.meanings.map((meaning) => (
                    <MeaningCard
                      key={meaning.id}
                      meaning={meaning}
                      onUpdate={handleUpdateMeaning}
                      onDelete={handleDeleteMeaning}
                      onDeleteExample={handleDeleteExample}
                    />
                  ))}
                </div>
              )}

              <form onSubmit={handleAddMeaning} className="add-meaning-form">
                <h5>Add New Meaning</h5>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    placeholder="Enter meaning..."
                    value={newMeaning}
                    onChange={(e) => setNewMeaning(e.target.value)}
                    rows={2}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    placeholder="Context (optional)..."
                    value={newMeaningContext}
                    onChange={(e) => setNewMeaningContext(e.target.value)}
                    rows={2}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isAddingMeaning || !newMeaning.trim()}
                >
                  {isAddingMeaning ? 'Adding...' : 'Add Meaning'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MeaningCardProps {
  meaning: VocabularyMeaningWithExamples;
  onUpdate: (meaningId: number, meaning: string, context: string) => void;
  onDelete: (meaningId: number) => void;
  onDeleteExample: (exampleId: number) => void;
}

function MeaningCard({ meaning, onUpdate, onDelete, onDeleteExample }: MeaningCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeaning, setEditedMeaning] = useState(meaning.meaning);
  const [editedContext, setEditedContext] = useState(meaning.context || '');

  const handleSave = () => {
    onUpdate(meaning.id, editedMeaning, editedContext);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMeaning(meaning.meaning);
    setEditedContext(meaning.context || '');
    setIsEditing(false);
  };

  return (
    <div className="meaning-card">
      <div className="meaning-card-header">
        {isEditing ? (
          <div className="meaning-edit-controls">
            <div className="form-group">
              <textarea
                className="form-control"
                value={editedMeaning}
                onChange={(e) => setEditedMeaning(e.target.value)}
                rows={2}
              />
            </div>
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Context (optional)"
                value={editedContext}
                onChange={(e) => setEditedContext(e.target.value)}
                rows={2}
              />
            </div>
            <div className="button-group">
              <button className="btn btn-sm btn-primary" onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-sm btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="meaning-content">
              <p className="meaning-text">{meaning.meaning}</p>
              {meaning.context && (
                <p className="meaning-context">
                  <em>{meaning.context}</em>
                </p>
              )}
            </div>
            <div className="meaning-actions">
              <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit">
                ✏️
              </button>
              <button className="btn-icon" onClick={() => onDelete(meaning.id)} title="Delete">
                🗑️
              </button>
            </div>
          </>
        )}
      </div>

      {meaning.examples.length > 0 && (
        <div className="examples-section">
          <h6>Examples:</h6>
          <ul className="examples-list">
            {meaning.examples.map((example) => (
              <li key={example.id} className="example-item">
                <span className="example-text">{example.example_sentence}</span>
                <button
                  className="btn-icon-small"
                  onClick={() => onDeleteExample(example.id)}
                  title="Delete example"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default VocabularyDetailModal;
