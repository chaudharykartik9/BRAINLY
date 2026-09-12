import React from 'react';
import { Button } from '../common/Button';
import { MenuIcon, PlusIcon, SearchIcon, ShareIcon } from '../icons';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddContent: () => void;
  onShareBrain: () => void;
  onOpenMobileMenu: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onAddContent,
  onShareBrain,
  onOpenMobileMenu,
  searchInputRef,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-4 sm:px-8 flex items-center gap-3 justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — opens the mobile category/tag drawer */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden shrink-0"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="relative w-full max-w-xs sm:max-w-none sm:w-80">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search... (press /)"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <Button variant="secondary" size="md" icon={<ShareIcon />} onClick={onShareBrain}>
          <span className="hidden sm:inline">Share Brain</span>
        </Button>
        <Button variant="primary" size="md" icon={<PlusIcon />} onClick={onAddContent}>
          <span className="hidden sm:inline">Add Content</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200 ml-1 sm:ml-2">
            <span className="hidden md:inline text-sm font-semibold text-slate-700">{user.username}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
