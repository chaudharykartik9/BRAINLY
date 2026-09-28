import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useTheme } from '../context/ThemeContext';
import {
  BookmarkIcon,
  DocumentIcon,
  EditIcon,
  LinkIcon,
  LogoIcon,
  MoonIcon,
  PinIcon,
  SearchIcon,
  ShareIcon,
  SunIcon,
  TwitterIcon,
  YoutubeIcon,
} from '../components/icons';

const features: { icon: React.ReactNode; title: string; description: string }[] = [
  {
    icon: <BookmarkIcon className="w-5 h-5" />,
    title: 'Save & organize',
    description:
      'Links, tweets, YouTube videos, documents, and freeform notes — each tagged and given a type-specific preview card automatically.',
  },
  {
    icon: <EditIcon className="w-5 h-5" />,
    title: 'Edit anytime',
    description: "Update an item's title, type, link, notes, or tags after the fact. Nothing is create-only.",
  },
  {
    icon: <PinIcon className="w-5 h-5" />,
    title: 'Pin what matters',
    description: 'Pin your most important items so they always sort to the top of your collection.',
  },
  {
    icon: <ShareIcon className="w-5 h-5" />,
    title: 'Share on your terms',
    description:
      'Publish a read-only page of your brain and choose exactly which items are public — per item, not all-or-nothing.',
  },
  {
    icon: <SearchIcon className="w-5 h-5" />,
    title: 'Find things fast',
    description: 'Search across titles, notes, and tags, or filter by content type and click-to-filter tag pills.',
  },
  {
    icon: <MoonIcon className="w-5 h-5" />,
    title: 'Light & dark mode',
    description: 'A polished, responsive UI that adapts to your system theme — or switch it manually anytime.',
  },
];

const contentTypes: { icon: React.ReactNode; label: string }[] = [
  { icon: <TwitterIcon className="w-5 h-5 text-sky-500" />, label: 'Tweets' },
  { icon: <YoutubeIcon className="w-5 h-5 text-red-500" />, label: 'Videos' },
  { icon: <DocumentIcon className="w-5 h-5 text-amber-500" />, label: 'Documents' },
  { icon: <LinkIcon className="w-5 h-5 text-brand-500" />, label: 'Links' },
];

export const HomePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 rounded-xl">
            <LogoIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Brainly</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          <Link to="/signin">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="px-4 sm:px-8 pt-20 pb-16 max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-semibold tracking-wide">
            Your Second Brain
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            Save everything worth remembering. <br className="hidden sm:block" />
            Find it again in seconds.
          </h1>
          <p className="mt-5 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Tweets, videos, documents, links, and notes — all in one searchable, tag-organized place. Share exactly
            what you want, keep the rest private.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="primary" size="lg">
                Start Your Second Brain
              </Button>
            </Link>
            <Link to="/signin">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Free to use. No credit card required.</p>

          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
            {contentTypes.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-4 sm:px-8 pb-20 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Everything you need to keep track of it all
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-8 pb-20 max-w-4xl mx-auto">
          <div className="rounded-3xl bg-brand-600 dark:bg-brand-500/20 px-8 py-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white dark:text-slate-100 tracking-tight">
              Ready to build your second brain?
            </h2>
            <p className="mt-3 text-brand-50 dark:text-slate-300">
              It takes less than a minute to get started.
            </p>
            <div className="mt-7">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-base font-medium bg-white text-brand-700 hover:bg-brand-50 dark:bg-slate-800 dark:text-brand-300 dark:hover:bg-slate-700 transition-all duration-200 ease-out active:scale-[0.98] shadow-sm"
              >
                Create Your Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 sm:px-8 py-8 border-t border-slate-200/80 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
        Brainly — Your Second Brain
      </footer>
    </div>
  );
};
