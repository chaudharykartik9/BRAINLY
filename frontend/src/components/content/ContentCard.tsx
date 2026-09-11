import React, { useState } from 'react';
import type { IContent } from '../../types/content.types';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ContentPreview } from './ContentPreview';
import { DocumentIcon, EditIcon, ExternalLinkIcon, LinkIcon, TrashIcon, TwitterIcon, YoutubeIcon } from '../icons';
import { formatRelativeDate } from '../../utils/formatters';

interface ContentCardProps {
  content: IContent;
  onDelete?: (id: string) => void;
  onEdit?: (content: IContent) => void;
  /** Publish/unpublish this item; resolves to its public single-item URL (or null). */
  onPublish?: (id: string, isPublic: boolean) => Promise<string | null>;
  isReadOnly?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onDelete,
  onEdit,
  onPublish,
  isReadOnly = false,
}) => {
  const { _id, title, type, link, notes, tags, createdAt, isPublic } = content;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Clicking anywhere on the card opens the saved URL directly.
  const isClickable = !isReadOnly && !!link;

  const openLink = () => {
    if (!isClickable) return;
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLink();
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
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write denied — fail silently rather than show a false success.
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
        className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group ${
          isClickable ? 'cursor-pointer' : ''
        }`}
        onClick={openLink}
        onKeyDown={handleCardKeyDown}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        title={isClickable ? 'Open page' : undefined}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                {renderIcon()}
              </span>
              <h4 className="font-semibold text-slate-800 line-clamp-1 text-sm tracking-tight">
                {title}
              </h4>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-slate-400 relative">
              {copied && (
                <span
                  role="status"
                  className="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium text-white shadow-lg z-10"
                >
                  Public link copied
                </span>
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
              {tags.map((tag) => (
                <Badge key={tag._id} variant="primary">
                  {tag.title}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate">Added {formatRelativeDate(createdAt)}</span>
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
