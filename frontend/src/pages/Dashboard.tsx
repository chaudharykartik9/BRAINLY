import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { ContentCard } from '../components/content/ContentCard';
import { ContentFormModal } from '../components/modals/ContentFormModal';
import { ShareBrainModal } from '../components/modals/ShareBrainModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/common/Button';
import { PlusIcon, TrashIcon } from '../components/icons';
import { contentApi } from '../services/content.api';
import { brainApi } from '../services/brain.api';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../utils/apiError';
import type { ContentType, CreateContentInput, IContent, TagCount } from '../types/content.types';
import { useDebounce } from '../hooks/useDebounce';
import { CardGridSkeleton } from '../components/common/Skeleton';

const PAGE_SIZE = 24;

export const DashboardPage: React.FC = () => {
  const { showToast } = useToast();

  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tags, setTags] = useState<TagCount[]>([]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<IContent | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchContents = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      try {
        if (replace) setLoading(true);
        else setLoadingMore(true);

        const res = await contentApi.getAll({
          page: pageToLoad,
          limit: PAGE_SIZE,
          type: selectedType === 'all' ? undefined : selectedType,
          tag: selectedTag ?? undefined,
          search: debouncedSearch || undefined,
        });
        const { items, total, pages } = res.data;
        setContents((prev) => (replace ? items : [...prev, ...items]));
        setTotalCount(total);
        setHasMore(pageToLoad < pages);
        setPage(pageToLoad);
      } catch (err) {
        console.error('Failed to fetch contents:', err);
        showToast(extractErrorMessage(err, 'Failed to load your content'), 'error');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedType, selectedTag, debouncedSearch, showToast],
  );

  const fetchTags = useCallback(async () => {
    try {
      const res = await contentApi.getTags();
      setTags(res.data);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
      showToast(extractErrorMessage(err, 'Failed to load tags'), 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchContents(1, true);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedTag, debouncedSearch]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Keyboard shortcuts: "/" focuses search, "n" opens Add Content — skipped
  // while the user is actually typing somewhere else.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target && (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable);
      if (isTyping) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingContent(null);
        setIsAddModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  // Pagination + filters mean a mutated item's sort position or filter
  // membership can change in ways that are error-prone to patch locally
  // (pinning, in particular, already bit us once with a subtly wrong local
  // sort) — so create/update/delete/pin/bulk actions just refetch page 1
  // fresh rather than hand-patching `contents`.
  const handleSubmitContent = async (input: CreateContentInput) => {
    if (editingContent) {
      await contentApi.update(editingContent._id, input);
      showToast('Content updated');
    } else {
      await contentApi.create(input);
      showToast('Content added');
    }
    await Promise.all([fetchContents(1, true), fetchTags()]);
  };

  const handleTogglePin = async (contentId: string, isPinned: boolean) => {
    await contentApi.update(contentId, { isPinned });
    await fetchContents(1, true);
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      await contentApi.delete(contentId);
      showToast('Content deleted');
      await Promise.all([fetchContents(1, true), fetchTags()]);
    } catch (err) {
      console.error('Failed to delete content:', err);
      showToast(extractErrorMessage(err, 'Failed to delete content'), 'error');
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
      showToast(extractErrorMessage(err, 'Failed to update sharing settings'), 'error');
      setShareLink(null);
      return null;
    }
  };

  // Publish / unpublish a single item. Returns its public single-item URL.
  // This path (direct card click) keeps a local patch since publish never
  // changes sort order or filter membership, unlike pin/delete/create.
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

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
    setSelectedType('all');
  };

  // --- Bulk selection ---
  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    try {
      setBulkActionLoading(true);
      const res = await contentApi.deleteMany([...selectedIds]);
      showToast(`${res.data.deletedCount} item(s) deleted`);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      setIsBulkDeleteConfirmOpen(false);
      await Promise.all([fetchContents(1, true), fetchTags()]);
    } catch (err) {
      console.error('Bulk delete failed:', err);
      showToast(extractErrorMessage(err, 'Failed to delete selected items'), 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkPin = async (pin: boolean) => {
    setBulkActionLoading(true);
    const ids = [...selectedIds];
    const results = await Promise.allSettled(ids.map((id) => contentApi.update(id, { isPinned: pin })));
    const failed = results.filter((r) => r.status === 'rejected').length;
    showToast(
      failed
        ? `${pin ? 'Pinned' : 'Unpinned'} ${ids.length - failed} item(s), ${failed} failed`
        : `${pin ? 'Pinned' : 'Unpinned'} ${ids.length} item(s)`,
      failed ? 'error' : 'success',
    );
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setBulkActionLoading(false);
    await fetchContents(1, true);
  };

  const handleBulkPublish = async (publish: boolean) => {
    setBulkActionLoading(true);
    const ids = [...selectedIds];
    const results = await Promise.allSettled(ids.map((id) => brainApi.publish(id, publish)));
    const failed = results.filter((r) => r.status === 'rejected').length;
    showToast(
      failed
        ? `Updated ${ids.length - failed} item(s), ${failed} failed`
        : `${publish ? 'Published' : 'Unpublished'} ${ids.length} item(s)`,
      failed ? 'error' : 'success',
    );
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setBulkActionLoading(false);
    await fetchContents(1, true);
  };

  const tagSuggestions = tags.map((t) => t.title);
  const heading = selectedTag
    ? `#${selectedTag}`
    : selectedType === 'all'
      ? 'All Content'
      : `${selectedType}s`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        selectedType={selectedType}
        onSelectType={(t) => {
          setSelectedType(t);
          setSelectedTag(null);
        }}
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 ml-0 lg:ml-72 flex flex-col min-w-0">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddContent={openAddModal}
          onShareBrain={() => setIsShareModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          searchInputRef={searchInputRef}
        />

        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex-1">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight capitalize">
                {heading}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Showing {contents.length} of {totalCount} saved item{totalCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="md" onClick={toggleSelectionMode}>
                {isSelectionMode ? 'Cancel' : 'Select'}
              </Button>
              <Button variant="primary" size="md" icon={<PlusIcon />} onClick={openAddModal}>
                Add Content
              </Button>
            </div>
          </div>

          {/* Bulk action bar */}
          {isSelectionMode && (
            <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl border border-brand-100 bg-brand-50">
              <span className="text-sm font-semibold text-brand-700">{selectedIds.size} selected</span>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(contents.map((c) => c._id)))}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Select all loaded
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Clear
              </button>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedIds.size || bulkActionLoading}
                onClick={() => handleBulkPin(true)}
              >
                Pin
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedIds.size || bulkActionLoading}
                onClick={() => handleBulkPin(false)}
              >
                Unpin
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedIds.size || bulkActionLoading}
                onClick={() => handleBulkPublish(true)}
              >
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedIds.size || bulkActionLoading}
                onClick={() => handleBulkPublish(false)}
              >
                Unpublish
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<TrashIcon />}
                disabled={!selectedIds.size || bulkActionLoading}
                onClick={() => setIsBulkDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
            </div>
          )}

          {/* Cards Grid / Empty State */}
          {loading ? (
            <CardGridSkeleton count={6} />
          ) : contents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contents.map((content) => (
                  <ContentCard
                    key={content._id}
                    content={content}
                    onDelete={handleDeleteContent}
                    onPublish={handlePublish}
                    onEdit={openEditModal}
                    onTogglePin={handleTogglePin}
                    onTagClick={handleSelectTag}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.has(content._id)}
                    onToggleSelect={toggleSelectItem}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => fetchContents(page + 1, false)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">No content found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || selectedTag
                  ? 'No items matched your search criteria. Try a different query.'
                  : 'Your collection is empty. Start adding links, tweets, videos, or documents.'}
              </p>
              {!searchQuery && !selectedTag && (
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
        tagSuggestions={tagSuggestions}
      />

      <ShareBrainModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onToggleShare={handleToggleShare}
        shareLink={shareLink}
        onSetItemVisibility={handlePublish}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteConfirmOpen}
        title={`Delete ${selectedIds.size} item(s)?`}
        message="This will permanently delete all selected items. This action cannot be undone."
        confirmLabel="Delete"
        loading={bulkActionLoading}
        onConfirm={handleBulkDelete}
        onCancel={() => setIsBulkDeleteConfirmOpen(false)}
      />
    </div>
  );
};
