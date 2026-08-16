import React, { useEffect } from 'react';
import type { IContent } from '../../types/content.types';
import { Badge } from '../common/Badge';
import { DocumentIcon, ExternalLinkIcon, LinkIcon, TrashIcon, TwitterIcon, YoutubeIcon } from '../icons';
import { getYouTubeEmbedUrl } from '../../utils/youtube';
import { formatRelativeDate } from '../../utils/formatters.ts';

interface ContentCardProps {
  content: IContent;
  onDelete?: (id: string) => void;
  isReadOnly?: boolean;
}
//frontend/src/utils/formatters.ts
export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onDelete,
  isReadOnly = false,
}) => {
  const { _id, title, type, link, description, tags, createdAt } = content;

  // Load Twitter widgets script dynamically if Twitter card is present
  useEffect(() => {
    if (type === 'twitter') {
      const win = window as unknown as { twttr?: { widgets?: { load?: () => void } } };
      if (!win.twttr) {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        document.body.appendChild(script);
      } else {
        win.twttr.widgets?.load?.();
      }
    }
  }, [type, link]);

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

  const renderEmbed = () => {
    if (type === 'youtube' && link) {
      const embedUrl = getYouTubeEmbedUrl(link);
      return embedUrl ? (
        <div className="w-full aspect-video rounded-xl overflow-hidden mt-3 bg-slate-100">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null;
    }

    if (type === 'twitter' && link) {
      const cleanUrl = link.replace('x.com', 'twitter.com');
      return (
        <div className="mt-3 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex justify-center max-h-96 overflow-y-auto">
          <blockquote className="twitter-twitter" data-conversation="none">
            <a href={cleanUrl}>Loading tweet...</a>
          </blockquote>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
              {renderIcon()}
            </span>
            <h4 className="font-semibold text-slate-800 line-clamp-1 text-sm tracking-tight">
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-brand-600 transition-colors"
              >
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
            )}
            {!isReadOnly && onDelete && (
              <button
                onClick={() => onDelete(_id)}
                className="p-1 hover:text-red-600 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Media / Embed Area */}
        {renderEmbed()}

        {/* Description / Content Body */}
        {description && (
          <p className="mt-3 text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tags.map((tag, idx) => (
              <Badge key={`${tag}-${idx}`} variant="primary">
                {tag}
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
  );
};