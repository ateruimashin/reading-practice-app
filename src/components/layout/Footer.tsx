import { useState, useEffect } from 'react';
import { getStatistics } from '../../utils/database';
import LanguageSelector from '../common/LanguageSelector';
import { useTimer } from '../../hooks/useTimer';
import type { LanguageCode } from '../../types';
import './Footer.css';

interface FooterProps {
  currentDocument: any | null;
  sourceLanguage?: LanguageCode;
  translationLanguage?: LanguageCode;
  onLanguageChange?: (source: LanguageCode, translation: LanguageCode) => void;
  wordWrap?: boolean;
  sourceText?: string;
  translationText?: string;
}

function Footer({ 
  currentDocument, 
  sourceLanguage = 'none', 
  translationLanguage = 'none',
  onLanguageChange,
  wordWrap = false,
  sourceText = '',
  translationText = ''
}: FooterProps) {
  const [stats, setStats] = useState({
    documentCount: 0,
    vocabularyCount: 0,
    totalStudyTime: 0,
  });

  const {
    isRunning,
    isPaused,
    formattedTime,
    handleStart,
    handlePause,
    handleStop,
  } = useTimer({ documentId: currentDocument?.id || null });

  useEffect(() => {
    loadStats();
    
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // タイマー停止時に統計を更新
  useEffect(() => {
    if (!isRunning && currentDocument) {
      loadStats();
    }
  }, [isRunning, currentDocument]);

  const loadStats = async () => {
    try {
      const data = await getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // 単語数をカウント
  const countWords = (text: string): number => {
    if (!text.trim()) return 0;
    // 空白文字で分割し、空の要素を除外
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // 文字数をカウント（空登を除く）
  const countCharacters = (text: string): number => {
    return text.replace(/\s/g, '').length;
  };

  const sourceWordCount = countWords(sourceText);
  const sourceCharCount = countCharacters(sourceText);
  const translationWordCount = countWords(translationText);
  const translationCharCount = countCharacters(translationText);

  const handleSourceLanguageChange = (lang: LanguageCode) => {
    if (onLanguageChange) {
      onLanguageChange(lang, translationLanguage);
    }
    if ((window as any).updateLanguages) {
      (window as any).updateLanguages(lang, translationLanguage);
    }
  };

  const handleTranslationLanguageChange = (lang: LanguageCode) => {
    if (onLanguageChange) {
      onLanguageChange(sourceLanguage, lang);
    }
    if ((window as any).updateLanguages) {
      (window as any).updateLanguages(sourceLanguage, lang);
    }
  };

  const handleTimerAction = () => {
    if (!isRunning) {
      handleStart();
    } else if (isPaused) {
      handleStart(); // 再開
    } else {
      handlePause();
    }
  };

  // ボタンのクラス名を動的に設定
  const getPlayPauseClass = () => {
    if (!isRunning || isPaused) {
      return 'btn-icon play';
    } else {
      return 'btn-icon pause';
    }
  };

  return (
    <footer className="app-footer">
      {/* 左側: タイマー */}
      <div className="footer-section timer-section">
        <button 
          className={getPlayPauseClass()}
          onClick={handleTimerAction}
          disabled={!currentDocument}
          title={!isRunning ? 'Start timer' : isPaused ? 'Resume timer' : 'Pause timer'}
        >
          {!isRunning ? '▶' : isPaused ? '▶' : '⏸'}
        </button>
        <button 
          className="btn-icon stop"
          onClick={handleStop}
          disabled={!isRunning}
          title="Stop timer"
        >
          ⏹
        </button>
        <span className={`timer-display ${isRunning && !isPaused ? 'running' : ''}`}>
          {formattedTime}
        </span>
      </div>

      <div className="footer-divider"></div>

      {/* 中央: 言語選択 */}
      <div className="footer-section language-section">
        <LanguageSelector
          sourceLanguage={sourceLanguage}
          translationLanguage={translationLanguage}
          onSourceLanguageChange={handleSourceLanguageChange}
          onTranslationLanguageChange={handleTranslationLanguageChange}
          disabled={!currentDocument}
        />
      </div>

      <div className="footer-divider"></div>

      {/* 中央右: ドキュメントのワードカウント */}
      {currentDocument && (
        <>
          <div className="footer-section word-count-section">
            <span className="stat-item" title="Source text statistics">
              📝 {sourceWordCount} words, {sourceCharCount} chars
            </span>
            <span className="stat-separator">|</span>
            <span className="stat-item" title="Translation text statistics">
              📝 {translationWordCount} words, {translationCharCount} chars
            </span>
          </div>
          <div className="footer-divider"></div>
        </>
      )}

      {/* 右側: 統計情報 */}
      <div className="footer-section stats-section">
        <span className="stat-item" title="Word wrap (Alt+Z)">
          {wordWrap ? '↩️ Wrap' : '⟷ No Wrap'}
        </span>
        <span className="stat-item">
          📄 {stats.documentCount} docs
        </span>
        <span className="stat-item">
          📚 {stats.vocabularyCount} words
        </span>
        <span className="stat-item">
          ⏱️ {formatTime(stats.totalStudyTime)}
        </span>
      </div>
    </footer>
  );
}

export default Footer;
