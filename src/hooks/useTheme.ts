import { useState, useEffect } from 'react';
import { getSetting, setSetting } from '../utils/database';
import type { Theme } from '../types';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // 初期読み込み
  useEffect(() => {
    loadTheme();
  }, []);

  // テーマの適用
  useEffect(() => {
    if (theme === 'system') {
      // システム設定に従う
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setEffectiveTheme(isDark ? 'dark' : 'light');

      // システム設定の変更を監視
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  // DOMに反映
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await getSetting('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await setSetting('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return {
    theme,
    effectiveTheme,
    setTheme,
  };
}
