"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastContextType = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    // Remove after 2.5 seconds (2500 ms)
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#212121',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: '600',
          textAlign: 'center',
          animation: 'toastSlideDown 0.3s cubic-bezier(0.2, 1, 0.3, 1)',
          maxWidth: '90vw',
          pointerEvents: 'none' // Ensures user can click through if needed
        }}>
          {toastMessage}
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes toastSlideDown {
          from { transform: translate(-50%, -40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
