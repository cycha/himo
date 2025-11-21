# Design System Documentation

## 🎨 shadcn/ui + Tailwind CSS

We use **shadcn/ui** with **Tailwind CSS** - the most modern design system for 2025.

## Why shadcn/ui?

✅ **Copy-paste components** - No bloated dependencies  
✅ **Full customization** - You own the code  
✅ **Radix UI primitives** - Accessibility built-in  
✅ **Tailwind CSS** - Utility-first styling  
✅ **TypeScript first** - Type-safe components  
✅ **Modern & trendy** - Used by Vercel, Linear, Cal.com

## Architecture

```
components/
└── ui/              # shadcn/ui components (you own them)
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── ...

lib/
└── utils.ts        # cn() utility for merging classes

index.css           # Tailwind + CSS variables
tailwind.config.js  # Tailwind configuration
```

## Components

### Button Component

```typescript
import { Button } from '@/components/ui/button';

// Variants
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button onClick={() => console.log('clicked')}>Click me</Button>
```

### Card Component

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Input Component

```typescript
import { Input } from '@/components/ui/input';

<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Price" />
```

## Theming

### CSS Variables

Themes are controlled via CSS variables in `index.css`:

```css
:root {
  --primary: 217 91% 60%; /* Blue */
  --secondary: 210 40% 96.1%; /* Light gray */
  --destructive: 0 84.2% 60.2%; /* Red */
  --muted: 210 40% 96.1%; /* Muted gray */
  --accent: 210 40% 96.1%; /* Accent color */
  --border: 214.3 31.8% 91.4%; /* Border color */
  --radius: 0.5rem; /* Border radius */
}
```

### Dark Mode Support

shadcn/ui comes with dark mode out of the box:

```typescript
// Add dark mode toggle
<html className="dark">
  {/* Your app */}
</html>
```

## Tailwind Utilities

### The `cn()` Utility

Merge Tailwind classes safely:

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  isActive && "active-class",
  className  // Props className
)} />
```

### Common Patterns

```typescript
// Flex layouts
<div className="flex items-center justify-between">

// Grid layouts
<div className="grid grid-cols-3 gap-4">

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">

// Spacing
<div className="p-4 mx-auto space-y-4">

// Colors
<div className="bg-primary text-primary-foreground">

// Typography
<h1 className="text-2xl font-bold">
```

## Example: Login Form

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const LoginForm = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input id="password" type="password" />
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

## Migration from Ant Design

### Button

```typescript
// Before (Ant Design)
<Button type="primary" size="large" loading={loading}>
  Submit
</Button>

// After (shadcn/ui)
<Button size="lg" disabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</Button>
```

### Card

```typescript
// Before (Ant Design)
<Card title="Title" extra={<Button>Action</Button>}>
  Content
</Card>

// After (shadcn/ui)
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Title</CardTitle>
      <Button>Action</Button>
    </div>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Input

```typescript
// Before (Ant Design)
<Input
  prefix={<UserIcon />}
  size="large"
  placeholder="Email"
/>

// After (shadcn/ui)
<div className="relative">
  <UserIcon className="absolute left-3 top-2.5" />
  <Input className="pl-10" placeholder="Email" />
</div>
```

## Adding More Components

shadcn/ui has 40+ components. To add more:

```bash
# Visit https://ui.shadcn.com/docs/components
# Copy the component code
# Paste into client/src/components/ui/[component-name].tsx
```

Popular components:

- `dialog.tsx` - Modal dialogs
- `dropdown-menu.tsx` - Dropdown menus
- `select.tsx` - Select inputs
- `table.tsx` - Data tables
- `toast.tsx` - Toast notifications
- `form.tsx` - Form components
- `badge.tsx` - Status badges
- `avatar.tsx` - User avatars

## Best Practices

### 1. Use Semantic Colors

```typescript
// ✅ Good
<Button variant="destructive">Delete</Button>
<div className="bg-primary text-primary-foreground">

// ❌ Avoid
<Button className="bg-red-500">Delete</Button>
```

### 2. Compose Components

```typescript
// ✅ Good - Composable
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>

// ❌ Avoid - Monolithic
<Card title="Title" content="Content" />
```

### 3. Extend, Don't Modify

```typescript
// ✅ Good - Extend via className
<Button className="w-full shadow-lg">
  Submit
</Button>

// ✅ Good - Create variants
const BigButton = ({ children }) => (
  <Button size="lg" className="text-xl">
    {children}
  </Button>
);
```

### 4. Use TypeScript

```typescript
// ✅ Good - Typed props
interface FormProps {
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

const Form: React.FC<FormProps> = ({ onSubmit, loading }) => {
  // ...
};
```

## Performance

### Tree Shaking

Tailwind automatically removes unused classes:

```bash
# Production build
npm run build

# Result: Only classes you actually use are included
```

### Component Size

- Button: ~2KB
- Card: ~1KB
- Input: ~1KB

Compare to Ant Design:

- Ant Design full: ~500KB
- shadcn/ui components: ~20KB

## Resources

- **Documentation**: https://ui.shadcn.com
- **Components**: https://ui.shadcn.com/docs/components
- **Examples**: https://ui.shadcn.com/examples
- **Themes**: https://ui.shadcn.com/themes

## Why This is Portfolio-Ready

✅ **Modern Stack** - Shows you're up-to-date with 2025 trends  
✅ **Customization** - Demonstrates understanding of design systems  
✅ **Performance** - Small bundle size, tree-shaking  
✅ **Accessibility** - Radix UI primitives are WCAG compliant  
✅ **TypeScript** - Fully typed components  
✅ **Industry Standard** - Used by top companies

Perfect for impressing potential employers! 🚀
