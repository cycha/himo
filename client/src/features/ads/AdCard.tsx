import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { MapPin, Calendar, Home, Ruler, Globe } from 'lucide-react';
import type { Ad } from '../../types';

interface AdCardProps {
  ad: Ad;
}

const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const { t } = useTranslation('ads');
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {ad.thumb_urls?.[0] && (
          <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
            <img
              alt={ad.title}
              src={ad.thumb_urls[0]}
              className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
            />
          </div>
        )}
        <div className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">
              <a
                href={ad.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {ad.title}
              </a>
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-primary">
              {formatPrice(ad.price)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {ad.surface && (
                <div className="flex items-center gap-1">
                  <Ruler className="h-4 w-4" />
                  {ad.surface} m²
                </div>
              )}
              {ad.rooms && (
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  {ad.rooms} {t('list.rooms')}
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {ad.location.city}, {ad.location.zipcode}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(ad.release_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {t(`providers.${ad.provider}`)}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default AdCard;
