import { useState } from 'react';
import MenuBar from './components/layout/MenuBar';
import MainLayout from './components/layout/MainLayout';
import Footer from './components/layout/Footer';
import type { DocumentWithContent, LanguageCode } from './types';
import './App.css';

function App() {
  const [currentDocument, setCurrentDocument] = useState<DocumentWithContent | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('none');
  const [translationLanguage, setTranslationLanguage] = useState<LanguageCode>('none');
  const [wordWrap, setWordWrap] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translationText, setTranslationText] = useState('');

  const handleDocumentChange = (doc: DocumentWithContent | null) => {
    setCurrentDocument(doc);
    if (!doc) {
      // 新規文書の場合は言語を'none'に設定
      setSourceLanguage('none');
      setTranslationLanguage('none');
      setSourceText('');
      setTranslationText('');
    }
  };

  const handleTextChange = (source: string, translation: string) => {
    setSourceText(source);
    setTranslationText(translation);
  };

  const handleLanguageChange = (source: LanguageCode, translation: LanguageCode) => {
    setSourceLanguage(source);
    setTranslationLanguage(translation);
  };

  return (
    <div className="app-container">
      <MenuBar />
      <MainLayout 
        onDocumentChange={handleDocumentChange}
        onLanguageChange={handleLanguageChange}
        wordWrap={wordWrap}
        onWordWrapChange={setWordWrap}
        onTextChange={handleTextChange}
      />
      <Footer 
        currentDocument={currentDocument}
        sourceLanguage={sourceLanguage}
        translationLanguage={translationLanguage}
        onLanguageChange={handleLanguageChange}
        wordWrap={wordWrap}
        sourceText={sourceText}
        translationText={translationText}
      />
    </div>
  );
}

export default App;
