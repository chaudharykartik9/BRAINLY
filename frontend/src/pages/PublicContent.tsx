import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { brainApi } from '../services/brain.api';
import type { PublicContentData } from '../types/brain.types';
import { ContentCard } from '../components/content/ContentCard';
import { LogoIcon } from '../components/icons';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';

export const PublicContentPage: React.FC = () => {
  const { hash, contentId } = useParams<{ hash: string; contentId: string }>();
  const [data, setData] = useState<PublicContentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!hash || !contentId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await brainApi.getPublicItem(hash, contentId);
        setData(res.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'This item is private or no longer exists.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [hash, contentId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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

      <main className="p-8 max-w-2xl w-full mx-auto flex-1">
        {loading ? (
          <Skeleton className="h-72 rounded-2xl bg-slate-200/60" />
        ) : error || !data ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs mt-8">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Item Unavailable</h3>
            <p className="text-sm text-slate-500 mt-2">
              {error || 'This item is private or no longer exists.'}
            </p>
            <Link to="/signup">
              <Button variant="primary" size="md" className="mt-6">
                Start Your Own Brain
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Shared by {data.username}
              </p>
            </div>
            <ContentCard content={data.content} isReadOnly />
            {hash && (
              <div className="mt-6 text-center">
                <Link
                  to={`/share/${hash}`}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  See {data.username}'s full collection →
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
