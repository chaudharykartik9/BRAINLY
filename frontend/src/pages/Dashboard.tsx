import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { ContentCard } from '../components/content/ContentCard';
import { ContentFormModal } from '../components/modals/ContentFormModal';
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
  const [editingContent, setEditingContent] = useState<IContent | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await contentApi.getAll();
      setContents(res.data);
    } catch (err) {
      console.error('Failed to fetch contents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const openAddModal = () => {
    setEditingContent(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (content: IContent) => {
    setEditingContent(content);
    setIsAddModalOpen(true);
  };

  const closeContentModal = () => {
    setIsAddModalOpen(false);
    setEditingContent(null);
  };

  const handleSubmitContent = async (input: CreateContentInput) => {
    if (editingContent) {
      const res = await contentApi.update(editingContent._id, input);
      setContents((prev) => prev.map((c) => (c._id === editingContent._id ? res.data : c)));
    } else {
      const res = await contentApi.create(input);
      setContents((prev) => [res.data, ...prev]);
    }
  };

  const handleTogglePin = async (contentId: string, isPinned: boolean) => {
    const res = await contentApi.update(contentId, { isPinned });
    setContents((prev) => {
      const next = prev.map((c) => (c._id === contentId ? res.data : c));
      // Mirror the backend's { isPinned: -1, createdAt: -1 } sort exactly so
      // pinning/unpinning reorders correctly without a refetch. Sorting on
      // isPinned alone isn't enough: relying on stability to preserve
      // createdAt order breaks once an earlier pin has already reshuffled
      // the array — unpinning would then "stick" at its pinned position
      // instead of returning to its chronological spot.
      return [...next].sort((a, b) => {
        const pinDiff = Number(!!b.isPinned) - Number(!!a.isPinned);
        if (pinDiff !== 0) return pinDiff;
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      });
    });
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
      const hash = res.data?.hash ?? null;

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

  // Publish / unpublish a single item. Returns its public single-item URL.
  const handlePublish = async (
    contentId: string,
    isPublic: boolean,
  ): Promise<string | null> => {
    const res = await brainApi.publish(contentId, isPublic);
    const { content: updated, hash } = res.data;
    setContents((prev) => prev.map((c) => (c._id === contentId ? updated : c)));
    if (hash) {
      setShareLink(`${window.location.origin}/share/${hash}`);
    }
    return hash && isPublic ? `${window.location.origin}/share/${hash}/${contentId}` : null;
  };

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q) ||
        item.tags?.some((tag) => tag.title.toLowerCase().includes(q));

      return matchesType && matchesSearch;
    });
  }, [contents, selectedType, debouncedSearch]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <Sidebar selectedType={selectedType} onSelectType={setSelectedType} />

      {/* Main Workspace */}
      <div className="flex-1 ml-0 lg:ml-72 flex flex-col min-w-0">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddContent={openAddModal}
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
              onClick={openAddModal}
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
                  onPublish={handlePublish}
                  onEdit={openEditModal}
                  onTogglePin={handleTogglePin}
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
                  onClick={openAddModal}
                >
                  Add Your First Item
                </Button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ContentFormModal
        isOpen={isAddModalOpen}
        onClose={closeContentModal}
        onSubmit={handleSubmitContent}
        editingContent={editingContent}
      />

      <ShareBrainModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onToggleShare={handleToggleShare}
        shareLink={shareLink}
        contents={contents}
        onSetItemVisibility={handlePublish}
      />
    </div>
  );
};