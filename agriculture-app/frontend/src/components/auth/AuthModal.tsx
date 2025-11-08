'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import OTPForm from './OTPForm';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'register' | 'otp';
}

export default function AuthModal({ isOpen, onClose, mode = 'login' }: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'otp'>(mode);

  if (!isOpen) return null;

  const switchMode = (newMode: 'login' | 'register' | 'otp') => {
    setCurrentMode(newMode);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {currentMode === 'login' && (
          <LoginForm
            onClose={onClose}
            onSwitchToRegister={() => switchMode('register')}
            onSwitchToOTP={() => switchMode('otp')}
          />
        )}

        {currentMode === 'register' && (
          <RegisterForm
            onClose={onClose}
            onSwitchToLogin={() => switchMode('login')}
          />
        )}

        {currentMode === 'otp' && (
          <OTPForm
            onClose={onClose}
            onSwitchToLogin={() => switchMode('login')}
          />
        )}
      </div>
    </div>
  );
}
