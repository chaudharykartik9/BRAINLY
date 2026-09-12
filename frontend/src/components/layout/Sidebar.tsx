import React from 'react';
import { CrossIcon, LogoIcon, TwitterIcon, YoutubeIcon, DocumentIcon, LinkIcon } from '../icons';
import type { ContentType, TagCount } from '../../types/content.types';

interface SidebarProps {
  selectedType: ContentType | 'all';
  onSelectType: (type: ContentType | 'all') => void;
  tags: TagCount[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems: { label: string; type: ContentType | 'all'; icon: React.ReactNode }[] = [
  { label: 'All Content', type: 'all', icon: <DocumentIcon className="w-5 h-5" /> },
  { label: 'Tweets', type: 'twitter', icon: <TwitterIcon className="w-5 h-5" /> },
  { label: 'Videos', type: 'youtube', icon: <YoutubeIcon className="w-5 h-5" /> },
  { label: 'Documents', type: 'document', icon: <DocumentIcon className="w-5 h-5" /> },
  { label: 'Links', type: 'link', icon: <LinkIcon className="w-5 h-5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  selectedType,
  onSelectType,
  tags,
  selectedTag,
  onSelectTag,
  isMobileOpen,
  onCloseMobile,
}) => {
  const selectType = (type: ContentType | 'all') => {
    onSelectType(type);
    onCloseMobile();
  };

  const selectTag = (tag: string) => {
    onSelectTag(selectedTag === tag ? null : tag);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-72 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-3 px-6 h-20 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <LogoIcon className="w-7 h-7" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">Brainly</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <CrossIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Categories
          </p>
          {navItems.map((item) => {
            const isActive = selectedType === item.type;
            return (
              <button
                key={item.type}
                onClick={() => selectType(item.type)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-brand-600' : 'text-slate-400'}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          {tags.length > 0 && (
            <>
              <p className="px-3 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tags
              </p>
              {tags.map((tag) => {
                const isActive = selectedTag === tag.title;
                return (
                  <button
                    key={tag.title}
                    onClick={() => selectTag(tag.title)}
                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">#{tag.title}</span>
                    <span className="text-xs text-slate-400 shrink-0">{tag.count}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};
