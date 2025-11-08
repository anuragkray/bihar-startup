'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useUserActions } from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { Button, Input, Select } from '@/components/common';
import styles from './ProfileClient.module.css';

export default function ProfileClient() {
  const { user, isAuthenticated, updateUser } = useUser();
  const { updateUser: updateUserAPI, loading } = useUserActions();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: '',
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    address: '',
    city: '',
    state: 'Bihar',
    pincode: '',
    isDefault: false,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profilePhoto: user.profilePhoto || '',
      });
      setAddresses(user.addresses || []);
    }
  }, [user, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!user?._id) return;

    const updatedUser = await updateUserAPI(user._id as string, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      profilePhoto: formData.profilePhoto,
      addresses,
    });

    if (updatedUser) {
      updateUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.address || !newAddress.city || !newAddress.pincode) {
      setMessage({ type: 'error', text: 'Please fill all address fields' });
      return;
    }

    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    setNewAddress({
      type: 'home',
      address: '',
      city: '',
      state: 'Bihar',
      pincode: '',
      isDefault: false,
    });
    setShowAddressForm(false);
    setMessage({ type: 'success', text: 'Address added! Click Update Profile to save.' });
  };

  const handleRemoveAddress = (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  };

  const handleSetDefaultAddress = (index: number) => {
    const updatedAddresses = addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }));
    setAddresses(updatedAddresses);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <h1 className={styles.title}>My Profile</h1>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>

            <Input
              type="text"
              id="name"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />

            <div className={styles.formRow}>
              <Input
                type="email"
                id="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />

              <Input
                type="tel"
                id="phone"
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                required
                fullWidth
              />
            </div>

            <Input
              type="url"
              id="profilePhoto"
              name="profilePhoto"
              label="Profile Photo URL"
              value={formData.profilePhoto}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              fullWidth
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Saved Addresses</h2>
              <Button
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                variant="secondary"
                size="small"
              >
                {showAddressForm ? 'Cancel' : '+ Add Address'}
              </Button>
            </div>

            {showAddressForm && (
              <div className={styles.addressForm}>
                <Select
                  id="type"
                  name="type"
                  label="Address Type"
                  value={newAddress.type}
                  onChange={handleAddressChange}
                  options={[
                    { value: 'home', label: 'Home' },
                    { value: 'work', label: 'Work' },
                    { value: 'other', label: 'Other' },
                  ]}
                  fullWidth
                />

                <Input
                  type="text"
                  id="address"
                  name="address"
                  label="Address"
                  value={newAddress.address}
                  onChange={handleAddressChange}
                  placeholder="House no., Street name, Area"
                  required
                  fullWidth
                />

                <div className={styles.formRow}>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    label="City"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    required
                    fullWidth
                  />

                  <Input
                    type="text"
                    id="pincode"
                    name="pincode"
                    label="Pincode"
                    value={newAddress.pincode}
                    onChange={handleAddressChange}
                    pattern="[0-9]{6}"
                    required
                    fullWidth
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleAddAddress}
                  variant="secondary"
                  fullWidth
                >
                  Save Address
                </Button>
              </div>
            )}

            <div className={styles.addressList}>
              {addresses.map((address, index) => (
                <div key={index} className={styles.addressCard}>
                  <div className={styles.addressHeader}>
                    <span className={styles.addressType}>{address.type.toUpperCase()}</span>
                    {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
                  </div>
                  <p className={styles.addressText}>
                    {address.address}, {address.city}
                  </p>
                  <p className={styles.addressText}>
                    {address.state} - {address.pincode}
                  </p>
                  <div className={styles.addressActions}>
                    {!address.isDefault && (
                      <Button
                        type="button"
                        onClick={() => handleSetDefaultAddress(index)}
                        variant="outline"
                        size="small"
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => handleRemoveAddress(index)}
                      variant="danger"
                      size="small"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading} disabled={loading}>
            Update Profile
          </Button>
        </form>
      </div>
    </div>
  );
}
