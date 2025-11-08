'use client';

import { useState } from 'react';
import { useUserActions } from '@/hooks/useUsers';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-toastify';
import { Button, Input } from '@/components/common';
import styles from './AuthForm.module.css';

interface RegisterFormProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onClose, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: 'Bihar',
    pincode: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    address?: string;
    city?: string;
    pincode?: string;
    general?: string;
  }>({});
  const { createUser, loading } = useUserActions();
  const { login } = useUser();

  // Form validation
  const validateName = (name: string): string | null => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (name.trim().length > 100) return "Name cannot exceed 100 characters";
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return "Phone number is required";
    if (!/^[0-9]{10}$/.test(phone))
      return "Please enter a valid 10-digit phone number";
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return null; // Email is optional
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validateAddress = (address: string): string | null => {
    if (!address.trim()) return "Address is required";
    if (address.trim().length < 5)
      return "Address must be at least 5 characters";
    return null;
  };

  const validateCity = (city: string): string | null => {
    if (!city.trim()) return "City is required";
    if (city.trim().length < 2) return "City must be at least 2 characters";
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const validatePincode = (pincode: string): string | null => {
    if (!pincode.trim()) return "Pincode is required";
    if (!/^[0-9]{6}$/.test(pincode))
      return "Please enter a valid 6-digit pincode";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate all fields
    const newErrors: typeof errors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

    const cityError = validateCity(formData.city);
    if (cityError) newErrors.city = cityError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    const pincodeError = validatePincode(formData.pincode);
    if (pincodeError) newErrors.pincode = pincodeError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create user with password
    const newUser = await createUser({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      password: formData.password,
      address: {
        type: "home",
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        isDefault: true,
      },
    });

    if (newUser) {
      toast.success("Registration successful! Please login with your credentials.");
      onSwitchToLogin();
    } else {
      setErrors({
        general: "Registration failed. Phone number may already exist.",
      });
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
      <h2 className={styles.title}>Create Account</h2>
      <p className={styles.subtitle}>Register to start shopping</p>

      {errors.general && <div className={styles.error}>{errors.general}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
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
          {errors.name && (
            <div className={styles.fieldError}>{errors.name}</div>
          )}
        </div>

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
          />
          {errors.phone && (
            <div className={styles.fieldError}>{errors.phone}</div>
          )}
        </div>

        <div>
          <Input
            type="email"
            id="email"
            name="email"
            label="Email (Optional)"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            fullWidth
          />
          {errors.email && (
            <div className={styles.fieldError}>{errors.email}</div>
          )}
        </div>

        <div>
          <Input
            type="password"
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
            fullWidth
          />
          {errors.password && (
            <div className={styles.fieldError}>{errors.password}</div>
          )}
        </div>

        <div>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
            fullWidth
          />
          {errors.confirmPassword && (
            <div className={styles.fieldError}>{errors.confirmPassword}</div>
          )}
        </div>

        <div>
          <Input
            type="text"
            id="address"
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House no., Street name, Area"
            required
            fullWidth
          />
          {errors.address && (
            <div className={styles.fieldError}>{errors.address}</div>
          )}
        </div>

        <div className={styles.formRow}>
          <div>
            <Input
              type="text"
              id="city"
              name="city"
              label="City"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              required
              fullWidth
            />
            {errors.city && (
              <div className={styles.fieldError}>{errors.city}</div>
            )}
          </div>

          <div>
            <Input
              type="text"
              id="pincode"
              name="pincode"
              label="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              pattern="[0-9]{6}"
              required
              fullWidth
            />
            {errors.pincode && (
              <div className={styles.fieldError}>{errors.pincode}</div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Create Account
        </Button>
      </form>

      <div className={styles.switchMode}>
        <p>
          Already have an account?{" "}
          <button onClick={onSwitchToLogin}>Login here</button>
        </p>
      </div>
    </div>
  );
}
