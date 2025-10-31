import React from 'react';
import { List, Typography } from 'antd';
import type { Ad } from '../../types';

const { Text } = Typography;

interface AdCardProps {
  ad: Ad;
}

const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <List.Item
      key={ad._id}
      extra={
        ad.thumb_urls?.[0] && (
          <img
            width={200}
            alt={ad.title}
            src={ad.thumb_urls[0]}
            style={{ objectFit: 'cover', height: '150px' }}
          />
        )
      }
    >
      <List.Item.Meta
        title={
          <a href={ad.url} target="_blank" rel="noopener noreferrer">
            {ad.title}
          </a>
        }
        description={
          <div>
            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
              {formatPrice(ad.price)}
            </Text>
            {ad.surface && <Text> • {ad.surface} m²</Text>}
            {ad.rooms && <Text> • {ad.rooms} rooms</Text>}
            <br />
            <Text type="secondary">
              {ad.location.city}, {ad.location.zipcode}
            </Text>
            <br />
            <Text type="secondary">
              {new Date(ad.release_date).toLocaleDateString()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );
};

export default AdCard;
