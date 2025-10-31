import React, { useState } from 'react';
import { Card, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useAdsSearch } from '../../hooks/api/useAds';
import SearchFilters from './SearchFilters';
import AdList from './AdList';
import type { SearchFilters as SearchFiltersType } from '../../types';
import './Ads.css';

const SearchPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFiltersType>({ page: 0 });
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading } = useAdsSearch(filters, hasSearched);

  const handleSearch = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setHasSearched(true);
  };

  return (
    <div className="search-container">
      <Card className="search-card" title={<><SearchOutlined /> Search Real Estate</>}>
        <SearchFilters onSearch={handleSearch} loading={isLoading} />
      </Card>

      {!hasSearched && (
        <Card className="results-card">
          <Empty
            description="Click the search button to find real estate ads"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {hasSearched && isLoading && (
        <Card className="results-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading results...</p>
          </div>
        </Card>
      )}

      {hasSearched && !isLoading && data && (
        <Card className="results-card" title={`${data.count} Results`}>
          <AdList ads={data.data} />
        </Card>
      )}
    </div>
  );
};

export default SearchPage;
