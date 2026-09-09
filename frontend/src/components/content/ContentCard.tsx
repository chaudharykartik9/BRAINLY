import React, { useState } from 'react';
import type { IContent } from '../../types/content.types';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ContentPreview } from './ContentPreview';
import { DocumentIcon, ExternalLinkIcon, LinkIcon, TrashIcon, TwitterIcon, YoutubeIcon } from '../icons';
import { formatRelativeDate } from '../../utils/formatters';

interface ContentCardProps {
  content: IContent;
  onDelete?: (id: string) => void;
  isReadOnly?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onDelete,
  isReadOnly = false,
}) => {
  const { _id, title, type, link, notes, tags, createdAt } = content;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Shares the saved link (native share sheet where available, clipboard
  // copy otherwise) — never navigates to the page itself.
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!link) return;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: link });
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

            <div className="flex items-center gap-1 shrink-0 text-slate-400">
              {link && (
                <button
                  type="button"
                  title={copied ? 'Copied!' : 'Share'}
                  onClick={handleShare}
                  className="p-1 hover:text-brand-600 transition-colors"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
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
          <span>Added {formatRelativeDate(createdAt)}</span>
          <span className="capitalize font-medium">{type}</span>
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
