import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../common/Button';
import { MenuIcon, MoonIcon, PlusIcon, SearchIcon, ShareIcon, SunIcon } from '../icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the profile menu on an outside click or Escape.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 sm:px-8 flex items-center gap-3 justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — opens the mobile category/tag drawer */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden shrink-0"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="relative w-full max-w-xs sm:max-w-none sm:w-80">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search... (press /)"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <Button variant="primary" size="md" icon={<PlusIcon />} onClick={onAddContent}>
          <span className="hidden sm:inline">Add Content</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {user && (
          <div className="relative pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700 ml-1 sm:ml-2" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              title={user.username}
              aria-label="Account menu"
              className="w-9 h-9 shrink-0 rounded-full bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 font-semibold flex items-center justify-center hover:bg-brand-200 dark:hover:bg-brand-500/25 transition-colors"
            >
              {user.username.charAt(0).toUpperCase()}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-lg z-30">
                <div className="px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {user.username}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onShareBrain();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  Public Brain
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
