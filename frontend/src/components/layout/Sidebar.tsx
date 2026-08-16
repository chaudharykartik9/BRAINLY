import React from 'react';
import { LogoIcon, TwitterIcon, YoutubeIcon, DocumentIcon, LinkIcon } from '../icons';
import type { ContentType } from '../../types/content.types';

interface SidebarProps {
  selectedType: ContentType | 'all';
  onSelectType: (type: ContentType | 'all') => void;
}

const navItems: { label: string; type: ContentType | 'all'; icon: React.ReactNode }[] = [
  { label: 'All Content', type: 'all', icon: <DocumentIcon className="w-5 h-5" /> },
  { label: 'Tweets', type: 'twitter', icon: <TwitterIcon className="w-5 h-5" /> },
  { label: 'Videos', type: 'youtube', icon: <YoutubeIcon className="w-5 h-5" /> },
  { label: 'Documents', type: 'document', icon: <DocumentIcon className="w-5 h-5" /> },
  { label: 'Links', type: 'link', icon: <LinkIcon className="w-5 h-5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ selectedType, onSelectType }) => {
  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100">
        <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
          <LogoIcon className="w-7 h-7" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">Brainly</span>
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
              onClick={() => onSelectType(item.type)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={isActive ? 'text-brand-600' : 'text-slate-400'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};