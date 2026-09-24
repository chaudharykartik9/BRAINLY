import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ShareBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleShare: (isPublic: boolean) => Promise<string | null>;
  shareLink: string | null;
}

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
      on ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
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
}) => {
  const [masterLoading, setMasterLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPublic = !!shareLink;

  const handleMasterToggle = async () => {
    try {
      setMasterLoading(true);
      await onToggleShare(!isPublic);
    } finally {
      setMasterLoading(false);
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
        <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Public page</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anyone with the link can view your saved items.
            </p>
          </div>
          <Toggle on={isPublic} disabled={masterLoading} onClick={handleMasterToggle} />
        </div>

        {/* Shareable URL */}
        {isPublic && shareLink && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Shareable URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="w-full select-all rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 font-mono text-xs text-slate-700 dark:text-slate-300"
              />
              <Button variant="primary" size="sm" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end border-t border-slate-100 dark:border-slate-700 pt-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
