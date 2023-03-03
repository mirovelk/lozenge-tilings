import { useEffect, useRef, useState, useCallback } from 'react';

export function useProcessingProgress() {
  const [processing, setProcessing] = useState(false);

  const [showProgress, setShowProgress] = useState(false);
  const showProgressRef = useRef<ReturnType<typeof setTimeout> | null>();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (processing) {
      timeout = setTimeout(() => {
        setShowProgress(true);
      }, 300);
      showProgressRef.current = timeout;
    } else {
      if (showProgressRef.current) {
        clearTimeout(showProgressRef.current);
      }
      setShowProgress(false);
    }
    return () => clearTimeout(timeout);
  }, [processing]);

  const startProcessing = useCallback(() => {
    setProcessing(true);
  }, []);

  const stopProcessing = useCallback(() => {
    setProcessing(false);
  }, []);

  return { processing, showProgress, startProcessing, stopProcessing };
}
