import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Search } from 'lucide-react';
import { useAdsSearch } from '../../hooks/api/useAds';
import SearchFilters from './SearchFilters';
import AdList from './AdList';
import type { SearchFilters as SearchFiltersType } from '../../types';

const SearchPage: React.FC = () => {
  const { t } = useTranslation('ads');
  const [filters, setFilters] = useState<SearchFiltersType>({ page: 0 });
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading } = useAdsSearch(filters, hasSearched);

  const handleSearch = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setHasSearched(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            {t('search.title')}
          </CardTitle>
          <CardDescription>{t('search.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchFilters onSearch={handleSearch} loading={isLoading} />
        </CardContent>
      </Card>

      {!hasSearched && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Search className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('search.startSearchTitle')}</h3>
              <p className="text-muted-foreground">{t('search.startSearchDescription')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>
              {!isLoading && data
                ? t('search.resultsCount', { count: data.count })
                : t('search.searchResults')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdList ads={data?.data || []} loading={isLoading} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;
