import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { brainApi } from '../services/brain.api';
import type  { PublicBrainData } from '../types/brain.types';
import { ContentCard } from '../components/content/ContentCard';
import { LogoIcon } from '../components/icons';
import { Button } from '../components/common/Button';

export const PublicBrainPage: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [brainData, setBrainData] = useState<PublicBrainData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrain = async () => {
      if (!hash) return;
      try {
        setLoading(true);
        setError(null);
        const res = await brainApi.getPublicBrain(hash);
        setBrainData(res.data);
      } catch (err: any) {
        const message =
          err.response?.data?.message || err.message || 'This brain is private or does not exist.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrain();
  }, [hash]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Public Header */}
      <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
            <LogoIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Brainly</span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/signin">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">
              Create Your Brain
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl w-full mx-auto flex-1">
        {loading ? (
          <div>
            <div className="h-10 w-64 bg-slate-200/70 rounded-xl mb-8 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs max-w-lg mx-auto mt-12">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Brain Unavailable</h3>
            <p className="text-sm text-slate-500 mt-2">{error}</p>
            <Link to="/signup">
              <Button variant="primary" size="md" className="mt-6">
                Start Your Own Brain
              </Button>
            </Link>
          </div>
        ) : brainData ? (
          <div>
            {/* Title Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {brainData.username}'s Second Brain
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Showing {brainData.content.length} public item
                {brainData.content.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* Cards Grid */}
            {brainData.content.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brainData.content.map((content) => (
                  <ContentCard key={content._id} content={content} isReadOnly />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
                <p className="text-slate-500 text-sm">This brain doesn't have any public content yet.</p>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};