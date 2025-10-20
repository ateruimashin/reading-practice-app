import { useState, useCallback, useEffect, useRef } from 'react';

interface UseResizableOptions {
  leftInitialWidth?: number;
  centerInitialWidth?: number;
  minWidth?: number;
}

export function useResizable(options: UseResizableOptions = {}) {
  const {
    leftInitialWidth = 280,
    centerInitialWidth = 500,
    minWidth = 250,
  } = options;

  const [leftWidth, setLeftWidth] = useState(leftInitialWidth);
  const [centerWidth, setCenterWidth] = useState(centerInitialWidth);
  const [isDragging, setIsDragging] = useState<'left' | 'center' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef({
    startX: 0,
    startLeftWidth: 0,
    startCenterWidth: 0,
  });

  // エディタの比率を保存（中央エディタが全エディタ幅に占める割合）
  const editorRatioRef = useRef<number>(0.5);

  const handleMouseDown = useCallback((handle: 'left' | 'center', e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(handle);
    dragInfoRef.current = {
      startX: e.clientX,
      startLeftWidth: leftWidth,
      startCenterWidth: centerWidth,
    };
  }, [leftWidth, centerWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const deltaX = e.clientX - dragInfoRef.current.startX;

    if (isDragging === 'left') {
      // 左のリサイズハンドル（サイドバーと中央の間）
      const newLeftWidth = dragInfoRef.current.startLeftWidth + deltaX;
      
      if (newLeftWidth >= minWidth) {
        setLeftWidth(newLeftWidth);
      }
    } else if (isDragging === 'center') {
      // 中央のリサイズハンドル（中央と右の間）
      const newCenterWidth = dragInfoRef.current.startCenterWidth + deltaX;
      
      if (newCenterWidth >= minWidth) {
        setCenterWidth(newCenterWidth);
        
        // リサイズ完了時に実際の幅を測定して比率を保存する
        // （mouseup時に正確な値を取得）
      }
    }
  }, [isDragging, minWidth]);

  const handleMouseUp = useCallback(() => {
    if (isDragging === 'center' && containerRef.current) {
      // リサイズ完了時に実際の幅を測定
      const centerElement = containerRef.current.querySelector('.center-column') as HTMLElement;
      const rightElement = containerRef.current.querySelector('.right-column') as HTMLElement;
      
      if (centerElement && rightElement) {
        const centerActualWidth = centerElement.offsetWidth;
        const rightActualWidth = rightElement.offsetWidth;
        const totalEditorWidth = centerActualWidth + rightActualWidth;
        
        // 実際の幅から比率を計算
        editorRatioRef.current = centerActualWidth / totalEditorWidth;
        
        console.log('Mouse up - Actual widths:', {
          center: centerActualWidth,
          right: rightActualWidth,
          total: totalEditorWidth,
          ratio: editorRatioRef.current
        });
      }
    }
    
    setIsDragging(null);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      const moveHandler = (e: MouseEvent) => {
        e.preventDefault();
        handleMouseMove(e);
      };

      const upHandler = (e: MouseEvent) => {
        e.preventDefault();
        handleMouseUp();
      };

      document.addEventListener('mousemove', moveHandler, { passive: false });
      document.addEventListener('mouseup', upHandler, { passive: false });
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // サイドバーの開閉に応じてエディタの幅を調整
  const adjustEditorWidths = useCallback((sidebarOpen: boolean) => {
    if (!containerRef.current) return;
    
    // 実際の要素から現在の幅を測定
    const centerElement = containerRef.current.querySelector('.center-column') as HTMLElement;
    const rightElement = containerRef.current.querySelector('.right-column') as HTMLElement;
    
    if (!centerElement || !rightElement) return;
    
    const centerActualWidth = centerElement.offsetWidth;
    const rightActualWidth = rightElement.offsetWidth;
    const currentTotalEditorWidth = centerActualWidth + rightActualWidth;
    
    console.log('Before adjustment:', {
      sidebarOpen,
      centerActual: centerActualWidth,
      rightActual: rightActualWidth,
      currentTotal: currentTotalEditorWidth,
      savedRatio: editorRatioRef.current
    });
    
    // 新しい中央エディタの幅を比率に基づいて計算
    const newCenterWidth = Math.max(
      minWidth,
      Math.min(
        Math.floor(currentTotalEditorWidth * editorRatioRef.current),
        currentTotalEditorWidth - minWidth
      )
    );
    
    console.log('Setting new center width:', newCenterWidth);
    
    setCenterWidth(newCenterWidth);
  }, [minWidth]);

  return {
    leftWidth,
    centerWidth,
    handleMouseDown,
    isDragging,
    containerRef,
    adjustEditorWidths,
  };
}
