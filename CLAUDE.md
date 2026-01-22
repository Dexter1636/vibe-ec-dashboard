# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **AI-Powered E-commerce Content Generation Dashboard** built with Next.js 16 (App Router), React 19, and Tailwind CSS v4. The application allows users to batch-generate product titles, selling points, marketing images, and TikTok/Douyin short-form video copy using AI.

### AI Generation

The application uses **DeepSeek V3.2 API** for all AI generation:
- **Product Content**: Titles and selling points via [lib/deepseekGenerator.ts](lib/deepseekGenerator.ts)
- **TikTok Copy**: Short-form video copy with 6 style options via [lib/tiktokGenerator.ts](lib/tiktokGenerator.ts)
- **Streaming**: Real-time streaming responses using Server-Sent Events (SSE)

**Fallback**: [lib/mockGenerator.ts](lib/mockGenerator.ts) is retained as a fallback but not actively used.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

Create `.env.local` in the project root:

```bash
# DeepSeek API Configuration
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_BASE_URL=https://api-inference.modelscope.cn/v1
DEEPSEEK_MODEL=deepseek-ai/DeepSeek-V3.2
```

**Critical**: The DeepSeek client uses **lazy initialization** (see [lib/deepseek/client.ts](lib/deepseek/client.ts)) to avoid Turbopack caching issues. Never initialize the client at module level.

## Architecture

### Single-Page State Management

The entire application state is centralized in [app/page.tsx](app/page.tsx). Key state includes:

**Product Generation**:
- `products`: Array of products awaiting content generation
- `results`: Map<string, GeneratedContent> tracking generation status by product ID

**TikTok Copy Generation**:
- `tiktokOptions`: TikTokCopyOptions for selected style, length, hashtag preference
- `tiktokResults`: Map<string, TikTokCopy> tracking TikTok copy generation by product ID
- `streamingProductId`: ID of product currently being generated (null if none)

**Navigation**:
- `activeTab`: Current tab (home, batch-generate, tiktok, template-library, settings)

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
├── tiktok-copy/      # TikTok/Douyin copy generation (style selector, result cards)
├── home/             # Dashboard overview
├── template-library/ # Template CRUD
├── settings/         # Configuration UI
└── ui/               # Reusable components (Button, Modal, CopyButton, etc.)
```

### Content Generation Flow

**Product Content Generation** (Titles + Selling Points):
1. **Product Input** → User adds products via `ProductForm` with images and attributes
2. **Generation** → `generateBatchContent()` in [lib/deepseekGenerator.ts](lib/deepseekGenerator.ts) processes products sequentially
3. **Progress Tracking** → `onProgress` callback updates UI with current/total counts
4. **Results** → Stored in `results` Map with status: `pending` → `generating` → `completed`/`failed`

**TikTok Copy Generation** (Streaming):
1. **Style Selection** → User selects one of 6 copy styles via [TikTokStyleSelector](components/tiktok-copy/TikTokStyleSelector.tsx)
2. **Product Selection** → User picks a product and clicks "生成文案"
3. **Streaming Request** → Client calls `/api/generate/tiktok` with product and options
4. **Server-Side Processing** → [tiktokGenerator.ts](lib/tiktokGenerator.ts) streams from DeepSeek API
5. **Loading State** → UI shows loading animation in [TikTokResultCard](components/tiktok-copy/TikTokResultCard.tsx)
6. **Completion** → Server sends parsed JSON with hook, content, cta, hashtags; client displays structured result

### API Routes

```
app/api/generate/
├── route.ts          # Product content generation (non-streaming)
└── tiktok/route.ts   # TikTok copy generation (SSE streaming)
```

**Streaming Pattern** (TikTok):
- Server uses `ReadableStream` with SSE format (`data: {...}\n\n`)
- Client reads with `response.body.getReader()` and `TextDecoder`
- Events: `start` → `streaming` (ignored) → `complete` (parsed data) or `error`
- Loading animation shown during `streaming` state; final result displayed on `complete`

### Local Storage

Templates and materials persist via [lib/storage.ts](lib/storage.ts):
- `storage.templates.*` - Template CRUD operations
- `storage.materials.*` - Material library CRUD
- Date objects are automatically serialized/deserialized

### Type System

All types are centralized and exported from [types/index.ts](types/index.ts):

**Core Types**:
- `Product` - Input product with images and attributes
- `GeneratedContent` - AI output with title, selling points, status
- `Template` - Reusable content generation patterns
- `Material` - Saved product materials for reuse

**TikTok Types** (from [types/tiktok.ts](types/tiktok.ts)):
- `TikTokCopy` - Generated TikTok copy with hook, content, cta, hashtags, status
- `TikTokCopyOptions` - User selections (styleId, targetLength, includeHashtags)
- `TikTokStyleId` - Union type of 6 style IDs
- `TIKTOK_STYLES` - Constant array of style definitions (id, name, icon, description)

### Library Structure

```
lib/
├── deepseek/
│   ├── client.ts       # DeepSeek API client with lazy initialization
│   └── prompts.ts      # Prompt templates for product and TikTok generation
├── deepseekGenerator.ts # Product content generation (replaces mock)
├── tiktokGenerator.ts  # TikTok copy generation with streaming
├── mockGenerator.ts    # Mock fallback (not actively used)
├── storage.ts          # LocalStorage wrapper
└── index.ts            # Barrel exports (deepseek before mock)
```

### TikTok Copy Styles

The application supports 6 TikTok copy styles (defined in [types/tiktok.ts](types/tiktok.ts)):

| ID | Name | Icon | Description |
|----|------|------|-------------|
| `funny` | 搞笑幽默 | 😄 | 幽默诙谐，增加娱乐性 |
| `practical` | 实用干货 | 💡 | 突出功能和使用场景 |
| `emotional` | 情感共鸣 | ❤️ | 引发情感共鸣 |
| `recommendation` | 种草安利 | 🌟 | 真诚推荐，自然分享 |
| `story` | 故事讲述 | 📖 | 通过故事展示价值 |
| `comparison` | 对比测评 | ⚔️ | 突出产品优势 |

**Output Structure**:
- `hook` (黄金3秒开头) - Attention-grabbing opening
- `content` (主体内容) - Main body text in selected style
- `cta` (行动号召) - Call-to-action for purchase/engagement
- `hashtags` (话题标签) - 3-5 relevant tags

## UI Patterns

- **Glass morphism**: `glass-effect` class with backdrop blur
- **Color theme**: Violet-to-purple gradients (`from-violet-600 to-purple-600`)
- **Animations**: `animate-fade-in`, `hover-lift` for interactions
- **Status badges**: Green for completed, blue for generating, red for failed
- **Loading animations**: Spinner with centered icon, status text, bouncing dots (see [TikTokResultCard](components/tiktok-copy/TikTokResultCard.tsx:44-64))

## Key Implementation Patterns

### Lazy API Client Initialization

**Problem**: Turbopack caches modules before environment variables are loaded, causing "Missing credentials" errors when initializing OpenAI client at module level.

**Solution**: Use lazy initialization in [lib/deepseek/client.ts](lib/deepseek/client.ts:6-11):

```typescript
// ❌ Wrong - causes Turbopack caching issues
const client = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY });

