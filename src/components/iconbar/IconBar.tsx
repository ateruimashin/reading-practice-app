import './IconBar.css';

export type SidebarView = 'documents' | 'vocabulary' | null;

interface IconBarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

function IconBar({ activeView, onViewChange }: IconBarProps) {
  const handleIconClick = (view: SidebarView) => {
    if (activeView === view) {
      // 同じアイコンをクリックした場合はサイドバーを閉じる
      onViewChange(null);
    } else {
      // 異なるアイコンをクリックした場合は対応するビューを表示
      onViewChange(view);
    }
  };

  return (
    <div className="icon-bar">
      <div className="icon-bar-icons">
        <button
          className={`icon-bar-button ${activeView === 'documents' ? 'active' : ''}`}
          onClick={() => handleIconClick('documents')}
          title="Documents"
        >
          📄
        </button>
        <button
          className={`icon-bar-button ${activeView === 'vocabulary' ? 'active' : ''}`}
          onClick={() => handleIconClick('vocabulary')}
          title="Vocabulary"
        >
          📚
        </button>
      </div>
    </div>
  );
}

export default IconBar;
