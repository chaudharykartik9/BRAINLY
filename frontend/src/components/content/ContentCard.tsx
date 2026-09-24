import React, { useEffect, useRef, useState } from 'react';
import type { IContent } from '../../types/content.types';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ContentPreview } from './ContentPreview';
import {
  BookmarkIcon,
  CopyIcon,
  CrossIcon,
  DocumentIcon,
  EditIcon,
  LinkIcon,
  ShareIcon,
  TrashIcon,
  TwitterIcon,
  YoutubeIcon,
} from '../icons';
import { formatRelativeDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/apiError';

interface ContentCardProps {
  content: IContent;
  onDelete?: (id: string) => void;
  onEdit?: (content: IContent) => void;
  onTogglePin?: (id: string, isPinned: boolean) => Promise<void>;
  /** Publish/unpublish this item; resolves to its public single-item URL (or null). */
  onPublish?: (id: string, isPublic: boolean) => Promise<string | null>;
  /** Opens the whole-collection "Share Brain" modal, offered as a shortcut from the item's share popover. */
  onShareBrain?: () => void;
  onTagClick?: (tagTitle: string) => void;
  isReadOnly?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

// The link's hostname reads as a much more useful footer label than a
// generic content-type word (e.g. "youtube.com" vs just "Youtube").
const getLinkName = (link: string | undefined, type: string): string => {
  if (!link) return type;
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return type;
  }
};

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onDelete,
  onEdit,
  onTogglePin,
  onPublish,
  onShareBrain,
  onTagClick,
  isReadOnly = false,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const { _id, title, type, link, notes, tags, createdAt, isPublic, isPinned } = content;
  const { showToast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const sharePopoverRef = useRef<HTMLDivElement>(null);

  const renderIcon = () => {
    switch (type) {
      case 'twitter':
        return <TwitterIcon className="w-4 h-4 text-sky-500" />;
      case 'youtube':
        return <YoutubeIcon className="w-4 h-4 text-red-500" />;
      case 'document':
        return <DocumentIcon className="w-4 h-4 text-amber-500" />;
      case 'link':
      default:
        return <LinkIcon className="w-4 h-4 text-brand-500" />;
    }
  };

  // Clicking anywhere on the card opens the saved URL directly — unless
  // selection mode is active, in which case it toggles selection instead.
  const isClickable = !isReadOnly && (isSelectionMode || !!link);

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect?.(_id);
      return;
    }
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Close the share popover on an outside click or Escape.
  useEffect(() => {
    if (!isSharePopoverOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (sharePopoverRef.current && !sharePopoverRef.current.contains(e.target as Node)) {
        setIsSharePopoverOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSharePopoverOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSharePopoverOpen]);

  // Publishes this item (idempotent) and opens a popover with its public
  // link, ready to copy, plus a shortcut into the whole-brain share flow.
  const handleOpenSharePopover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharePopoverOpen(true);
    if (!onPublish || publicUrl) return;

    try {
      setIsPublishing(true);
      const url = await onPublish(_id, true);
      setPublicUrl(url);
    } catch (err) {
      showToast(extractErrorMessage(err, 'Failed to publish this item'), 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!publicUrl || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast('Public link copied');
    } catch {
      showToast('Could not copy the link', 'error');
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onTogglePin) return;
    try {
      setIsPinning(true);
      await onTogglePin(_id, !isPinned);
    } catch (err) {
      showToast(extractErrorMessage(err, 'Failed to update pin status'), 'error');
    } finally {
      setIsPinning(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(_id);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  // Document/link previews already surface the notes text inside their preview
  // panel, so only show it separately for embed-style cards (no room for text there).
  const showSeparateNotes = notes && (type === 'youtube' || type === 'twitter');

  return (
    <>
      <div
        className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group ${
          isSelected ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200/80'
        } ${isClickable ? 'cursor-pointer' : ''}`}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        title={isSelectionMode ? undefined : isClickable ? 'Open page' : undefined}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {isSelectionMode ? (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect?.(_id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30"
                  aria-label={`Select ${title}`}
                />
              ) : (
                <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                  {renderIcon()}
                </span>
              )}
              <h4 className="font-semibold text-slate-800 line-clamp-1 text-sm tracking-tight">
                {title}
              </h4>
            </div>

            {!isSelectionMode && (
              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {!isReadOnly && onTogglePin && (
                  <button
                    type="button"
                    title={isPinned ? 'Unpin' : 'Pin to top'}
                    onClick={handleTogglePin}
                    disabled={isPinning}
                    className={`p-1 transition-colors disabled:opacity-40 ${
                      isPinned ? 'text-amber-500 hover:text-amber-600' : 'hover:text-amber-500'
                    }`}
                  >
                    <BookmarkIcon className="w-4 h-4" filled={isPinned} />
                  </button>
                )}
                {!isReadOnly && onEdit && (
                  <button
                    type="button"
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(content);
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-1 hover:text-brand-600 transition-colors"
                  >
                    <EditIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">Edit</span>
                  </button>
                )}
                {!isReadOnly && onDelete && (
                  <button
                    type="button"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsConfirmOpen(true);
                    }}
                    className="p-1 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="mt-3">
            <ContentPreview content={content} />
          </div>

          {/* Notes (embed-style cards only) */}
          {showSeparateNotes && (
            <p className="mt-3 text-sm text-slate-600 line-clamp-3 leading-relaxed">{notes}</p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {tags.map((tag) =>
                onTagClick ? (
                  <Badge
                    key={tag._id}
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick(tag.title);
                    }}
                  >
                    {tag.title}
                  </Badge>
                ) : (
                  <Badge key={tag._id} variant="primary">
                    {tag.title}
                  </Badge>
                ),
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate">Added {formatRelativeDate(createdAt)}</span>
            {!isReadOnly && isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                <BookmarkIcon className="h-2.5 w-2.5" filled />
                Pinned
              </span>
            )}
            {!isReadOnly && isPublic && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Public
              </span>
            )}
          </div>

          <div className="relative flex items-center gap-2 shrink-0" ref={sharePopoverRef}>
            {!isReadOnly && onPublish && (
              <button
                type="button"
                title="Share this item"
                onClick={handleOpenSharePopover}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1 text-[11px] font-semibold transition-colors"
              >
                <ShareIcon className="w-3 h-3" />
                Share
              </button>
            )}
            <span className="font-medium truncate max-w-28" title={getLinkName(link, type)}>
              {getLinkName(link, type)}
            </span>

            {isSharePopoverOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600">Share</span>
                  <button
                    type="button"
                    onClick={() => setIsSharePopoverOpen(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Close"
                  >
                    <CrossIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {onShareBrain && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSharePopoverOpen(false);
                      onShareBrain();
                    }}
                    className="w-full mb-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold py-2 transition-colors"
                  >
                    Share this brain
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <input
                    readOnly
                    value={isPublishing ? 'Generating link…' : (publicUrl ?? '')}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600"
                  />
                  <button
                    type="button"
                    title="Copy link"
                    onClick={handleCopyLink}
                    disabled={!publicUrl}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <CopyIcon className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Delete this content?"
          message="Are you sure you want to delete this content? This action cannot be undone."
          confirmLabel="Delete"
          loading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </>
  );
};