// ✅ Correct - lazy initialization
function getClient() {
  return new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api-inference.modelscope.cn/v1',
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
}
```

### Server-Side JSON Parsing for Streaming

**Problem**: Sending raw JSON chunks to client causes confusing flicker of unparsed text.

**Solution**: Parse complete response server-side, send structured data on `complete` event:

```typescript
// API Route (app/api/generate/tiktok/route.ts:65-85)
onComplete: (result) => {
  controller.enqueue(encoder.encode(
    `data: ${JSON.stringify({
      type: 'complete',
      result: {
        hook: result.hook,
        content: result.content,
        cta: result.cta,
        hashtags: result.hashtags,
        // ...
      }
    })}\n\n`
  ));
}
```

Client ignores `streaming` events and only displays data on `complete`.

### Export Order Priority

**Problem**: Both `deepseekGenerator` and `mockGenerator` export functions with same names.

**Solution**: Export DeepSeek first in [lib/index.ts](lib/index.ts:1-4):

```typescript
// 使用 DeepSeek API 替代 mock 生成
export * from './deepseekGenerator';
export * from './mockGenerator'; // 保留 mock 作为备用
```

When importing via `import { generateContent } from '@/lib'`, DeepSeek version takes precedence.

## Dependencies

### AI Generation
- **openai**: ^4.76.0 - OpenAI SDK (used for DeepSeek API compatibility)
  - DeepSeek uses OpenAI-compatible API interface
  - Supports streaming responses via `chat.completions.create({ stream: true })`

### Date Handling
- **date-fns**: Used for timestamp formatting in TikTok result cards

## Test Data

Use "Load Test Data" button in the UI to populate products with test images from `/public/test-images/`. See [lib/testDataGenerator.ts](lib/testDataGenerator.ts) for test data generation logic.

## File Upload Handling

Product images use `URL.createObjectURL(file)` to create browser-local URLs. In production, replace with actual upload logic to a storage service.
