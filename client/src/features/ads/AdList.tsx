import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';
import type { Ad } from '../../types';
import AdCard from './AdCard';

interface AdListProps {
  ads: Ad[];
  loading?: boolean;
}

const AdList: React.FC<AdListProps> = ({ ads, loading }) => {
  const { t } = useTranslation('ads');

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('list.noAdsTitle')}</h3>
        <p className="text-muted-foreground">{t('list.noAdsDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ads.map((ad: Ad) => (
        <AdCard key={ad._id} ad={ad} />
      ))}
    </div>
  );
};

export default AdList;
