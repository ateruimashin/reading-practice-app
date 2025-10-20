import { useState, useEffect } from 'react';
import { getAllVocabulary, searchVocabulary, deleteVocabulary } from '../../utils/database';
import { LANGUAGES } from '../../types';
import type { Vocabulary, LanguageCode } from '../../types';
import './VocabularyTab.css';

interface VocabularyTabProps {
  onVocabularySelect: (id: number) => void;
}

function VocabularyTab({ onVocabularySelect }: VocabularyTabProps) {
  const [vocabularyList, setVocabularyList] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  useEffect(() => {
    loadVocabulary();
  }, [selectedLanguage]);

  const loadVocabulary = async () => {
    try {
      setLoading(true);
      let vocabs: Vocabulary[];
      
      if (searchQuery) {
        vocabs = await searchVocabulary(searchQuery, selectedLanguage);
      } else if (selectedLanguage === 'all') {
        vocabs = await getAllVocabulary();
      } else {
        vocabs = await searchVocabulary('', selectedLanguage);
      }
      
      setVocabularyList(vocabs);
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadVocabulary();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this word?')) {
      return;
    }

    try {
      await deleteVocabulary(id);
      await loadVocabulary();
    } catch (error) {
      console.error('Failed to delete vocabulary:', error);
      alert('Failed to delete vocabulary: ' + error);
    }
  };

  const getLanguageName = (code: string): string => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.nativeName : code.toUpperCase();
  };

  return (
    <div className="vocabulary-tab">
      <div className="vocabulary-tab-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search vocabulary..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="language-filter"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="all">All Languages</option>
          {LANGUAGES.filter(lang => lang.code !== 'none').map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>

      <div className="vocabulary-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : vocabularyList.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? (
              <>
                <p>No words found</p>
                <p className="empty-hint">Try a different search term</p>
              </>
            ) : (
              <>
                <p>No vocabulary yet</p>
                <p className="empty-hint">Select text in the editor and right-click to add words</p>
              </>
            )}
          </div>
        ) : (
          vocabularyList.map((vocab) => (
            <div
              key={vocab.id}
              className="vocabulary-item"
              onClick={() => onVocabularySelect(vocab.id)}
            >
              <div className="vocabulary-item-header">
                <span className="vocabulary-term">{vocab.term}</span>
                <button
                  className="btn-delete"
                  onClick={(e) => handleDelete(vocab.id, e)}
                  title="Delete vocabulary"
                >
                  ×
                </button>
              </div>
              <div className="vocabulary-item-meta">
                <span className="vocabulary-language">
                  {getLanguageName(vocab.language)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VocabularyTab;
