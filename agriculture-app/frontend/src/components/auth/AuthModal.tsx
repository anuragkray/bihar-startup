'use client';

import { useState } from 'react';
import { useUserActions } from '@/hooks/useUsers';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-toastify';
import { Button, Input } from '@/components/common';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'register' | 'otp';
}

export default function AuthModal({ isOpen, onClose, mode = 'login' }: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'otp'>(mode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    state: 'Bihar',
    pincode: '',
    otp: '',
  });
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createUser, loading } = useUserActions();
  const { login } = useUser();

  if (!isOpen) return null;

  // Form validation
  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 100) return 'Name cannot exceed 100 characters';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return 'Phone number is required';
    if (!/^[0-9]{10}$/.test(phone)) return 'Please enter a valid 10-digit phone number';
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return null; // Email is optional
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePincode = (pincode: string): string | null => {
    if (!pincode.trim()) return null; // Pincode is optional
    if (!/^[0-9]{6}$/.test(pincode)) return 'Please enter a valid 6-digit pincode';
    return null;
  };

  const validateOTP = (otp: string): string | null => {
    if (!otp.trim()) return 'OTP is required';
    if (!/^[0-9]{6}$/.test(otp)) return 'Please enter a valid 6-digit OTP';
    return null;
  };

  const handleSendOTP = async () => {
    setError('');
    
    // Clean phone number (remove any non-digit characters)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    // Validate phone
    const phoneError = validatePhone(cleanPhone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        toast.success(data.message);
      } else {
        if (response.status === 404) {
          setError('User not found. Please register first.');
        } else {
          setError(data.message || 'Failed to send OTP');
        }
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    // Clean phone number (remove any non-digit characters)
    const cleanPhone = formData.phone.replace(/\D/g, '');

    // Validate OTP
    const otpError = validateOTP(formData.otp);
    if (otpError) {
      setError(otpError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: cleanPhone, 
          otp: formData.otp 
        }),
      });

      const data = await response.json();

      if (data.success) {
        await login(data.data);
        toast.success('Login successful!');
        onClose();
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentMode === 'register') {
      // Validate all fields
      const nameError = validateName(formData.name);
      if (nameError) {
        setError(nameError);
        return;
      }

      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        setError(phoneError);
        return;
      }

      const emailError = validateEmail(formData.email);
      if (emailError) {
        setError(emailError);
        return;
      }

      const pincodeError = validatePincode(formData.pincode);
      if (pincodeError) {
        setError(pincodeError);
        return;
      }

      // Create user
      const newUser = await createUser({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address
          ? {
              type: 'home',
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              isDefault: true,
            }
          : undefined,
      });

      if (newUser) {
        try {
          await login(newUser);
          toast.success('Registration successful!');
          onClose();
        } catch (err) {
          setError('Login failed after registration. Please try logging in manually.');
        }
      } else {
        setError('Registration failed. Phone number may already exist.');
      }
    } else if (currentMode === 'login') {
      // Login - find user by email or phone
      const searchValue = formData.email || formData.phone;
      
      if (!searchValue) {
        setError('Please enter email or phone number');
        return;
      }

      try {
        const response = await fetch(
          `/api/users?search=${encodeURIComponent(searchValue)}&limit=1`
        );
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          await login(data.data[0]);
          toast.success('Login successful!');
          onClose();
        } else {
          setError('User not found. Please register first.');
        }
      } catch (err) {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      address: '',
      city: '',
      state: 'Bihar',
      pincode: '',
      otp: '',
    });
    setError('');
    setOtpSent(false);
  };

  const switchMode = (newMode: 'login' | 'register' | 'otp') => {
    resetForm();
    setCurrentMode(newMode);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2 className={styles.title}>
          {currentMode === 'login' && 'Welcome Back!'}
          {currentMode === 'register' && 'Create Account'}
          {currentMode === 'otp' && 'Login with OTP'}
        </h2>
        <p className={styles.subtitle}>
          {currentMode === 'login' && 'Login to access your cart and orders'}
          {currentMode === 'register' && 'Register to start shopping'}
          {currentMode === 'otp' && 'Enter your phone number to receive OTP'}
        </p>

        {error && <div className={styles.error}>{error}</div>}

        {currentMode === 'otp' ? (
          <form onSubmit={(e) => { e.preventDefault(); otpSent ? handleVerifyOTP() : handleSendOTP(); }} className={styles.form}>
            <Input
              type="tel"
              id="phone"
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              required
              fullWidth
              disabled={otpSent}
            />

            {otpSent && (
              <Input
                type="text"
                id="otp"
                name="otp"
                label="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                placeholder="6-digit OTP"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                fullWidth
              />
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {otpSent ? 'Verify OTP' : 'Send OTP'}
            </Button>

            {otpSent && (
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setOtpSent(false)}
                disabled={isLoading}
              >
                Change Phone Number
              </Button>
            )}
          </form>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {currentMode === 'register' && (
              <Input
                type="text"
                id="name"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                fullWidth
              />
            )}

            {currentMode === 'register' && (
              <Input
                type="tel"
                id="phone"
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                required
                fullWidth
              />
            )}

            <Input
              type="email"
              id="email"
              name="email"
              label={currentMode === 'register' ? 'Email (Optional)' : 'Email or Phone'}
              value={formData.email}
              onChange={handleChange}
              placeholder={currentMode === 'register' ? 'your.email@example.com' : 'Email or phone number'}
              required={currentMode === 'login'}
              fullWidth
            />

            {currentMode === 'login' && (
              <Input
                type="password"
                id="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                fullWidth
              />
            )}

            {currentMode === 'register' && (
              <>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  label="Address (Optional)"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House no., Street name, Area"
                  fullWidth
                />

                <div className={styles.formRow}>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    label="City"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    fullWidth
                  />

                  <Input
                    type="text"
                    id="pincode"
                    name="pincode"
                    label="Pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    pattern="[0-9]{6}"
                    fullWidth
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {currentMode === 'login' ? 'Login' : 'Create Account'}
            </Button>

            {currentMode === 'login' && (
              <div className={styles.divider}>
                <span>OR</span>
              </div>
            )}

            {currentMode === 'login' && (
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => switchMode('otp')}
              >
                Login with Mobile OTP
              </Button>
            )}
          </form>
        )}

        <div className={styles.switchMode}>
          {currentMode === 'login' && (
            <p>
              Don&apos;t have an account?{' '}
              <button onClick={() => switchMode('register')}>
                Register here
              </button>
            </p>
          )}
          {currentMode === 'register' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => switchMode('login')}>
                Login here
              </button>
            </p>
          )}
          {currentMode === 'otp' && (
            <p>
              <button onClick={() => switchMode('login')}>
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
