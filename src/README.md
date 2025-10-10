# Source Code Architecture

This directory contains the core source code for AutoArtifacts. The codebase is organized into focused modules, each responsible for a specific aspect of the slide editor functionality.

## 📁 Directory Structure

```
src/
├── components/           # React components
│   ├── SlideEditor.tsx   # Main editor component
│   └── KeyboardShortcutsHelp.tsx  # Keyboard shortcuts modal
├── hooks/                # React hooks
│   ├── useSlideEditor.ts # Main editor hook
│   └── useHistoryState.ts # History state hook
├── commands/             # Commands API
│   └── index.ts          # 70+ editor commands
├── actions/              # Action system (future)
│   └── index.ts
├── schema/               # ProseMirror schema
│   ├── index.ts          # Schema exports
│   ├── nodes/            # Node type definitions
│   └── marks/            # Mark type definitions
├── types/                # TypeScript types
│   ├── index.ts          # Main type exports
│   └── events.ts         # Event type definitions
├── utils/                # Utility functions
│   ├── stateAccess.ts    # Editor state access
│   ├── historyUtils.ts   # History utilities
│   ├── slideNavigation.ts # Slide navigation
│   ├── selectionUtils.ts # Selection manipulation
│   ├── exporters.ts      # Export functionality
│   ├── layoutParser.ts   # Layout system
│   └── controlMode.ts    # Controlled/uncontrolled mode
├── validation/           # Content validation
│   ├── index.ts          # Validation exports
│   ├── validator.ts      # Core validator
│   └── validatorInstance.ts # Validator instance
├── keyboard/             # Keyboard shortcuts
│   └── defaultShortcuts.ts # Default shortcut definitions
├── index.ts              # Main package entry point
└── styles.css            # Component styles
```

## 🧩 Module Overview

### Components (`/components`)

React components that make up the editor UI.

- **SlideEditor**: Main editor component with full ProseMirror integration
- **KeyboardShortcutsHelp**: Modal displaying available keyboard shortcuts

[📖 Read more](./components/README.md)

### Hooks (`/hooks`)

Custom React hooks for working with the editor.

- **useSlideEditor**: Main hook for managing editor instances
- **useHistoryState**: Hook for accessing undo/redo state

[📖 Read more](./hooks/README.md)

### Commands (`/commands`)

Programmatic API for controlling the editor.

- 70+ commands for text formatting, slides, navigation, etc.
- Chainable command API
- Null-safe execution

[📖 Read more](./commands/README.md)

### Actions (`/actions`)

Action system for undo/redo operations (currently minimal, planned for expansion).

### Schema (`/schema`)

ProseMirror schema definitions for all content types.

**Nodes**: Document structure elements (slides, rows, columns, paragraphs, etc.)
**Marks**: Text formatting (bold, italic, colors, etc.)

[📖 Read more](./schema/README.md)

### Types (`/types`)

Comprehensive TypeScript type definitions.

- Content node types
- Component prop types
- API interfaces
- Event types

[📖 Read more](./types/README.md)

### Utils (`/utils`)

Utility functions for various editor operations.

- **stateAccess**: Read editor state
- **historyUtils**: Undo/redo utilities
- **slideNavigation**: Navigate between slides
- **selectionUtils**: Manipulate text selection
- **exporters**: Export to different formats
- **layoutParser**: Parse and apply column layouts
- **controlMode**: Validate controlled/uncontrolled usage

[📖 Read more](./utils/README.md)

### Validation (`/validation`)

Content validation system with auto-fix capabilities.

- Validate JSON content against schema
- Three modes: strict, lenient, off
- Auto-fix common issues
- Detailed error reporting

[📖 Read more](./validation/README.md)

### Keyboard (`/keyboard`)

Keyboard shortcuts system.

- Default shortcuts for common operations
- Customizable shortcuts
- Platform-specific key displays (Cmd vs Ctrl)

[📖 Read more](./keyboard/README.md)

## 🔄 Data Flow

### Controlled Mode

```
User Edit → ProseMirror Transaction → onChange callback → 
Parent Component → content prop → ProseMirror State
```

### Uncontrolled Mode

```
User Edit → ProseMirror Transaction → Internal State Update → 
ProseMirror State
```

### Command Execution

```
Component/Hook → editorRef.commands.xxx() → 
ProseMirror Transaction → State Update
```

### Event System

```
ProseMirror Transaction → Event Dispatcher → 
Callback (onCreate, onUpdate, onContentChange, etc.)
```

## 🏗️ Architecture Patterns

### 1. Separation of Concerns

