import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DocumentIcon, LinkIcon, TwitterIcon, YoutubeIcon } from '../icons';
import { contentApi } from '../../services/content.api';
import type { IContent } from '../../types/content.types';
import { Skeleton } from '../common/Skeleton';

interface ShareBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleShare: (isPublic: boolean) => Promise<string | null>;
  shareLink: string | null;
  onSetItemVisibility: (contentId: string, isPublic: boolean) => Promise<string | null>;
}

const typeIcon = (type: IContent['type']) => {
  switch (type) {
    case 'twitter':
      return <TwitterIcon className="h-4 w-4 text-sky-500" />;
    case 'youtube':
      return <YoutubeIcon className="h-4 w-4 text-red-500" />;
    case 'document':
      return <DocumentIcon className="h-4 w-4 text-amber-500" />;
    default:
      return <LinkIcon className="h-4 w-4 text-brand-500" />;
  }
};

const Toggle: React.FC<{ on: boolean; disabled?: boolean; onClick: () => void }> = ({
  on,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:cursor-wait disabled:opacity-60 ${
      on ? 'bg-brand-600' : 'bg-slate-200'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        on ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const ShareBrainModal: React.FC<ShareBrainModalProps> = ({
  isOpen,
  onClose,
  onToggleShare,
  shareLink,
  onSetItemVisibility,
}) => {
  const [masterLoading, setMasterLoading] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Owns its own full (unpaginated) list of the user's content — the main
  // dashboard grid only ever holds one page, which isn't enough to let the
  // user pick from their whole collection here.
  const [items, setItems] = useState<IContent[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      try {
        setItemsLoading(true);
        const res = await contentApi.getAll({ limit: 1000 });
        if (!cancelled) setItems(res.data.items);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setItemsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const isPublic = !!shareLink;
  const publicCount = items.filter((c) => c.isPublic).length;

  const handleMasterToggle = async () => {
    try {
      setMasterLoading(true);
      await onToggleShare(!isPublic);
    } finally {
      setMasterLoading(false);
    }
  };

  const handleItemToggle = async (item: IContent) => {
    setBusyIds((prev) => new Set(prev).add(item._id));
    try {
      await onSetItemVisibility(item._id, !item.isPublic);
      setItems((prev) =>
        prev.map((c) => (c._id === item._id ? { ...c, isPublic: !item.isPublic } : c)),
      );
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(item._id);
        return next;
      });
    }
  };

  const handleCopy = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Second Brain">
      <div className="space-y-5">
        {/* Master public-page toggle */}
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Public page</p>
            <p className="text-xs text-slate-500">
              Anyone with the link can view the items you choose below.
            </p>
          </div>
          <Toggle on={isPublic} disabled={masterLoading} onClick={handleMasterToggle} />
        </div>

        {/* Shareable URL */}
        {isPublic && shareLink && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Shareable URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="w-full select-all rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs text-slate-700"
              />
              <Button variant="primary" size="sm" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        {/* Per-item selection */}
        {isPublic && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select what to share
              </label>
              {!itemsLoading && (
                <span className="text-xs font-medium text-slate-400">
                  {publicCount} of {items.length} shared
                </span>
              )}
            </div>

            {itemsLoading ? (
              <Skeleton className="h-32 rounded-xl border border-slate-100 bg-slate-50" />
            ) : items.length === 0 ? (
              <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
                You haven't saved any content yet.
              </p>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-slate-100 p-1.5">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="shrink-0">{typeIcon(item.type)}</span>
                      <span className="truncate text-sm text-slate-700">{item.title}</span>
                    </div>
                    <Toggle
                      on={!!item.isPublic}
                      disabled={busyIds.has(item._id)}
                      onClick={() => handleItemToggle(item)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
