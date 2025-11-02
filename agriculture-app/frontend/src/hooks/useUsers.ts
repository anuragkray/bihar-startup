import { useState, useEffect } from 'react';
import { IUser, CreateUserRequest, UpdateUserRequest, ApiResponse, PaginatedResponse } from '@/types/user';

export const useUsers = (page: number = 1, limit: number = 10) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchUsers = async (filters?: {
    role?: string;
    search?: string;
    isActive?: boolean;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.role) params.append('role', filters.role);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      const response = await fetch(`/api/users?${params.toString()}`);
      const data: PaginatedResponse<IUser> = await response.json();

      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit]);

  return { users, loading, error, pagination, refetch: fetchUsers };
};

export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`);
      const data: ApiResponse<IUser> = await response.json();

      if (data.success && data.data) {
        setUser(data.data);
      } else {
        setError(data.message || 'Failed to fetch user');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return { user, loading, error, refetch: fetchUser };
};

export const useUserActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (userData: CreateUserRequest): Promise<IUser | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse<IUser> = await response.json();

      if (data.success && data.data) {
        return data.data;
      } else {
        setError(data.message || 'Failed to create user');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: UpdateUserRequest): Promise<IUser | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse<IUser> = await response.json();

      if (data.success && data.data) {
        return data.data;
      } else {
        setError(data.message || 'Failed to update user');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, permanent: boolean = false): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}?permanent=${permanent}`, {
        method: 'DELETE',
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        return true;
      } else {
        setError(data.message || 'Failed to delete user');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, updateUser, deleteUser, loading, error };
};
