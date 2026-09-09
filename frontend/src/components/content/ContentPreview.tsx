import React, { useEffect, useRef, useState } from 'react';
import type { IContent } from '../../types/content.types';
import { getYouTubeEmbedUrl } from '../../utils/youtube';
import {
  extractTweetId,
  extractTwitterHandle,
  getFileExtension,
  getUrlDomain,
} from '../../utils/extractors';
import { DocumentIcon, ExternalLinkIcon, LinkIcon, TwitterIcon, YoutubeIcon } from '../icons';

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        createTweet?: (
          tweetId: string,
          container: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
      };
    };
  }
}

let twitterScriptPromise: Promise<void> | null = null;
const loadTwitterScript = (): Promise<void> => {
  if (window.twttr?.widgets?.createTweet) return Promise.resolve();
  if (twitterScriptPromise) return twitterScriptPromise;

  twitterScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Twitter widgets script'));
    document.body.appendChild(script);
  });

  return twitterScriptPromise;
};

interface ContentPreviewProps {
  content: IContent;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({ content }) => {
  switch (content.type) {
    case 'youtube':
      return <YoutubePreview content={content} />;
    case 'twitter':
      return <TwitterPreview content={content} />;
    case 'document':
      return <DocumentPreview content={content} />;
    default:
      return <LinkPreview content={content} />;
  }
};

const PreviewShell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`w-full min-h-[140px] rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-2 justify-center ${className}`}
  >
    {children}
  </div>
);

const YoutubePreview: React.FC<{ content: IContent }> = ({ content }) => {
  const embedUrl = content.link ? getYouTubeEmbedUrl(content.link) : null;

  if (!embedUrl) {
    return (
      <PreviewShell>
        <div className="flex items-center gap-2 text-red-500">
          <YoutubeIcon className="w-5 h-5" />
          <span className="text-xs font-semibold text-slate-500">YouTube</span>
        </div>
        <p className="text-sm text-slate-400 italic">No valid video link attached.</p>
      </PreviewShell>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
      <iframe
        src={embedUrl}
        title={content.title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const TwitterPreview: React.FC<{ content: IContent }> = ({ content }) => {
  const { link } = content;
  const tweetId = extractTweetId(link);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    tweetId ? 'loading' : 'error'
  );

  useEffect(() => {
    if (!tweetId || !containerRef.current) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    const container = containerRef.current;
    container.innerHTML = '';
    setStatus('loading');

    // Guard against the script/API hanging forever — never show "Loading" permanently.
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === 'loading' ? 'error' : s));
    }, 6000);

    loadTwitterScript()
      .then(() => window.twttr?.widgets?.createTweet?.(tweetId, container, {
        theme: 'light',
        conversation: 'none',
        dnt: true,
      }))
      .then((el) => {
        if (cancelled) {
          // This effect run was superseded (e.g. React StrictMode's dev-only
          // double-invoke) before the widget finished loading — the tweet
          // still got appended into the shared container, so remove it
          // rather than leaving a duplicate embed behind.
          el?.remove();
          return;
        }
        window.clearTimeout(timeoutId);
        setStatus(el ? 'success' : 'error');
      })
      .catch(() => {
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        setStatus('error');
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [tweetId]);

  if (status === 'error') {
    return <TwitterFallback content={content} />;
  }

  return (
    <div className="relative min-h-[160px] max-h-96 overflow-y-auto rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
      {status === 'loading' && (
        <span className="text-xs font-medium text-slate-400 absolute">Loading post…</span>
      )}
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
};

const TwitterFallback: React.FC<{ content: IContent }> = ({ content }) => {
  const { title, link, notes } = content;
  const handle = extractTwitterHandle(link);

  return (
    <PreviewShell className="items-start">
      <div className="flex items-center gap-2 text-sky-500">
        <TwitterIcon className="w-5 h-5" />
        <span className="text-xs font-semibold text-slate-500">
          {handle ? `@${handle}` : 'X / Twitter post'}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-700 line-clamp-2">{title}</p>
      {notes && <p className="text-xs text-slate-500 line-clamp-2">{notes}</p>}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center gap-1 mt-1"
        >
          View original post <ExternalLinkIcon className="w-3 h-3" />
        </a>
      )}
    </PreviewShell>
  );
};

const DocumentPreview: React.FC<{ content: IContent }> = ({ content }) => {
  const { link, notes } = content;
  const ext = getFileExtension(link);

  return (
    <PreviewShell className="items-start bg-amber-50/60 border-amber-100">
      <div className="flex items-center gap-2 text-amber-600">
        <DocumentIcon className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {ext ? `${ext} Document` : 'Document Preview'}
        </span>
      </div>
      {notes ? (
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
          {notes}
        </p>
      ) : (
        <p className="text-sm text-slate-400 italic">No preview text added for this document yet.</p>
      )}
    </PreviewShell>
  );
};

const LinkPreview: React.FC<{ content: IContent }> = ({ content }) => {
  const { link, notes, title } = content;
  const domain = getUrlDomain(link);

  return (
    <PreviewShell className="items-start bg-gradient-to-br from-slate-50 to-brand-50/40">
      <div className="flex items-center gap-2 text-brand-600 min-w-0 w-full">
        <LinkIcon className="w-5 h-5 shrink-0" />
        <span className="text-xs font-semibold text-slate-500 truncate">
          {domain || 'Personal note'}
        </span>
      </div>
      {notes ? (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{notes}</p>
      ) : (
        <p className="text-sm text-slate-500 font-medium line-clamp-1">{title}</p>
      )}
      {link && <span className="text-xs text-slate-400 truncate w-full">{link}</span>}
    </PreviewShell>
  );
};
