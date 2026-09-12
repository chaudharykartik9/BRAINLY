import React, { useState } from 'react';
import type { IContent } from '../../types/content.types';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ContentPreview } from './ContentPreview';
import { DocumentIcon, EditIcon, ExternalLinkIcon, LinkIcon, PinIcon, TrashIcon, TwitterIcon, YoutubeIcon } from '../icons';
import { formatRelativeDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface ContentCardProps {
  content: IContent;
  onDelete?: (id: string) => void;
  onEdit?: (content: IContent) => void;
  onTogglePin?: (id: string, isPinned: boolean) => Promise<void>;
  /** Publish/unpublish this item; resolves to its public single-item URL (or null). */
  onPublish?: (id: string, isPublic: boolean) => Promise<string | null>;
  onTagClick?: (tagTitle: string) => void;
  isReadOnly?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onDelete,
  onEdit,
  onTogglePin,
  onPublish,
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

  // Publishes this item (idempotent) and shares its public link — the native
  // share sheet where available, clipboard copy otherwise. Never navigates.
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onPublish) return;

    let publicUrl: string | null = null;
    try {
      setIsPublishing(true);
      publicUrl = await onPublish(_id, true);
    } catch {
      return; // publish failed — leave the card as-is
    } finally {
      setIsPublishing(false);
    }
    if (!publicUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: notes || undefined, url: publicUrl });
      } catch {
        // AbortError (user cancelled) or any other failure — not fatal.
      }
      return;
    }

    try {
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(publicUrl);
      showToast('Public link copied');
    } catch {
      // Clipboard write denied — fail silently rather than show a false success.
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onTogglePin) return;
    try {
      setIsPinning(true);
      await onTogglePin(_id, !isPinned);
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
                    <PinIcon className="w-4 h-4" filled={isPinned} />
                  </button>
                )}
                {!isReadOnly && onPublish && (
                  <button
                    type="button"
                    title={isPublic ? 'Share public link' : 'Publish & share'}
                    onClick={handleShare}
                    disabled={isPublishing}
                    className="p-1 hover:text-brand-600 transition-colors disabled:opacity-40"
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
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
                    className="p-1 hover:text-brand-600 transition-colors"
                  >
                    <EditIcon className="w-4 h-4" />
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
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate">Added {formatRelativeDate(createdAt)}</span>
            {!isReadOnly && isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                <PinIcon className="h-2.5 w-2.5" filled />
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
          <span className="capitalize font-medium shrink-0">{type}</span>
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
