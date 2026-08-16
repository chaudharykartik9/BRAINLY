import React from 'react';
import { Button } from '../common/Button';
import { PlusIcon, SearchIcon, ShareIcon } from '../icons';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddContent: () => void;
  onShareBrain: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onAddContent,
  onShareBrain,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-80">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, tag, or note..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="md" icon={<ShareIcon />} onClick={onShareBrain}>
          Share Brain
        </Button>
        <Button variant="primary" size="md" icon={<PlusIcon />} onClick={onAddContent}>
          Add Content
        </Button>

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 ml-2">
            <span className="text-sm font-semibold text-slate-700">{user.username}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};