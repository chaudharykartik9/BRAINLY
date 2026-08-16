import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { ContentCard } from '../components/content/ContentCard';
import { AddContentModal } from '../components/modals/AddContentModal';
import { ShareBrainModal } from '../components/modals/ShareBrainModal';
import { Button } from '../components/common/Button';
import { PlusIcon } from '../components/icons';
import { contentApi } from '../services/content.api';
import { brainApi } from '../services/brain.api';
import type { ContentType, CreateContentInput, IContent } from '../types/content.types';
import { useDebounce } from '../hooks/useDebounce';

export const DashboardPage: React.FC = () => {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await contentApi.getAll();
      // Safely extract the array whether returned directly or nested in ApiResponse.data
      const contentList = Array.isArray(res.data) 
        ? res.data 
        : res.data.data || [];
      setContents(contentList);
    } catch (err) {
      console.error('Failed to fetch contents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleAddContent = async (input: CreateContentInput) => {
    const res = await contentApi.create(input);
    const newContent = res.data.data ?? (res.data as unknown as IContent);
    setContents((prev) => [newContent, ...prev]);
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      await contentApi.delete(contentId);
      setContents((prev) => prev.filter((item) => item._id !== contentId));
    } catch (err) {
      console.error('Failed to delete content:', err);
    }
  };

const handleToggleShare = async (isPublic: boolean): Promise<string | null> => {
    try {
      const res = await brainApi.toggleShare(isPublic);
      // res.data contains the response payload directly
      const hash = (res.data as any)?.hash || (res.data as any)?.data?.hash;
      
      if (hash) {
        const generatedLink = `${window.location.origin}/share/${hash}`;
        setShareLink(generatedLink);
        return generatedLink;
      }
      setShareLink(null);
      return null;
    } catch (err) {
      console.error('Failed to toggle brain sharing:', err);
      setShareLink(null);
      return null;
    }
  };

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(q));

      return matchesType && matchesSearch;
    });
  }, [contents, selectedType, debouncedSearch]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <Sidebar selectedType={selectedType} onSelectType={setSelectedType} />

      {/* Main Workspace */}
      <div className="flex-1 ml-72 flex flex-col min-w-0">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddContent={() => setIsAddModalOpen(true)}
          onShareBrain={() => setIsShareModalOpen(true)}
        />

        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight capitalize">
                {selectedType === 'all' ? 'All Content' : `${selectedType}s`}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Showing {filteredContents.length} saved item{filteredContents.length === 1 ? '' : 's'}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={<PlusIcon />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Content
            </Button>
          </div>

          {/* Cards Grid / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-64 bg-slate-200/60 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredContents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContents.map((content) => (
                <ContentCard
                  key={content._id}
                  content={content}
                  onDelete={handleDeleteContent}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">No content found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No items matched your search criteria. Try a different query.'
                  : 'Your collection is empty. Start adding links, tweets, videos, or documents.'}
              </p>
              {!searchQuery && (
                <Button
                  variant="primary"
                  size="md"
                  icon={<PlusIcon />}
                  className="mt-6"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Your First Item
                </Button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddContent}
      />

      <ShareBrainModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onToggleShare={handleToggleShare}
        initialShareLink={shareLink}
      />
    </div>
  );
};