import { useState, useEffect } from 'react';
import { ErrorLog } from '@/types';

const STORAGE_KEY = 'devnotes-pad-errors';

export const useErrorLogs = () => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedLogs = JSON.parse(stored).map((log: any) => ({
          ...log,
          createdAt: new Date(log.createdAt),
        }));
        setErrorLogs(parsedLogs);
      }
    } catch (error) {
      console.error('Failed to load error logs:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(errorLogs));
    } catch (error) {
      console.error('Failed to save error logs:', error);
    }
  }, [errorLogs]);

  const addErrorLog = (logData: Omit<ErrorLog, 'id' | 'createdAt'>) => {
    const newLog: ErrorLog = {
      ...logData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setErrorLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  const updateErrorLog = (id: string, updates: Partial<ErrorLog>) => {
    setErrorLogs(prev => prev.map(log => 
      log.id === id ? { ...log, ...updates } : log
    ));
  };

  const deleteErrorLog = (id: string) => {
    setErrorLogs(prev => prev.filter(log => log.id !== id));
  };

  return {
    errorLogs,
    addErrorLog,
    updateErrorLog,
    deleteErrorLog,
  };
};