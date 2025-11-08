'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-toastify';
import { Button, Input } from '@/components/common';
import styles from './AuthForm.module.css';

interface LoginFormProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToOTP: () => void;
}

export default function LoginForm({ onClose, onSwitchToRegister, onSwitchToOTP }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate login credentials
    if (!formData.email) {
      setErrors({ general: "Please enter email or phone number" });
      return;
    }

    if (!formData.password) {
      setErrors({ general: "Please enter your password" });
      return;
    }

    // Prepare login payload - send either email OR phone, not both
    const loginPayload: any = {
      password: formData.password,
    };

    // Determine if input is email or phone
    const inputValue = formData.email.trim();
    if (inputValue) {
      // Check if it looks like an email
      if (inputValue.includes('@')) {
        loginPayload.email = inputValue;
      } else {
        // Treat as phone number
        loginPayload.phone = inputValue.replace(/\D/g, '');
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json();

      if (data.success) {
        await login(data.data);
        toast.success("Login successful!");
        onClose();
      } else {
        setErrors({ general: data.message || "Invalid credentials" });
      }
    } catch (err) {
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
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
      <h2 className={styles.title}>Welcome Back!</h2>
      <p className={styles.subtitle}>Login to access your cart and orders</p>

      {errors.general && <div className={styles.error}>{errors.general}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <Input
            type="email"
            id="email"
            name="email"
            label="Email or Phone"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email or phone number"
            required
            fullWidth
          />
          {errors.email && (
            <div className={styles.fieldError}>{errors.email}</div>
          )}
        </div>

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

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Login
        </Button>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={onSwitchToOTP}
        >
          Login with Mobile OTP
        </Button>
      </form>

      <div className={styles.switchMode}>
        <p>
          Don&apos;t have an account?{" "}
          <button onClick={onSwitchToRegister}>Register here</button>
        </p>
      </div>
    </div>
  );
}
