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
  mode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, mode = 'login' }: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    street: '',
    city: '',
    state: 'Bihar',
    pincode: '',
  });
  const [error, setError] = useState('');
  const { createUser, loading } = useUserActions();
  const { login } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (currentMode === "register") {
      // Show toast that registration is not allowed and close modal
      toast.info(
        "We are not allowing new registration right now. Please keep in touch.",
        { autoClose: 5000 }
      );
      onClose();
      return;
      // // Validate required fields
      // if (!formData.name || !formData.email || !formData.phone) {
      //   setError('Please fill in all required fields');
      //   return;
      // }

      // // Create user
      // const newUser = await createUser({
      //   name: formData.name,
      //   email: formData.email,
      //   phone: formData.phone,
      //   address: formData.street
      //     ? {
      //         type: 'home',
      //         street: formData.street,
      //         city: formData.city,
      //         state: formData.state,
      //         pincode: formData.pincode,
      //         isDefault: true,
      //       }
      //     : undefined,
      // });

      // if (newUser) {
      //   try {
      //     await login(newUser);
      //     onClose();
      //   } catch (err) {
      //     setError('Login failed after registration. Please try logging in manually.');
      //   }
      // } else {
      //   setError('Registration failed. Email or phone may already exist.');
      // }
    } else {
      // Login - find user by email or phone
      try {
        const response = await fetch(
          `/api/users?search=${encodeURIComponent(
            formData.email || formData.phone
          )}&limit=1`
        );
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          await login(data.data[0]);
          onClose();
        } else {
          setError("User not found. Please register first.");
        }
      } catch (err) {
        setError("Login failed. Please try again.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2 className={styles.title}>
          {currentMode === "login" ? "Welcome Back!" : "Create Account"}
        </h2>
        <p className={styles.subtitle}>
          {currentMode === "login"
            ? "Login to access your cart and orders"
            : "Register to start shopping"}
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {currentMode === "register" && (
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

          <Input
            type="email"
            id="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
            fullWidth
          />

          {currentMode === "register" && (
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

          {currentMode === "login" && (
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

          {currentMode === "register" && (
            <>
              <Input
                type="text"
                id="street"
                name="street"
                label="Street Address"
                value={formData.street}
                onChange={handleChange}
                placeholder="House no., Street name"
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
            {currentMode === "login" ? "Login" : "Create Account"}
          </Button>
        </form>

        <div className={styles.switchMode}>
          {currentMode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button onClick={() => setCurrentMode("register")}>
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button onClick={() => setCurrentMode("login")}>
                Login here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
