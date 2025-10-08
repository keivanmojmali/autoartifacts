# AutoArtifacts

A powerful slide editor component built with ProseMirror for creating rich, interactive presentations.

## ✨ Features

### 🎨 Slide Themes

Apply consistent styling to all slides with a single prop:

- **Default** - Clean white with subtle border and shadow
- **Dark** - Dark background with light text
- **Minimal** - No borders or shadows, just content
- **Gradient** - Purple gradient background
- **Custom** - Define your own themes with CSS

```tsx
<SlideEditor content={myContent} slideTheme="dark" />
```

### 📐 Flexible Layout System

Create responsive column layouts with intuitive ratio strings:

- `'2-1'` - Two columns (66.66% / 33.33%)
- `'1-1-1'` - Three equal columns
- `'5-3-2'` - Complex ratios (50% / 30% / 20%)
- Any valid ratio string works!

```json
{
  "type": "row",
  "attrs": { "layout": "2-1" },
  "content": [...]
}
```

### 🎯 Column Display Attributes

Fine-tune how content appears in columns:

- **Content Mode**: `cover`, `contain`, `default`
- **Vertical Align**: `top`, `center`, `bottom`
- **Horizontal Align**: `left`, `center`, `right`
- **Padding**: `none`, `small`, `medium`, `large`

```json
{
  "type": "column",
  "attrs": {
    "contentMode": "cover",
    "verticalAlign": "center",
    "horizontalAlign": "center",
    "padding": "large"
  },
  "content": [...]
}
```

### 📝 Rich Text Formatting

- **Basic**: Bold, italic, underline, strikethrough
- **Links**: With href, title, and target support
- **Code**: Inline code blocks
- **Colors**: Text color and highlighting
- **Typography**: Font families, sizes, transforms
- **Advanced**: Superscript, subscript, text shadow, letter spacing, line height

### 📦 Media Support

- **Images**: Multiple display modes (cover, contain, fill) and alignment
- **Videos**: Embedded YouTube, Vimeo with aspect ratio control
- **Lists**: Bullet lists and ordered lists with nesting support

## 🚀 Getting Started

### Installation

```bash
npm install autoartifacts
```

### Basic Usage

```tsx
import { SlideEditor } from 'autoartifacts';

const content = {
  type: 'doc',
  content: [
    {
      type: 'slide',
      content: [
        {
          type: 'row',
          attrs: { layout: '2-1' },
          content: [
            {
              type: 'column',
              attrs: {
                verticalAlign: 'center',
                padding: 'large'
              },
              content: [
                {
                  type: 'heading',
                  attrs: { level: 1 },
                  content: [{ type: 'text', text: 'Hello World' }]
                }
              ]
            },
            {
              type: 'column',
              content: [...]
            }
          ]
        }
      ]
    }
  ]
};

function MyApp() {
  return (
    <SlideEditor
      content={content}
      slideTheme="dark"
      onChange={(json) => console.log('Updated:', json)}
    />
  );
}
```

## 📖 Documentation

- **Implementation Summary**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Detailed Plan**: See [plan.md](./plan.md)

## 🧪 Testing

Run the demo application to see all features in action:

```bash
cd demo
npm install
npm run dev
```

Open `http://localhost:5173` to view the comprehensive test suite with 11 different test cases showcasing:

- All 4 built-in themes
- Various layout ratios
- Column display attributes
- Nested rows
- Multiple slides

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run demo
cd demo
npm run dev

# Build package
npm run build
```

## 📋 Component Props

### SlideEditor

| Prop           | Type                                            | Default     | Description                       |
| -------------- | ----------------------------------------------- | ----------- | --------------------------------- |
| `content`      | `any`                                           | Required    | ProseMirror JSON document         |
| `onChange`     | `(json: any) => void`                           | `undefined` | Callback when content changes     |
| `editorTheme`  | `'light' \| 'dark' \| 'presentation' \| string` | `'light'`   | Editor wrapper theme              |
| `editorStyles` | `string`                                        | `''`        | Additional CSS classes for editor |
| `slideTheme`   | `string`                                        | `'default'` | Theme applied to all slides       |

## 🎯 Layout System

The layout system uses a simple ratio-based approach:

- **Single column**: `'1'` (100% width)
- **Equal split**: `'1-1'` (50/50)
- **Two-thirds split**: `'2-1'` (66.66/33.33)
- **Triple equal**: `'1-1-1'` (33.33 each)
- **Custom ratio**: Any combination like `'5-3-2'`

The system validates layouts and gracefully falls back to equal distribution if there's a mismatch, logging helpful warnings to the console.

## ✅ Features Checklist

- ✅ SlideTheme prop with 4 built-in themes
- ✅ Custom theme support via CSS
- ✅ Flexible layout system with ratio strings
- ✅ Layout validation and fallback
- ✅ Nested row support
- ✅ Column display attributes (contentMode, alignment, padding)
- ✅ Rich text marks (bold, italic, colors, etc.)
- ✅ Image and video support
- ✅ List support (bullet and ordered)
- ✅ Comprehensive test suite

## 🚧 Roadmap (Post-MVP)

- Actions API (undo, redo, formatting commands)
- Additional component props (editorMode, onSlideChange)
- JSON validation
- TypeScript type exports
- Error boundaries
- Keyboard shortcuts

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
