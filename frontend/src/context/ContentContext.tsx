import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { IContent, ContentType, CreateContentInput } from '../types/content.types';
import { contentApi } from '../services/content.api';
import { useAuth } from './AuthContext';

interface ContentContextType {
  contents: IContent[];
  filteredContents: IContent[];
  loading: boolean;
  error: string | null;
  selectedType: ContentType | 'all';
  searchQuery: string;
  setSelectedType: (type: ContentType | 'all') => void;
  setSearchQuery: (query: string) => void;
  fetchContents: () => Promise<void>;
  addContent: (input: CreateContentInput) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { isAuthenticated } = useAuth();

  const fetchContents = useCallback(async () => {
    if (!isAuthenticated) {
      setContents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await contentApi.getAll();
      setContents(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch content';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const addContent = async (input: CreateContentInput) => {
    const res = await contentApi.create(input);
    setContents((prev) => [res.data, ...prev]);
  };

  const deleteContent = async (id: string) => {
    await contentApi.delete(id);
    setContents((prev) => prev.filter((item) => item._id !== id));
  };

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(query));

      return matchesType && matchesSearch;
    });
  }, [contents, selectedType, searchQuery]);

  return (
    <ContentContext.Provider
      value={{
        contents,
        filteredContents,
        loading,
        error,
        selectedType,
        searchQuery,
        setSelectedType,
        setSearchQuery,
        fetchContents,
        addContent,
        deleteContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};