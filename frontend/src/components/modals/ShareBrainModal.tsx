import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ShareBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleShare: (isPublic: boolean) => Promise<string | null>;
  initialShareLink?: string | null;
}

export const ShareBrainModal: React.FC<ShareBrainModalProps> = ({
  isOpen,
  onClose,
  onToggleShare,
  initialShareLink = null,
}) => {
  const [shareLink, setShareLink] = useState<string | null>(initialShareLink);
  const [isPublic, setIsPublic] = useState<boolean>(!!initialShareLink);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggle = async () => {
    const nextState = !isPublic;
    try {
      setLoading(true);
      const link = await onToggleShare(nextState);
      setIsPublic(nextState);
      setShareLink(nextState ? link : null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Second Brain">
      <div className="space-y-5">
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-slate-800">Public Link</p>
            <p className="text-xs text-slate-500">
              Anyone with this link can view your saved items.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isPublic ? 'bg-brand-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {isPublic && shareLink && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Shareable URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border bg-slate-50 border-slate-200 text-slate-700 select-all"
              />
              <Button variant="primary" size="sm" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};