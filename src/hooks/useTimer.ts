import { useState, useEffect, useRef, useCallback } from 'react';
import { createStudySession, updateStudySession, completeStudySession } from '../utils/database';

interface UseTimerOptions {
  documentId: number | null;
}

export function useTimer({ documentId }: UseTimerOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // 秒単位
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // ドキュメントが変更されたらタイマーをリセット
  useEffect(() => {
    if (documentId === null) {
      handleStop();
    }
  }, [documentId]);

  // タイマーの更新
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current + pausedTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, isPaused]);

  const handleStart = useCallback(async () => {
    if (!documentId) {
      console.error('Cannot start timer: no document selected');
      return;
    }

    try {
      if (!isRunning) {
        // 新規セッション開始
        const id = await createStudySession(documentId);
        setSessionId(id);
        startTimeRef.current = Date.now();
        pausedTimeRef.current = 0;
        setElapsedTime(0);
        setIsRunning(true);
        setIsPaused(false);
      } else if (isPaused) {
        // 一時停止から再開
        startTimeRef.current = Date.now();
        setIsPaused(false);
        
        if (sessionId !== null) {
          await updateStudySession(sessionId, elapsedTime, 'active');
        }
      }
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  }, [documentId, isRunning, isPaused, sessionId, elapsedTime]);

  const handlePause = useCallback(async () => {
    if (!isRunning || isPaused) return;

    try {
      const now = Date.now();
      pausedTimeRef.current += now - startTimeRef.current;
      setIsPaused(true);

      if (sessionId !== null) {
        await updateStudySession(sessionId, elapsedTime, 'paused');
      }
    } catch (error) {
      console.error('Failed to pause timer:', error);
    }
  }, [isRunning, isPaused, sessionId, elapsedTime]);

  const handleStop = useCallback(async () => {
    if (!isRunning) return;

    try {
      if (sessionId !== null) {
        await completeStudySession(sessionId, elapsedTime);
      }

      setIsRunning(false);
      setIsPaused(false);
      setElapsedTime(0);
      setSessionId(null);
      startTimeRef.current = 0;
      pausedTimeRef.current = 0;

      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  }, [isRunning, sessionId, elapsedTime]);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRunning,
    isPaused,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    handleStart,
    handlePause,
    handleStop,
  };
}
