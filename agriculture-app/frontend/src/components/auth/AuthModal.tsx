'use client';

import { useState } from 'react';
import { useUserActions } from '@/hooks/useUsers';
import { useUser } from '@/context/UserContext';
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
      // Show alert that registration is not allowed
      alert(
        "We are not allowing new registration right now. Please keep in touch."
      );
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
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          {currentMode === "register" && (
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                required
              />
            </div>
          )}

          {currentMode === "login" && (
            <div className={styles.formGroup}>
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
          )}

          {currentMode === "register" && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="street">Street Address</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="House no., Street name"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    pattern="[0-9]{6}"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : currentMode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <div className={styles.switchMode}>
          {currentMode === "login" ? (
            <p>
              Don't have an account?{" "}
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
