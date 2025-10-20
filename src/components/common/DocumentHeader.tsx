import './DocumentHeader.css';

interface DocumentHeaderProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  hasChanges: boolean;
  disabled: boolean;
  showTitle?: boolean;
}

function DocumentHeader({
  title,
  onTitleChange,
  onSave,
  hasChanges,
  disabled,
  showTitle = true
}: DocumentHeaderProps) {
  return (
    <div className="document-header">
      {showTitle && (
        <input
          type="text"
          className="document-title-input"
          placeholder="Untitled Document"
          value={title}
          onChange={onTitleChange}
          disabled={disabled}
        />
      )}
      <div className="document-header-actions">
        <button 
          className="btn btn-sm btn-success"
          onClick={onSave}
          disabled={disabled || !hasChanges}
        >
          {hasChanges ? '💾 Save *' : '💾 Save'}
        </button>
      </div>
    </div>
  );
}

export default DocumentHeader;
