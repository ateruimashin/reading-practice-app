import { useState, useEffect, useRef, useCallback } from 'react';
import IconBar, { SidebarView } from '../iconbar/IconBar';
import DocumentList from '../sidebar/DocumentList';
import VocabularyList from '../vocabulary/VocabularyList';
import AddVocabularyModal from '../vocabulary/AddVocabularyModal';
import DocumentHeader from '../common/DocumentHeader';
import TextEditor from '../editor/TextEditor';
import Toast, { ToastType } from '../common/Toast';
import { getDocumentById, updateDocument, createDocument } from '../../utils/database';
import { useResizable } from '../../hooks/useResizable';
import type { DocumentWithContent, LanguageCode } from '../../types';
import './MainLayout.css';

interface MainLayoutProps {
  onDocumentChange?: (doc: DocumentWithContent | null) => void;
  onLanguageChange?: (source: LanguageCode, translation: LanguageCode) => void;
  wordWrap?: boolean;
  onWordWrapChange?: (wordWrap: boolean) => void;
  onTextChange?: (source: string, translation: string) => void;
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

function MainLayout({ onDocumentChange, onLanguageChange, wordWrap = false, onWordWrapChange, onTextChange }: MainLayoutProps) {
  const [activeSidebarView, setActiveSidebarView] = useState<SidebarView>('documents');
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [currentDocument, setCurrentDocument] = useState<DocumentWithContent | null>(null);
  const [title, setTitle] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('none');
  const [translationLanguage, setTranslationLanguage] = useState<LanguageCode>('none');
  const [hasChanges, setHasChanges] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // 単語帳関連のstate
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [contextText, setContextText] = useState('');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  
  // トースト関連のstate
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const {
    leftWidth,
    centerWidth,
    handleMouseDown,
    isDragging,
    containerRef,
    adjustEditorWidths,
  } = useResizable({
    leftInitialWidth: 280,
    centerInitialWidth: 500,
    minWidth: 250,
  });

  // サイドバーの開閉を監視してエディタの比率を調整
  useEffect(() => {
    adjustEditorWidths(activeSidebarView !== null);
  }, [activeSidebarView, adjustEditorWidths]);

  useEffect(() => {
    if (selectedDocumentId !== null) {
      loadDocument(selectedDocumentId);
    } else {
      clearEditor();
    }
  }, [selectedDocumentId]);

  // 言語が外部から変更された場合
  useEffect(() => {
    if (currentDocument) {
      setHasChanges(true);
    }
  }, [sourceLanguage, translationLanguage]);

  // コンテキストメニューを閉じるためのクリックリスナー
  useEffect(() => {
    const handleClick = () => setShowContextMenu(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // キーボードショートカットの処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Z: 折り返し切り替え
      if (e.altKey && e.key === 'z') {
        e.preventDefault();
        if (onWordWrapChange) {
          onWordWrapChange(!wordWrap);
        }
      }
      // Ctrl + S (または Cmd + S): 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // handleSaveを直接呼ぶ代わりに、保存処理を実行
        if (currentDocument && hasChanges) {
          (async () => {
            try {
              await updateDocument(
                currentDocument.id,
                title,
                sourceText,
                translationText,
                sourceLanguage,
                translationLanguage
              );
              setHasChanges(false);
              
              // 文書を再読み込みして最新の状態を反映
              const doc = await getDocumentById(currentDocument.id);
              if (doc) {
                setCurrentDocument(doc);
                setTitle(doc.title);
                setSourceText(doc.source_text);
                setTranslationText(doc.translation_text);
                
                if (onTextChange) {
                  onTextChange(doc.source_text, doc.translation_text);
                }
                
                const srcLang = (doc.source_language || 'none') as LanguageCode;
                const trnLang = (doc.translation_language || 'none') as LanguageCode;
                
                setSourceLanguage(srcLang);
                setTranslationLanguage(trnLang);
                
                onDocumentChange?.(doc);
                onLanguageChange?.(srcLang, trnLang);
              }
              
              // ドキュメントリストを更新
              if ((window as any).reloadDocuments) {
                await (window as any).reloadDocuments();
              }
            } catch (error) {
              console.error('Failed to save document:', error);
              setToast({ message: 'Failed to save document', type: 'error' });
            }
          })();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentDocument, hasChanges, wordWrap, onWordWrapChange, title, sourceText, translationText, sourceLanguage, translationLanguage, onTextChange, onDocumentChange, onLanguageChange]);

  const loadDocument = async (id: number) => {
    try {
      const doc = await getDocumentById(id);
      if (doc) {
        setCurrentDocument(doc);
        setTitle(doc.title);
        setSourceText(doc.source_text);
        setTranslationText(doc.translation_text);
        
        // 親コンポーネントにテキストを通知
        if (onTextChange) {
          onTextChange(doc.source_text, doc.translation_text);
        }
        
        // 言語を設定（noneの場合もそのまま設定）
        const srcLang = (doc.source_language || 'none') as LanguageCode;
        const trnLang = (doc.translation_language || 'none') as LanguageCode;
        
        setSourceLanguage(srcLang);
        setTranslationLanguage(trnLang);
        setHasChanges(false);
        
        // 親コンポーネントに通知
        onDocumentChange?.(doc);
        onLanguageChange?.(srcLang, trnLang);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  const clearEditor = () => {
    setCurrentDocument(null);
    setTitle('');
    setSourceText('');
    setTranslationText('');
    setSourceLanguage('none');
    setTranslationLanguage('none');
    setHasChanges(false);
    
    // 親コンポーネントに通知
    onDocumentChange?.(null);
    onLanguageChange?.('none', 'none');
  };

  const handleSave = useCallback(async () => {
    if (!currentDocument) return;

    try {
      await updateDocument(
        currentDocument.id,
        title,
        sourceText,
        translationText,
        sourceLanguage,
        translationLanguage
      );
      setHasChanges(false);
      
      // 文書を再読み込みして最新の状態を反映
      const doc = await getDocumentById(currentDocument.id);
      if (doc) {
        setCurrentDocument(doc);
        setTitle(doc.title);
        setSourceText(doc.source_text);
        setTranslationText(doc.translation_text);
        
        // 親コンポーネントにテキストを通知
        if (onTextChange) {
          onTextChange(doc.source_text, doc.translation_text);
        }
        
        const srcLang = (doc.source_language || 'none') as LanguageCode;
        const trnLang = (doc.translation_language || 'none') as LanguageCode;
        
        setSourceLanguage(srcLang);
        setTranslationLanguage(trnLang);
        
        onDocumentChange?.(doc);
        onLanguageChange?.(srcLang, trnLang);
      }
      
      // ドキュメントリストを更新
      if ((window as any).reloadDocuments) {
        await (window as any).reloadDocuments();
      }
      
      // 保存成功時は何も表示しない
    } catch (error) {
      console.error('Failed to save document:', error);
      setToast({ message: 'Failed to save document', type: 'error' });
    }
  }, [currentDocument, title, sourceText, translationText, sourceLanguage, translationLanguage, onTextChange, onDocumentChange, onLanguageChange]);

  const handleCreateDocument = async () => {
    if (creating) return;
    
    try {
      setCreating(true);
      console.log('Creating new document...');
      const id = await createDocument('Untitled Document', 'none', 'none');
      console.log('Document created with id:', id);
      
      // ドキュメントリストを再読み込み
      if ((window as any).reloadDocuments) {
        await (window as any).reloadDocuments();
      }
      
      setSelectedDocumentId(id);
    } catch (error) {
      console.error('Failed to create document:', error);
      alert('Failed to create document: ' + error);
    } finally {
      setCreating(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleSourceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setSourceText(newText);
    setHasChanges(true);
    if (onTextChange) {
      onTextChange(newText, translationText);
    }
  };

  const handleTranslationTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTranslationText(newText);
    setHasChanges(true);
    if (onTextChange) {
      onTextChange(sourceText, newText);
    }
  };

  // テキスト選択時の処理（右クリック）
  const handleTextContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
    if (selection.trim().length > 0) {
      e.preventDefault(); // ブラウザのデフォルトメニューを防ぐ
      
      setSelectedText(selection.trim());
      
      // 選択範囲の前後のコンテキストを取得（最大100文字）
      const start = Math.max(0, textarea.selectionStart - 50);
      const end = Math.min(textarea.value.length, textarea.selectionEnd + 50);
      setContextText(textarea.value.substring(start, end));
      
      // コンテキストメニューの表示位置を設定
      setContextMenuPos({
        x: e.clientX,
        y: e.clientY
      });
      setShowContextMenu(true);
    }
  };

  const handleAddToVocabulary = () => {
    setShowContextMenu(false);
    setIsVocabModalOpen(true);
  };

  // 外部から言語を更新する関数をエクスポート
  (window as any).updateLanguages = (source: LanguageCode, translation: LanguageCode) => {
    setSourceLanguage(source);
    setTranslationLanguage(translation);
  };

  const sidebarWidth = activeSidebarView ? leftWidth : 0;

  return (
    <div className="main-layout" ref={containerRef}>
      {/* アイコンバー */}
      <IconBar 
        activeView={activeSidebarView}
        onViewChange={setActiveSidebarView}
      />

      {/* サイドバー */}
      {activeSidebarView && (
        <>
          <div 
            className="layout-column sidebar-column"
            style={{ 
              width: `${sidebarWidth}px`,
              minWidth: `${sidebarWidth}px`,
              maxWidth: `${sidebarWidth}px`
            }}
          >
            <div className="column-header">
              <h3>{activeSidebarView === 'documents' ? 'Documents' : 'Vocabulary'}</h3>
              {activeSidebarView === 'documents' && (
                <button
                  className="btn-add-icon"
                  onClick={handleCreateDocument}
                  disabled={creating}
                  title="New Document"
                >
                  +
                </button>
              )}
            </div>
            <div className="column-content">
              {activeSidebarView === 'documents' && (
                <DocumentList 
                  onDocumentSelect={setSelectedDocumentId}
                  selectedDocumentId={selectedDocumentId}
                />
              )}
              {activeSidebarView === 'vocabulary' && (
                <VocabularyList filterLanguage={sourceLanguage} />
              )}
            </div>
          </div>
          
          {/* リサイズハンドル 1 */}
          <div 
            className={`resize-handle ${isDragging === 'left' ? 'dragging' : ''}`}
            onMouseDown={(e) => handleMouseDown('left', e)}
          ></div>
        </>
      )}

      {/* エディタエリア（中央 + 右カラム） */}
      <div className="editor-area">
        {/* 共通ドキュメントヘッダー */}
        <div className="editor-area-header">
          <DocumentHeader
            title={title}
            onTitleChange={handleTitleChange}
            onSave={handleSave}
            hasChanges={hasChanges}
            disabled={!currentDocument}
            showTitle={true}
          />
        </div>

        {/* エディタコンテナ */}
        <div className="editor-container">
          {/* 中央カラム: 元テキストエディタ */}
          <div 
            className={`editor-column center-column ${isDragging === 'center' ? 'resizing' : ''}`}
            style={{
              width: `${centerWidth}px`,
              minWidth: `${centerWidth}px`,
              maxWidth: `${centerWidth}px`,
              flexShrink: 0,
            }}
          >
            <TextEditor
              value={sourceText}
              onChange={handleSourceTextChange}
              onContextMenu={handleTextContextMenu}
              placeholder={currentDocument ? "Enter source text here..." : "Select or create a document to start"}
              disabled={!currentDocument}
              wordWrap={wordWrap}
            />
          </div>

          {/* リサイズハンドル 2 */}
          <div 
            className={`resize-handle ${isDragging === 'center' ? 'dragging' : ''}`}
            onMouseDown={(e) => handleMouseDown('center', e)}
          ></div>

          {/* 右カラム: 翻訳エディタ */}
          <div className="editor-column right-column">
            <TextEditor
              value={translationText}
              onChange={handleTranslationTextChange}
              onContextMenu={handleTextContextMenu}
              placeholder={currentDocument ? "Enter translation here..." : "Select or create a document to start"}
              disabled={!currentDocument}
              wordWrap={wordWrap}
            />
          </div>
        </div>
      </div>

      {/* コンテキストメニュー */}
      {showContextMenu && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            left: `${contextMenuPos.x}px`,
            top: `${contextMenuPos.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="context-menu-item"
            onClick={handleAddToVocabulary}
          >
            📚 Add to Vocabulary
          </button>
        </div>
      )}

      {/* 単語帳追加モーダル */}
      <AddVocabularyModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        selectedText={selectedText}
        contextText={contextText}
        documentId={currentDocument?.id}
        language={sourceLanguage}
      />
      
      {/* トースト通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default MainLayout;
