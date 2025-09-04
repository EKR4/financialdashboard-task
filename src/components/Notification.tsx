"use client";

import React, { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Notification({ 
  type, 
  message, 
  show, 
  onClose, 
  duration = 3000 
}: NotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const bgColor = 
    type === 'success' 
      ? 'bg-green-500' 
      : type === 'error' 
        ? 'bg-red-500' 
        : 'bg-blue-500';

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center">
      <div className={`${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center`}>
        <span>{message}</span>
        <button 
          onClick={onClose}
          className="ml-3 text-white hover:text-gray-200"
          aria-label="Close notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}