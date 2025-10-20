import { useState, useEffect } from 'react';
import { createOrGetVocabulary, addVocabularyMeaning, addVocabularyExample } from '../../utils/database';
import type { LanguageCode } from '../../types';
import './AddVocabularyModal.css';

interface AddVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  contextText?: string;
  documentId?: number;
  language: LanguageCode;
}

function AddVocabularyModal({ 
  isOpen, 
  onClose, 
  selectedText, 
  contextText = '',
  documentId,
  language 
}: AddVocabularyModalProps) {
  const [term, setTerm] = useState('');
  const [meaning, setMeaning] = useState('');
  const [context, setContext] = useState('');
  const [useAsExample, setUseAsExample] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // モーダルが開くたびに状態をリセットし、選択されたテキストをTermに設定
  useEffect(() => {
    if (isOpen) {
      setTerm(selectedText); // 選択されたテキストをTermに自動入力
      setMeaning('');
      setContext('');
      setUseAsExample(false);
    }
  }, [isOpen, selectedText]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!term.trim() || !meaning.trim()) {
      alert('Term and meaning are required');
      return;
    }

    if (language === 'none') {
      alert('Please set the source language first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 単語を作成または取得
      const vocabId = await createOrGetVocabulary(term.trim(), language);
      
      // 意味を追加
      const meaningId = await addVocabularyMeaning(
        vocabId,
        meaning.trim(),
        context.trim() || undefined
      );
      
      // 例文として追加する場合
      if (useAsExample && context.trim()) {
        await addVocabularyExample(
          meaningId,
          context.trim(),
          documentId
        );
      }
      
      alert('Vocabulary added successfully!');
      handleClose();
    } catch (error) {
      console.error('Failed to add vocabulary:', error);
      alert('Failed to add vocabulary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // クローズ時はリセット不要（次回開く時にuseEffectでリセットされる）
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content vocabulary-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add to Vocabulary</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="term">Term *</label>
            <input
              id="term"
              type="text"
              className="form-control"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Enter the term"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="meaning">Meaning *</label>
            <textarea
              id="meaning"
              className="form-control"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Enter the meaning or translation"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="context">Context / Example</label>
            <textarea
              id="context"
              className="form-control"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Enter context or example sentence (optional)"
              rows={3}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={useAsExample}
                onChange={(e) => setUseAsExample(e.target.checked)}
              />
              <span>Save context as an example sentence</span>
            </label>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add to Vocabulary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVocabularyModal;
