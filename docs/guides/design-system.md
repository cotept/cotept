# Design System Guide

## Overview

CotePT uses Tailwind CSS v4 with a custom layered token system for consistent, maintainable styling.

## Token Hierarchy

### 1. Primitive Tokens

**Source**: Tailwind CSS built-in colors

- `zinc-50` through `zinc-950` (neutral palette)
- `purple`, `pink`, `blue`, `green`, `orange`, `red` (brand/status colors)

**Usage**: Only in `globals.css` to define semantic tokens. **Never use directly in components.**

### 2. Semantic Tokens

**Brand Colors**:

- `primary` (#7c3bed - Purple): Main brand color
- `secondary` (#ec4899 - Pink): Brand sub-color
- `tertiary` (#3b82f6 - Blue): Brand accent

**Status Colors**:

- `success` (#22c55e - Green)
- `warning` (#f97316 - Orange)
- `destructive` (#ef4444 - Red)
- `info` (#0ea5e9 - Sky Blue)

**Variants**: All brand/status colors support `tint` (lighter) and `shade` (darker) variants.

### 3. Layered Tokens (Structural)

**Background Layers** (`bg-background` ~ `bg-bg-5`):

| Token           | Light Mode | Dark Mode | Usage                 |
| --------------- | ---------- | --------- | --------------------- |
| `bg-background` | White      | Zinc-950  | Page background       |
| `bg-bg-2`       | Zinc-50    | Zinc-900  | Surface/Container     |
| `bg-bg-3`       | Zinc-100   | Zinc-800  | Card/Muted areas      |
| `bg-bg-4`       | Zinc-200   | Zinc-700  | **Input backgrounds** |
| `bg-bg-5`       | Zinc-300   | Zinc-600  | Hover/Elevated        |

**Text Layers** (`text-foreground` ~ `text-fg-4`):

| Token             | Light Mode | Dark Mode | Usage                  |
| ----------------- | ---------- | --------- | ---------------------- |
| `text-foreground` | Zinc-950   | Zinc-50   | Main text/Headings     |
| `text-fg-2`       | Zinc-800   | Zinc-300  | **Labels/Strong text** |
| `text-fg-3`       | Zinc-500   | Zinc-400  | Descriptions/Muted     |
| `text-fg-4`       | Zinc-400   | Zinc-500  | Disabled/Subtle        |

**Border Layers** (`border-border-1` ~ `border-border-3`):

| Token             | Light Mode | Dark Mode | Usage                    |
| ----------------- | ---------- | --------- | ------------------------ |
| `border-border-1` | Zinc-200   | Zinc-800  | Subtle dividers          |
| `border-border-2` | Zinc-300   | Zinc-700  | Default borders          |
| `border-border-3` | Zinc-400   | Zinc-600  | **Strong/Focus borders** |

## Usage Guidelines

### ✅ DO

```tsx
// Use semantic tokens
<Button className="bg-primary text-primary-foreground">Submit</Button>

// Use layered tokens for neutrals
<Input className="bg-bg-4 border-border-3 text-foreground" />
<FormLabel className="text-fg-2">Email</FormLabel>

// Use variants
<div className="bg-primary-tint">Highlighted</div>
```

### ❌ DON'T

```tsx
// Never hardcode Tailwind colors
<div className="bg-zinc-700">Bad</div>
<p className="text-zinc-300">Bad</p>

// Don't mix primitive colors
<button className="bg-purple-600">Bad</button>
```

## Key Files

- **Definition**: `packages/shared/src/styles/globals.css`
- **Visual Reference**: `apps/web/src/app/(dev)/design-system/page.tsx`

## Light/Dark Mode Handling

All tokens automatically adapt to theme:

```tsx
// This works in both modes automatically
<div className="bg-bg-3 text-foreground border-border-2">Content</div>
```

No need for `dark:` prefix when using semantic/layered tokens.

## Common Patterns

### Form Inputs

```tsx
<Input className="bg-bg-4 border-border-3 text-foreground placeholder:text-fg-3" />
```

### Cards

```tsx
<Card className="bg-bg-3 border-border-2">
  <CardHeader className="text-foreground">Title</CardHeader>
  <CardContent className="text-fg-3">Description</CardContent>
</Card>
```

### Buttons

```tsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="destructive">Delete</Button>
```

## Extending the System

If you need a new color not covered by existing tokens:

1. **Check if existing token fits**: Can `bg-bg-4` or `text-fg-2` work?
2. **Add to `globals.css`**: Define in both `:root` and `.dark`
3. **Register in `@theme`**: Add to Tailwind's theme block
4. **Document here**: Update this guide

**Example**:

```css
/* globals.css */
:root {
  --highlight-bg: var(--color-zinc-50);
}

.dark {
  --highlight-bg: var(--color-zinc-900);
}

@theme {
  --color-highlight-bg: var(--highlight-bg);
}
```

Then use: `bg-highlight-bg`
