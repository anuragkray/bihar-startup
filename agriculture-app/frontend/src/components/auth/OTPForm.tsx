'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-toastify';
import { Button, Input } from '@/components/common';
import styles from './AuthForm.module.css';

interface OTPFormProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function OTPForm({ onClose, onSwitchToLogin }: OTPFormProps) {
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
  });
  const [errors, setErrors] = useState<{
    phone?: string;
    otp?: string;
    general?: string;
  }>({});
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return "Phone number is required";
    if (!/^[0-9]{10}$/.test(phone))
      return "Please enter a valid 10-digit phone number";
    return null;
  };

  const validateOTP = (otp: string): string | null => {
    if (!otp.trim()) return "OTP is required";
    if (!/^[0-9]{6}$/.test(otp)) return "Please enter a valid 6-digit OTP";
    return null;
  };

  const handleSendOTP = async () => {
    setErrors({});

    // Clean phone number (remove any non-digit characters)
    const cleanPhone = formData.phone.replace(/\D/g, "");

    // Validate phone
    const phoneError = validatePhone(cleanPhone);
    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        toast.success(data.message);
      } else {
        if (response.status === 404) {
          setErrors({ general: "User not found. Please register first." });
        } else {
          setErrors({ general: data.message || "Failed to send OTP" });
        }
      }
    } catch (err) {
      setErrors({ general: "Failed to send OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setErrors({});

    // Clean phone number (remove any non-digit characters)
    const cleanPhone = formData.phone.replace(/\D/g, "");

    // Validate OTP
    const otpError = validateOTP(formData.otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await login(data.data);
        toast.success("Login successful!");
        onClose();
      } else {
        setErrors({ otp: data.message || "Invalid OTP" });
      }
    } catch (err) {
      setErrors({ general: "Failed to verify OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    otpSent ? handleVerifyOTP() : handleSendOTP();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear specific field error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Login with OTP</h2>
      <p className={styles.subtitle}>Enter your phone number to receive OTP</p>

      {errors.general && <div className={styles.error}>{errors.general}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
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
          {errors.phone && (
            <div className={styles.fieldError}>{errors.phone}</div>
          )}
        </div>

        {otpSent && (
          <div>
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
            {errors.otp && (
              <div className={styles.fieldError}>{errors.otp}</div>
            )}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          {otpSent ? "Verify OTP" : "Send OTP"}
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

      <div className={styles.switchMode}>
        <p>
          <button onClick={onSwitchToLogin}>Back to Login</button>
        </p>
      </div>
    </div>
  );
}
