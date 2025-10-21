'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '@/types/user';

interface UserContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  login: (user: IUser) => void;
  logout: () => void;
  updateUser: (user: IUser) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('km-agri-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('km-agri-user');
      }
    }
  }, []);

  const login = (userData: IUser) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('km-agri-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('km-agri-user');
  };

  const updateUser = (userData: IUser) => {
    setUser(userData);
    localStorage.setItem('km-agri-user', JSON.stringify(userData));
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
