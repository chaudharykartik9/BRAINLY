import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { ContentType, CreateContentInput } from '../../types/content.types';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContentInput) => Promise<void>;
}

const contentTypes: { label: string; value: ContentType }[] = [
  { label: 'YouTube', value: 'youtube' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'Document', value: 'document' },
  { label: 'Link', value: 'link' },
];

export const AddContentModal: React.FC<AddContentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentType>('youtube');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setType('youtube');
    setLink('');
    setDescription('');
    setTagsInput('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const formattedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        type,
        link: link.trim() || undefined,
        description: description.trim() || undefined,
        tags: formattedTags,
      });
      handleClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to create content';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Content">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-red-600 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Content Type Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {contentTypes.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => setType(t.value)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  type === t.value
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Title"
          placeholder="e.g. Clean Architecture Guide"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Link"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Description / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Add key insights, summaries, or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <Input
          label="Tags (comma separated)"
          placeholder="tech, productivity, react"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Content'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};