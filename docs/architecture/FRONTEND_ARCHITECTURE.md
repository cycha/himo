# Frontend Architecture Documentation

## 🎨 Modern React Architecture

This frontend follows **modern React best practices** with a focus on maintainability, testability, and scalability.

## Architecture Principles

```
┌────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│            (Pages & Feature Components)                │
└────────────────────────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────┐
│                   State Management                      │
│         (Context API + React Query)                    │
└────────────────────────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────┐
│                   Custom Hooks Layer                    │
│              (Business Logic & Data Fetching)          │
└────────────────────────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────┐
│                   Services Layer                        │
│                  (API Client)                          │
└────────────────────────────────────────────────────────┘
```

## Directory Structure

```
client/src/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication feature
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── Auth.css
│   ├── ads/           # Ads search feature
│   │   ├── SearchPage.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── AdList.tsx
│   │   ├── AdCard.tsx
│   │   └── Ads.css
│   └── dashboard/     # Dashboard feature
│       ├── DashboardPage.tsx
│       └── Dashboard.css
├── hooks/             # Custom hooks
│   ├── api/          # Data fetching hooks
│   │   ├── useAds.ts
│   │   └── useAuth.ts
│   └── common/       # Utility hooks
│       ├── useDebounce.ts
│       └── useLocalStorage.ts
├── context/          # Global state management
│   └── AuthContext.tsx
├── services/         # API client
│   └── api.ts
├── types/           # TypeScript types
│   └── index.ts
├── components/      # Shared components
│   └── PrivateRoute.tsx
└── App.tsx          # Root component
```

## Key Patterns & Practices

### 1. Feature-Based Organization

**Concept:** Group related files by feature, not by type.

```
❌ Bad (Type-based):
components/
  LoginForm.tsx
  SignupForm.tsx
  SearchFilters.tsx
  AdCard.tsx

✅ Good (Feature-based):
features/
  auth/
    LoginForm.tsx
    SignupForm.tsx
  ads/
    SearchFilters.tsx
    AdCard.tsx
```

**Benefits:**
- Easy to find related code
- Better encapsulation
- Easier to delete/modify features
- Team members can work independently

### 2. Custom Hooks for Logic Reuse

**Data Fetching Hooks:**
```typescript
// hooks/api/useAds.ts
export const useAdsSearch = (filters: SearchFilters, enabled: boolean) => {
  return useQuery({
    queryKey: ['ads', 'search', filters],
    queryFn: () => api.searchAds(filters),
    enabled,
  });
};

// Usage in component:
const { data, isLoading } = useAdsSearch(filters, hasSearched);
```

**Benefits:**
- Reusable logic
- Easier testing
- Cleaner components
- Consistent data fetching

**Utility Hooks:**
```typescript
// hooks/common/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  // ... implementation
  return debouncedValue;
}

// Usage:
const debouncedSearchTerm = useDebounce(searchTerm, 500);
```

### 3. Context API for Global State

```typescript
// context/AuthContext.tsx
export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Usage:
const { user, isAuthenticated, logout } = useAuth();
```

**Benefits:**
- Avoid prop drilling
- Centralized state
- Easy to consume
- Type-safe

### 4. Component Composition

**Break down into smaller, focused components:**

```typescript
// ❌ Monolithic component
const SearchPage = () => {
  return (
    <div>
      {/* 300 lines of code */}
    </div>
  );
};

// ✅ Composed components
const SearchPage = () => {
  return (
    <div>
      <SearchFilters onSearch={handleSearch} />
      <AdList ads={data?.data} />
    </div>
  );
};
```

### 5. React Query for Server State

```typescript
// Automatic caching, refetching, and synchronization
const { data, isLoading, error } = useQuery({
  queryKey: ['ads', filters],
  queryFn: () => api.searchAds(filters),
  staleTime: 5 * 60 * 1000,
});
```

**Benefits:**
- Automatic caching
- Background refetching
- Optimistic updates
- Loading/error states

## Architecture Layers Explained

### Layer 1: Features (UI Components)

**Responsibility:** Render UI and handle user interactions

```typescript
// features/ads/SearchPage.tsx
const SearchPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const { data, isLoading } = useAdsSearch(filters, true);

  return (
    <>
      <SearchFilters onSearch={setFilters} />
      <AdList ads={data?.data} loading={isLoading} />
    </>
  );
};
```

**Rules:**
- ✅ Render UI
- ✅ Handle user events
- ✅ Use custom hooks
- ❌ No business logic
- ❌ No direct API calls

### Layer 2: Custom Hooks (Business Logic)

**Responsibility:** Encapsulate reusable logic

```typescript
// hooks/api/useAds.ts
export const useAdsSearch = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ['ads', filters],
    queryFn: () => api.searchAds(filters),
  });
};
```

**Rules:**
- ✅ Reusable logic
- ✅ Data fetching
- ✅ State management
- ❌ No UI/JSX

### Layer 3: Services (API Communication)

**Responsibility:** HTTP requests to backend

```typescript
// services/api.ts
class ApiClient {
  async searchAds(filters: SearchFilters): Promise<SearchResponse> {
    const response = await this.client.post('/ads/search', filters);
    return response.data;
  }
}
```

**Rules:**
- ✅ API requests
- ✅ Authentication
- ✅ Error handling
- ❌ No business logic

### Layer 4: Context (Global State)

**Responsibility:** Share state across components

