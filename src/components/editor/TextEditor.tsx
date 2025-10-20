import { useRef, useEffect, useState } from 'react';
import './TextEditor.css';

interface TextEditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  wordWrap?: boolean;
}

function TextEditor({ value, onChange, onMouseUp, onContextMenu, placeholder, disabled, wordWrap = false }: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [lineHeights, setLineHeights] = useState<number[]>([]);

  // 行数を計算
  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(Math.max(lines, 1));
  }, [value]);

  // 折り返し時の各行の高さを計算
  useEffect(() => {
    if (!wordWrap || !textareaRef.current) {
      setLineHeights([]);
      return;
    }

    const textarea = textareaRef.current;
    const lines = value.split('\n');
    const style = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight);
    const width = textarea.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    
    // 仮想的なdivを作成して各行の高さを計算
    const measureDiv = document.createElement('div');
    measureDiv.style.position = 'absolute';
    measureDiv.style.visibility = 'hidden';
    measureDiv.style.width = `${width}px`;
    measureDiv.style.fontFamily = style.fontFamily;
    measureDiv.style.fontSize = style.fontSize;
    measureDiv.style.lineHeight = style.lineHeight;
    measureDiv.style.whiteSpace = 'pre-wrap';
    measureDiv.style.wordWrap = 'break-word';
    measureDiv.style.padding = '0';
    document.body.appendChild(measureDiv);

    const heights: number[] = [];
    lines.forEach((line, index) => {
      // 空行の場合は1行分の高さ
      if (line === '') {
        heights.push(lineHeight);
      } else {
        measureDiv.textContent = line;
        const height = measureDiv.offsetHeight;
        heights.push(height);
      }
    });

    document.body.removeChild(measureDiv);
    setLineHeights(heights);
  }, [value, wordWrap]);

  // スクロール同期
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="text-editor-container">
      <div className="line-numbers" ref={lineNumbersRef}>
        {wordWrap && lineHeights.length > 0 ? (
          // 折り返しON時: 各行の実際の高さに合わせる
          lineHeights.map((height, i) => (
            <div key={i + 1} className="line-number" style={{ height: `${height}px` }}>
              {i + 1}
            </div>
          ))
        ) : (
          // 折り返しOFF時: 固定の高さ
          Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="line-number">
              {i + 1}
            </div>
          ))
        )}
      </div>
      <textarea
        ref={textareaRef}
        className={`text-editor ${wordWrap ? 'wrap' : ''}`}
        value={value}
        onChange={onChange}
        onMouseUp={onMouseUp}
        onContextMenu={onContextMenu}
        onScroll={handleScroll}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
      />
    </div>
  );
}

export default TextEditor;
