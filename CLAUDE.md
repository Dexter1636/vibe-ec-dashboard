# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **AI-Powered E-commerce Content Generation Dashboard** built with Next.js 16 (App Router), React 19, and Tailwind CSS v4. The application allows users to batch-generate product titles, selling points, and marketing images using AI. Currently, the AI generation is mocked with realistic delays.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Single-Page State Management

The entire application state is centralized in [app/page.tsx](app/page.tsx). Key state includes:
- `products`: Array of products awaiting content generation
- `results`: Map<string, GeneratedContent> tracking generation status by product ID
- `activeTab`: Current tab (home, batch-generate, template-library, settings)

When modifying state:
- Use `Map` for results with product IDs as keys for O(1) lookups
- Follow immutable update patterns (create new Map/arrays, don't mutate)
- Batch state updates when possible to avoid re-renders

### Path Aliases

`@/*` maps to the project root. Always use this for imports:
```tsx
import { Product } from '@/types';
import { storage } from '@/lib';
```

### Component Structure

```
components/
├── layout/           # Layout components (Header with tab navigation)
├── batch-generate/   # Core product management and generation UI
├── home/             # Dashboard overview
├── template-library/ # Template CRUD
├── settings/         # Configuration UI
└── ui/               # Reusable components (Button, Modal, etc.)
```

### Content Generation Flow

1. **Product Input** → User adds products via `ProductForm` with images and attributes
2. **Generation** → `generateBatchContent()` in [lib/mockGenerator.ts](lib/mockGenerator.ts) processes products sequentially
3. **Progress Tracking** → `onProgress` callback updates UI with current/total counts
4. **Results** → Stored in `results` Map with status: `pending` → `generating` → `completed`/`failed`

To integrate real AI:
- Replace functions in [lib/mockGenerator.ts](lib/mockGenerator.ts)
- Keep the same function signatures and return types
- Maintain progress callback pattern for batch operations

### Local Storage

Templates and materials persist via [lib/storage.ts](lib/storage.ts):
- `storage.templates.*` - Template CRUD operations
- `storage.materials.*` - Material library CRUD
- Date objects are automatically serialized/deserialized

### Type System

All types are centralized and exported from [types/index.ts](types/index.ts):
- `Product` - Input product with images and attributes
- `GeneratedContent` - AI output with title, selling points, status
- `Template` - Reusable content generation patterns
- `Material` - Saved product materials for reuse

## UI Patterns

- **Glass morphism**: `glass-effect` class with backdrop blur
- **Color theme**: Violet-to-purple gradients (`from-violet-600 to-purple-600`)
- **Animations**: `animate-fade-in`, `hover-lift` for interactions
- **Status badges**: Green for completed, blue for generating, red for failed

## Test Data

Use "Load Test Data" button in the UI to populate products with test images from `/public/test-images/`. See [lib/testDataGenerator.ts](lib/testDataGenerator.ts) for test data generation logic.

## File Upload Handling

Product images use `URL.createObjectURL(file)` to create browser-local URLs. In production, replace with actual upload logic to a storage service.
