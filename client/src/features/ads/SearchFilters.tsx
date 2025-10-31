import React from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Search } from 'lucide-react';
import type { SearchFilters as SearchFiltersType } from '../../types';

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersType) => void;
  loading?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, loading }) => {
  const [type, setType] = React.useState('');
  const [priceMin, setPriceMin] = React.useState('');
  const [priceMax, setPriceMax] = React.useState('');
  const [surfaceMin, setSurfaceMin] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: SearchFiltersType = {
      type: type || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      surfaceMin: surfaceMin ? Number(surfaceMin) : undefined,
      page: 0,
    };
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select 
            id="type" 
            value={type} 
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="appartement">Appartement</option>
            <option value="maison">Maison</option>
            <option value="terrain">Terrain</option>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priceMin">Min Price (€)</Label>
          <Input
            id="priceMin"
            type="number"
            placeholder="0"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priceMax">Max Price (€)</Label>
          <Input
            id="priceMax"
            type="number"
            placeholder="1000000"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="surfaceMin">Min Surface (m²)</Label>
          <Input
            id="surfaceMin"
            type="number"
            placeholder="0"
            value={surfaceMin}
            onChange={(e) => setSurfaceMin(e.target.value)}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        size="lg"
        disabled={loading}
      >
        <Search className="h-4 w-4 mr-2" />
        {loading ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
};

export default SearchFilters;
