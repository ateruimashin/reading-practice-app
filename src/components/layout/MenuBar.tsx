import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { Theme } from '../../types';
import './MenuBar.css';

function MenuBar() {
  const { theme, setTheme } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
  };

  const getThemeLabel = (t: Theme): string => {
    switch (t) {
      case 'light': return '☀️ Light';
      case 'dark': return '🌙 Dark';
      case 'system': return '💻 System';
    }
  };

  return (
    <div className="menu-bar">
      <div className="menu-left">
        {/* タイトルを削除 */}
      </div>
      
      <div className="menu-right">
        <div className="menu-item">
          <button 
            className="menu-button"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
          >
            Theme: {getThemeLabel(theme)}
          </button>
          
          {isThemeMenuOpen && (
            <>
              <div 
                className="menu-overlay"
                onClick={() => setIsThemeMenuOpen(false)}
              ></div>
              <div className="menu-dropdown">
                <button
                  className={`menu-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <span>☀️ Light</span>
                  {theme === 'light' && <span className="check">✓</span>}
                </button>
                <button
                  className={`menu-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <span>🌙 Dark</span>
                  {theme === 'dark' && <span className="check">✓</span>}
                </button>
                <button
                  className={`menu-option ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('system')}
                >
                  <span>💻 System</span>
                  {theme === 'system' && <span className="check">✓</span>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuBar;
