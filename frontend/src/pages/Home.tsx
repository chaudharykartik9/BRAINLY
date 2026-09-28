import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useTheme } from '../context/ThemeContext';
import {
  BookmarkIcon,
  CrossIcon,
  DocumentIcon,
  EditIcon,
  GithubIcon,
  LayersIcon,
  LinkedinIcon,
  LinkIcon,
  LogoIcon,
  MenuIcon,
  MoonIcon,
  PinIcon,
  SearchIcon,
  ShareIcon,
  ShieldIcon,
  SparkleIcon,
  SunIcon,
  TwitterIcon,
  YoutubeIcon,
} from '../components/icons';

const socialLinks = [
  { icon: <TwitterIcon className="w-4 h-4" />, label: 'X (Twitter)', href: 'https://x.com/KartikTush46941' },
  { icon: <GithubIcon className="w-4 h-4" />, label: 'GitHub', href: 'https://github.com/chaudharykartik9' },
  {
    icon: <LinkedinIcon className="w-4 h-4" />,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kartik-chaudhary9/',
  },
];

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
    icon: <LayersIcon className="w-5 h-5" />,
    title: 'Bulk actions',
    description: 'Multi-select items to pin, unpin, publish, unpublish, or delete them together in one go.',
  },
  {
    icon: <ShieldIcon className="w-5 h-5" />,
    title: 'Secure sign-in',
    description: 'Email/password auth with a full forgot-password → reset-link → new-password flow built in.',
  },
  {
    icon: <MoonIcon className="w-5 h-5" />,
    title: 'Light & dark mode',
    description: 'A polished, responsive UI that adapts to your system theme — or switch it manually anytime.',
  },
];

const steps: { icon: React.ReactNode; title: string; description: string }[] = [
  {
    icon: <BookmarkIcon className="w-6 h-6" />,
    title: '1. Capture',
    description: 'Paste a link, drop in a tweet or video URL, or just write down a quick thought — takes seconds.',
  },
  {
    icon: <PinIcon className="w-6 h-6" />,
    title: '2. Organize',
    description: 'Tag it, pin the important stuff, and let search and type filters keep everything easy to browse.',
  },
  {
    icon: <ShareIcon className="w-6 h-6" />,
    title: '3. Share',
    description: 'Publish a read-only page of your brain and pick exactly which items are public, item by item.',
  },
];

const contentTypes: { icon: React.ReactNode; label: string }[] = [
  { icon: <TwitterIcon className="w-5 h-5 text-sky-500" />, label: 'Tweets' },
  { icon: <YoutubeIcon className="w-5 h-5 text-red-500" />, label: 'Videos' },
  { icon: <DocumentIcon className="w-5 h-5 text-amber-500" />, label: 'Documents' },
  { icon: <LinkIcon className="w-5 h-5 text-brand-500" />, label: 'Links' },
];

const navLinks = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
];

export const HomePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      {/* Header */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 px-4 sm:px-8 ${
          scrolled
            ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80 py-3.5'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 rounded-xl">
              <LogoIcon className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Brainly</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <CrossIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
            <Link to="/signin" className="hidden sm:block">
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
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 max-w-6xl mx-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-lg">
            <div className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="text-left px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors sm:hidden"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-4 sm:px-8 pt-20 pb-16">
          {/* Ambient background glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-144 -z-10 overflow-hidden">
            <div className="absolute -top-32 left-1/4 w-136 h-136 rounded-full bg-brand-300/25 dark:bg-brand-500/10 blur-[120px]" />
            <div className="absolute -top-16 right-1/4 w-md h-112 rounded-full bg-sky-300/20 dark:bg-sky-500/10 blur-[120px]" />
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-semibold tracking-wide">
              <SparkleIcon className="w-3.5 h-3.5" />
              Your Second Brain
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-[1.1]">
              Save everything worth remembering. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 via-sky-500 to-brand-500">
                Find it again in seconds.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
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

            <div className="mt-10 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
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
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-4 sm:px-8 py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Everything you need to keep track of it all
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Built to stay out of your way — save fast, find fast, share on your terms.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-7 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-brand-200 dark:hover:border-brand-500/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-4 sm:px-8 py-20 bg-white dark:bg-slate-800/40 scroll-mt-20">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              How Brainly works
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Three simple steps to capture, organize, and retrieve your ideas.
            </p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-100">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Get started — it's free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-8 py-20 max-w-4xl mx-auto">
          <div className="rounded-3xl bg-brand-600 dark:bg-brand-500/20 px-8 py-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white dark:text-slate-100 tracking-tight">
              Ready to build your second brain?
            </h2>
            <p className="mt-3 text-brand-50 dark:text-slate-300">It takes less than a minute to get started.</p>
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

      {/* Footer */}
      <footer className="px-4 sm:px-8 pt-14 pb-8 border-t border-slate-200/80 dark:border-slate-700">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-start justify-between gap-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <LogoIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Brainly</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              A personal knowledge-management app for saving, organizing, and selectively sharing everything worth
              remembering.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="flex gap-12">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Product
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('features')}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                  >
                    How it works
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Account
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/signin"
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
          Brainly — Your Second Brain
        </div>
      </footer>
    </div>
  );
};