Each module has a single, well-defined responsibility:
- Components handle UI rendering
- Hooks manage React state and lifecycle
- Commands provide imperative API
- Utils contain reusable logic
- Validation ensures data integrity

### 2. Null Safety

All APIs handle null/undefined gracefully:
```typescript
const view = (): EditorView | null => getView();
if (!view()) {
  console.warn('Editor not initialized');
  return false;
}
```

### 3. Type Safety

Comprehensive TypeScript types ensure compile-time safety:
```typescript
export interface SlideEditorProps {
  content?: DocNode;
  onChange?: (content: DocNode) => void;
  // ... 40+ typed props
}
```

### 4. Composability

APIs can be chained and composed:
```typescript
editor.commands
  .chain()
  .selectAll()
  .toggleBold()
  .setTextColor('#ff0000')
  .run();
```

### 5. Extensibility

Schema and commands can be extended without modifying core:
```typescript
export const schema = new Schema({
  nodes: { ...defaultNodes, customNode },
  marks: { ...defaultMarks, customMark }
});
```

## 🔑 Key Files

### `index.ts` - Main Entry Point

Exports all public APIs:
- Components (SlideEditor, KeyboardShortcutsHelp)
- Hooks (useSlideEditor, useHistoryState)
- Types (all TypeScript types)
- Utilities (schema, actions, validation, etc.)

### `components/SlideEditor.tsx` - Core Component

The heart of the editor:
- 700+ lines of React/ProseMirror integration
- Handles controlled/uncontrolled modes
- Implements ref API
- Manages lifecycle events
- Coordinates all subsystems

### `commands/index.ts` - Commands API

Comprehensive command system:
- Text formatting (bold, italic, colors, etc.)
- Block types (headings, paragraphs)
- Media (images, videos)
- Slides (add, delete, duplicate, navigate)
- History (undo, redo)
- Selection (select, collapse, expand)
- Chainable execution

### `schema/index.ts` - ProseMirror Schema

Defines the document structure:
- Node types (slide, row, column, etc.)
- Mark types (bold, italic, colors, etc.)
- Attributes and validation
- Rendering rules

## 🧪 Testing Strategy

The codebase includes comprehensive testing through the demo application:

1. **Unit Tests**: Individual commands and utilities (via demo interactions)
2. **Integration Tests**: Full editor workflows (via demo scenarios)
3. **Visual Tests**: Layout and styling (via demo showcase)
4. **Type Tests**: TypeScript compilation ensures type safety

## 🚀 Performance Considerations

### 1. Lazy Evaluation

Commands and utilities don't execute until needed:
```typescript
const exec = (fn: () => boolean): boolean => {
  const v = view();
  if (!v) return false;
  return fn();
};
```

### 2. Memoization

Expensive computations are memoized:
```typescript
const effectiveShortcuts = useMemo(() => {
  // Merge shortcuts only when config changes
}, [keyboardShortcuts]);
```

### 3. Debouncing

Layout recalculations are debounced:
```typescript
setTimeout(() => {
  if (editorRef.current) {
    applyAllLayouts(editorRef.current);
  }
}, 0);
```

### 4. Minimal Re-renders

State updates are optimized to minimize React re-renders:
```typescript
const [internalContent, setInternalContent] = useState(() => {
  // Expensive initialization only on mount
});
```

## 🔧 Development Guidelines

### Adding a New Command

1. Add command signature to `types/index.ts` → `Commands` interface
2. Implement command in `commands/index.ts`
3. Add to chainable commands
4. Document in README.md
5. Test in demo app

### Adding a New Node Type

1. Create node definition in `schema/nodes/`
2. Add to `schema/index.ts`
3. Add TypeScript type to `types/index.ts`
4. Add rendering/styling in `styles.css`
5. Test in demo app

### Adding a New Event

1. Define event params in `types/events.ts`
2. Add prop to `SlideEditorProps` in `types/index.ts`
3. Implement event firing in `components/SlideEditor.tsx`
4. Document in README.md
5. Test with callback in demo

## 📚 Further Reading

- [Components Documentation](./components/README.md)
- [Hooks Documentation](./hooks/README.md)
- [Commands API Documentation](./commands/README.md)
- [Schema Documentation](./schema/README.md)
- [Types Documentation](./types/README.md)
- [Utils Documentation](./utils/README.md)
- [Validation Documentation](./validation/README.md)
- [Keyboard Documentation](./keyboard/README.md)

## 🎯 Next Steps

1. Explore the demo application to see all features in action
2. Read the feature documentation in `/plans`
3. Check individual module READMEs for deep dives
4. Build your own presentation editor!

---

For questions or contributions, see the main [README](../README.md).

