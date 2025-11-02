import React from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import type { SearchFilters as SearchFiltersType } from '../../types';

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersType) => void;
  loading?: boolean;
}

interface CitySuggestion {
  name: string;
  postcode: string;
  context: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, loading }) => {
  const [type, setType] = React.useState('');
  const [city, setCity] = React.useState('');
  const [citySuggestions, setCitySuggestions] = React.useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [cityError, setCityError] = React.useState('');
  const [validatedCity, setValidatedCity] = React.useState('');
  const [priceMin, setPriceMin] = React.useState('');
  const [priceMax, setPriceMax] = React.useState('');
  const [surfaceMin, setSurfaceMin] = React.useState('');

  // Debounce timer ref
  const debounceTimer = React.useRef<NodeJS.Timeout>();

  // Cleanup debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Fetch city suggestions from French government API
  const fetchCitySuggestions = async (query: string) => {
    if (query.length < 2) {
      setCitySuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5`
      );
      const data = await response.json();
      
      const suggestions = data.features.map((feature: any) => ({
        name: feature.properties.city,
        postcode: feature.properties.postcode,
        context: feature.properties.context,
      }));
      
      setCitySuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    }
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    setCityError('');
    setValidatedCity('');
    
    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      fetchCitySuggestions(value);
    }, 300);
  };

  const selectCity = (suggestion: CitySuggestion) => {
    setCity(suggestion.name);
    setValidatedCity(suggestion.name);
    setCityError('');
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const validateCity = async () => {
    if (!city) {
      setCityError('');
      return true;
    }

    // If already validated, skip
    if (validatedCity === city) {
      return true;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(city)}&type=municipality&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const exactMatch = data.features[0].properties.city.toLowerCase() === city.toLowerCase();
        if (exactMatch) {
          setValidatedCity(city);
          setCityError('');
          return true;
        }
      }
      
      setCityError('City not found. Please select from suggestions.');
      return false;
    } catch (error) {
      console.error('Error validating city:', error);
      return true; // Allow submission on API error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate city if provided
    const isCityValid = await validateCity();
    if (!isCityValid) {
      return;
    }

    const filters: SearchFiltersType = {
      type: type || undefined,
      city: city || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      surfaceMin: surfaceMin ? Number(surfaceMin) : undefined,
      page: 0,
    };
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        
        <div className="space-y-2 relative">
          <Label htmlFor="city">City</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="city"
              type="text"
              placeholder="Paris, Lyon, Marseille..."
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => city.length >= 2 && setShowSuggestions(true)}
              className={`pl-10 ${cityError ? 'border-red-500' : validatedCity ? 'border-green-500' : ''}`}
            />
          </div>
          
          {/* City suggestions dropdown */}
          {showSuggestions && citySuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {citySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectCity(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-sm text-gray-500">{suggestion.postcode} - {suggestion.context}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Error message */}
          {cityError && (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{cityError}</span>
            </div>
          )}
          
          {/* Success indicator */}
          {validatedCity && !cityError && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <MapPin className="h-4 w-4" />
              <span>City verified ✓</span>
            </div>
          )}
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