```typescript
// context/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // ... auth logic
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## Design Patterns

### 1. Container/Presentational Pattern

**Container (Smart Component):**
```typescript
const SearchPage = () => {
  const { data, isLoading } = useAdsSearch(filters);
  return <AdList ads={data?.data} loading={isLoading} />;
};
```

**Presentational (Dumb Component):**
```typescript
interface AdListProps {
  ads: Ad[];
  loading?: boolean;
}

const AdList: React.FC<AdListProps> = ({ ads, loading }) => {
  return <List dataSource={ads} loading={loading} />;
};
```

### 2. Compound Components

```typescript
<SearchFilters onSearch={handleSearch}>
  <PriceFilter />
  <TypeFilter />
  <SurfaceFilter />
</SearchFilters>
```

### 3. Custom Hooks Pattern

```typescript
// Extract complex logic into custom hooks
function useSearchFilters() {
  const [filters, setFilters] = useState({});
  const debouncedFilters = useDebounce(filters);
  return { filters, debouncedFilters, setFilters };
}
```

## State Management Strategy

### 1. Local State (useState)
For component-specific state:
```typescript
const [isOpen, setIsOpen] = useState(false);
```

### 2. Context API (Global State)
For app-wide state (auth, theme):
```typescript
const { user, isAuthenticated } = useAuth();
```

### 3. React Query (Server State)
For server data:
```typescript
const { data } = useQuery(['ads'], fetchAds);
```

### 4. URL State (React Router)
For shareable state:
```typescript
const [searchParams] = useSearchParams();
```

## Data Flow

```
User Action
    ↓
Component Handler
    ↓
Custom Hook
    ↓
API Service
    ↓
Backend API
    ↓
React Query Cache
    ↓
Component Re-render
```

## Best Practices

### 1. Co-locate Related Code
```
features/ads/
  ├── SearchPage.tsx
  ├── SearchFilters.tsx
  ├── AdList.tsx
  └── Ads.css          ← CSS with components
```

### 2. Single Responsibility
```typescript
// ❌ Component doing too much
const SearchPage = () => {
  // fetching, filtering, rendering, validation...
};

// ✅ Split responsibilities
const SearchPage = () => {
  const { data } = useAdsSearch(filters);
  return <AdList ads={data} />;
};
```

### 3. Prop Types with TypeScript
```typescript
interface Props {
  ads: Ad[];
  onSelect: (id: string) => void;
  loading?: boolean;
}

const AdList: React.FC<Props> = ({ ads, onSelect, loading }) => {
  // ...
};
```

### 4. Avoid Prop Drilling
```typescript
// ❌ Prop drilling
<Parent>
  <Child user={user}>
    <GrandChild user={user}>
      <GreatGrandChild user={user} />

// ✅ Use Context
const { user } = useAuth(); // anywhere!
```

### 5. Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

## Testing Strategy

### Unit Tests (Components)
```typescript
describe('AdCard', () => {
  it('renders ad information', () => {
    render(<AdCard ad={mockAd} />);
    expect(screen.getByText(mockAd.title)).toBeInTheDocument();
  });
});
```

### Custom Hooks Tests
```typescript
describe('useAdsSearch', () => {
  it('fetches ads with filters', async () => {
    const { result } = renderHook(() => useAdsSearch(filters));
    await waitFor(() => expect(result.current.data).toBeDefined());
  });
});
```

### Integration Tests
```typescript
describe('SearchPage', () => {
  it('searches and displays results', async () => {
    render(<SearchPage />);
    fireEvent.click(screen.getByText('Search'));
    await screen.findByText('10 Results');
  });
});
```

## Performance Optimization

### 1. React.memo for Expensive Components
```typescript
const AdCard = React.memo(({ ad }) => {
  // Only re-renders if ad changes
});
```

### 2. useCallback for Functions
```typescript
const handleSearch = useCallback((filters) => {
  setFilters(filters);
}, []);
```

### 3. useMemo for Expensive Calculations
```typescript
const sortedAds = useMemo(() => 
  ads.sort((a, b) => b.price - a.price),
  [ads]
);
```

### 4. Code Splitting
```typescript
const Dashboard = lazy(() => import('./features/dashboard/DashboardPage'));
```

### 5. React Query Caching
```typescript
// Automatic caching prevents unnecessary requests
const { data } = useQuery(['ads', filters], fetchAds, {
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
});
```

## Benefits of This Architecture

### 1. Maintainability
- Clear file organization
- Easy to find code
- Single responsibility components

### 2. Testability
- Custom hooks are easy to test
- Components are isolated
- Pure functions

### 3. Reusability
- Custom hooks
- Shared components
- Context providers

### 4. Scalability
- Feature-based structure scales well
- Easy to add new features
- Team can work independently

### 5. Type Safety
- Full TypeScript coverage
- Catch errors at compile time
- Better IDE support

## Migration Guide (Old → New)

### Before: Props Drilling
```typescript
<App user={user}>
  <Header user={user}>
    <Nav user={user} />
  </Header>
</App>
```

### After: Context
```typescript
<AuthProvider>
  <App>
    <Header>
      <Nav />  {/* useAuth() internally */}
    </Header>
  </App>
</AuthProvider>
```

### Before: useState + useEffect
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetchAds().then(setData).finally(() => setLoading(false));
}, []);
```

### After: React Query Hook
```typescript
const { data, isLoading } = useAdsSearch(filters);
```

## Conclusion

This architecture provides:
- ✅ **Clean separation of concerns**
- ✅ **Reusable custom hooks**
- ✅ **Efficient state management**
- ✅ **Type safety with TypeScript**
- ✅ **Modern React patterns**
- ✅ **Production-ready code**
- ✅ **Portfolio-ready architecture**

Perfect for showcasing advanced React skills to employers!
