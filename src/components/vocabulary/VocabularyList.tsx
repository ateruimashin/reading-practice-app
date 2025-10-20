import { useState, useEffect } from 'react';
import { 
  getAllVocabulary, 
  getVocabularyByLanguage,
  searchVocabulary,
  deleteVocabulary
} from '../../utils/database';
import VocabularyDetailModal from './VocabularyDetailModal';
import type { Vocabulary, LanguageCode } from '../../types';
import './VocabularyList.css';

interface VocabularyListProps {
  filterLanguage?: LanguageCode;
}

function VocabularyList({ filterLanguage }: VocabularyListProps) {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | 'all'>(
    filterLanguage || 'all'
  );
  const [selectedVocabId, setSelectedVocabId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVocabularies();
  }, [selectedLanguage]);

  useEffect(() => {
    if (filterLanguage && filterLanguage !== 'none') {
      setSelectedLanguage(filterLanguage);
    }
  }, [filterLanguage]);

  const loadVocabularies = async () => {
    setIsLoading(true);
    try {
      let vocabs: Vocabulary[];
      if (selectedLanguage === 'all') {
        vocabs = await getAllVocabulary();
      } else {
        vocabs = await getVocabularyByLanguage(selectedLanguage);
      }
      setVocabularies(vocabs);
    } catch (error) {
      console.error('Failed to load vocabularies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadVocabularies();
      return;
    }

    setIsLoading(true);
    try {
      const lang = selectedLanguage === 'all' ? undefined : selectedLanguage;
      const results = await searchVocabulary(searchQuery, lang);
      setVocabularies(results);
    } catch (error) {
      console.error('Failed to search vocabularies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vocabulary item?')) {
      return;
    }

    try {
      await deleteVocabulary(id);
      await loadVocabularies();
    } catch (error) {
      console.error('Failed to delete vocabulary:', error);
      alert('Failed to delete vocabulary');
    }
  };

  const handleVocabClick = (id: number) => {
    setSelectedVocabId(id);
    setIsDetailModalOpen(true);
  };

  const handleModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedVocabId(null);
    loadVocabularies(); // リロードして変更を反映
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="vocabulary-list-container">
      <div className="vocabulary-header">
        <h2>Vocabulary</h2>
        <div className="vocabulary-controls">
          <select
            className="language-filter"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode | 'all')}
          >
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese</option>
            <option value="ko">Korean</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="es">Spanish</option>
            <option value="other">Other</option>
          </select>
          
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search vocabulary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch}>
              🔍
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-message">Loading...</div>
      ) : vocabularies.length === 0 ? (
        <div className="empty-message">
          {searchQuery ? 'No matching vocabulary found' : 'No vocabulary items yet'}
        </div>
      ) : (
        <div className="vocabulary-grid">
          {vocabularies.map((vocab) => (
            <div key={vocab.id} className="vocabulary-card">
              <div className="vocab-card-header">
                <span className="vocab-language-badge">{vocab.language.toUpperCase()}</span>
                <button
                  className="vocab-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(vocab.id);
                  }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
              <div 
                className="vocab-card-body"
                onClick={() => handleVocabClick(vocab.id)}
              >
                <h3 className="vocab-term">{vocab.term}</h3>
                <p className="vocab-date">
                  Added: {new Date(vocab.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVocabId !== null && (
        <VocabularyDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleModalClose}
          vocabularyId={selectedVocabId}
        />
      )}
    </div>
  );
}

export default VocabularyList;
