import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { TagInput } from '../common/TagInput';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { extractErrorMessage } from '../../utils/apiError';
import type { ContentType, CreateContentInput, IContent } from '../../types/content.types';

interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContentInput) => Promise<void>;
  /** When set, the modal edits this item instead of creating a new one. */
  editingContent?: IContent | null;
  /** Known tag titles (across the user's content) to power autocomplete. */
  tagSuggestions?: string[];
}

const contentTypes: { label: string; value: ContentType }[] = [
  { label: 'YouTube', value: 'youtube' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'Document', value: 'document' },
  { label: 'Link', value: 'link' },
];

interface FormSnapshot {
  title: string;
  type: ContentType;
  link: string;
  notes: string;
  tags: string[];
}

const emptySnapshot: FormSnapshot = { title: '', type: 'youtube', link: '', notes: '', tags: [] };

const snapshotsEqual = (a: FormSnapshot, b: FormSnapshot) =>
  a.title === b.title &&
  a.type === b.type &&
  a.link === b.link &&
  a.notes === b.notes &&
  JSON.stringify([...a.tags].sort()) === JSON.stringify([...b.tags].sort());

export const ContentFormModal: React.FC<ContentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingContent = null,
  tagSuggestions = [],
}) => {
  const isEditing = !!editingContent;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentType>('youtube');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  const initialSnapshotRef = useRef<FormSnapshot>(emptySnapshot);

  const resetForm = () => {
    setTitle('');
    setType('youtube');
    setLink('');
    setNotes('');
    setTags([]);
    setError(null);
  };

  // Populate the form from the item being edited (or reset it for a fresh
  // "Add Content" open) each time the modal is opened.
  useEffect(() => {
    if (!isOpen) return;

    if (editingContent) {
      const snapshot: FormSnapshot = {
        title: editingContent.title,
        type: editingContent.type,
        link: editingContent.link ?? '',
        notes: editingContent.notes ?? '',
        tags: (editingContent.tags ?? []).map((t) => t.title),
      };
      setTitle(snapshot.title);
      setType(snapshot.type);
      setLink(snapshot.link);
      setNotes(snapshot.notes);
      setTags(snapshot.tags);
      initialSnapshotRef.current = snapshot;
      setError(null);
    } else {
      resetForm();
      initialSnapshotRef.current = emptySnapshot;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingContent]);

  const isDirty = () => !snapshotsEqual(initialSnapshotRef.current, { title, type, link, notes, tags });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Dismiss attempts (Cancel, backdrop click, Escape) go through here so
  // unsaved edits require an explicit confirmation instead of vanishing.
  const requestClose = () => {
    if (isDirty()) {
      setIsDiscardConfirmOpen(true);
    } else {
      handleClose();
    }
  };

  const confirmDiscard = () => {
    setIsDiscardConfirmOpen(false);
    handleClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        type,
        link: link.trim() || undefined,
        notes: notes.trim() || undefined,
        tags,
      });
      handleClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, `Failed to ${isEditing ? 'update' : 'create'} content`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={requestClose} title={isEditing ? 'Edit Content' : 'Add New Content'}>
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tags
            </label>
            <TagInput
              value={tags}
              onChange={setTags}
              suggestions={tagSuggestions}
              placeholder="tech, productivity, react..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={requestClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? 'Saving...'
                  : 'Adding...'
                : isEditing
                  ? 'Save Changes'
                  : 'Add Content'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDiscardConfirmOpen}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        onConfirm={confirmDiscard}
        onCancel={() => setIsDiscardConfirmOpen(false)}
      />
    </>
  );
};
