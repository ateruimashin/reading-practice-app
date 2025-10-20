import { LANGUAGES, type LanguageCode } from '../../types';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  sourceLanguage: LanguageCode;
  translationLanguage: LanguageCode;
  onSourceLanguageChange: (lang: LanguageCode) => void;
  onTranslationLanguageChange: (lang: LanguageCode) => void;
  disabled?: boolean;
}

function LanguageSelector({
  sourceLanguage,
  translationLanguage,
  onSourceLanguageChange,
  onTranslationLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div className="language-selector">
      <select
        className="language-select"
        value={sourceLanguage}
        onChange={(e) => onSourceLanguageChange(e.target.value as LanguageCode)}
        disabled={disabled}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
      
      <span className="language-arrow">→</span>
      
      <select
        className="language-select"
        value={translationLanguage}
        onChange={(e) => onTranslationLanguageChange(e.target.value as LanguageCode)}
        disabled={disabled}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
