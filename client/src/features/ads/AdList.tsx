import React from 'react';
import { List, Empty } from 'antd';
import type { Ad } from '../../types';
import AdCard from './AdCard';

interface AdListProps {
  ads: Ad[];
  loading?: boolean;
}

const AdList: React.FC<AdListProps> = ({ ads, loading }) => {
  if (!ads || ads.length === 0) {
    return <Empty description="No ads found. Try adjusting your search criteria." />;
  }

  return (
    <List
      itemLayout="vertical"
      dataSource={ads}
      loading={loading}
      renderItem={(ad: Ad) => <AdCard ad={ad} />}
    />
  );
};

export default AdList;
