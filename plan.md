// ============================================
// COMPONENT PROPS + VALIDATION & TYPES - COMPLETE IMPLEMENTATION GUIDE
// ============================================

/\*
OVERVIEW:

---

This implementation adds the final MVP features to AutoArtifacts:

PART 1: COMPONENT PROPS (5 new props)

- editorMode: Switch between 'edit', 'present', and 'preview' modes
- readOnly: Make editor view-only (no editing allowed)
- currentSlide: Control which slide is currently active/visible
- onSlideChange: Callback when user navigates between slides
- onError: Callback for error handling

PART 2: VALIDATION & TYPES

- JSON schema validation: Validate content structure before rendering
- TypeScript type exports: Export types for all JSON structures

WHY THIS IS CRITICAL:

- Completes the MVP feature set
- Makes editor more flexible and controllable
- Enables presentation mode and slide navigation
- Provides type safety for developers
- Prevents crashes from invalid JSON

ARCHITECTURE:

- Props are added to SlideEditor component
- Validation runs before creating ProseMirror state
- Types are exported from main index.ts
- Error handling is graceful with callbacks
- All features work together seamlessly
  \*/

// ================== PART 1: COMPONENT PROPS ==================

// ================== STEP 1: UPDATE SLIDEEDITOR INTERFACE ==================

// File: src/components/SlideEditor.tsx

// UPDATE THE INTERFACE with new props:
interface SlideEditorProps {
content: any;
onChange?: (json: any) => void;
editorTheme?: 'light' | 'dark' | 'presentation' | string;
editorStyles?: string;
slideTheme?: string;

// NEW PROPS:
editorMode?: 'edit' | 'present' | 'preview'; // Determines interaction mode
readOnly?: boolean; // If true, editor is view-only
currentSlide?: number; // Zero-based slide index to display
onSlideChange?: (slideIndex: number) => void; // Called when slide changes
onError?: (error: Error) => void; // Called when errors occur
}

// ================== STEP 2: IMPLEMENT EDITORMODE PROP ==================

/\*
editorMode determines how the editor behaves:

- 'edit': Full editing capabilities (default)
- 'present': Presentation mode - read-only, focused on one slide, navigation controls
- 'preview': Preview mode - read-only, shows all slides, no editing
  \*/

// File: src/components/SlideEditor.tsx

export const SlideEditor = forwardRef<SlideEditorRef, SlideEditorProps>(
({
content,
onChange,
editorTheme = 'light',
editorStyles = '',
slideTheme = 'default',
editorMode = 'edit', // ADD THIS
readOnly = false, // ADD THIS
currentSlide = 0, // ADD THIS
onSlideChange, // ADD THIS
onError // ADD THIS
}, ref) => {
const editorRef = useRef<HTMLDivElement>(null);
const viewRef = useRef<EditorView | null>(null);

    // Expose the EditorView via ref
    useImperativeHandle(ref, () => ({
      view: viewRef.current
    }));

    useEffect(() => {
      if (!editorRef.current) return;

      try {
        // ADD PLUGINS including history
        const plugins = [
          history(),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo
          }),
          keymap(baseKeymap)
        ];

        const state = EditorState.create({
          doc: schema.nodeFromJSON(content),
          schema,
          plugins
        });

        // MODIFY: Add editable based on editorMode and readOnly
        const isEditable = editorMode === 'edit' && !readOnly;

        const view = new EditorView(editorRef.current, {
          state,
          editable: () => isEditable,  // ADD THIS LINE
          dispatchTransaction(transaction) {
            const newState = view.state.apply(transaction);
            view.updateState(newState);

            if (onChange && transaction.docChanged) {
              onChange(newState.doc.toJSON());
            }
          }
        });

        viewRef.current = view;

        // Apply layouts after initial render
        setTimeout(() => {
          if (editorRef.current) {
            applyAllLayouts(editorRef.current);
          }
        }, 0);

        return () => {
          view.destroy();
        };
      } catch (error) {
        // Call onError if provided
        if (onError && error instanceof Error) {
          onError(error);
        } else {
          console.error('[AutoArtifacts] Error initializing editor:', error);
        }
      }
    }, [editorMode, readOnly]); // ADD dependencies

    // Re-apply layouts when content changes
    useEffect(() => {
      if (!editorRef.current || !viewRef.current) return;

      setTimeout(() => {
        if (editorRef.current) {
          applyAllLayouts(editorRef.current);
        }
      }, 0);
    }, [content]);

    // MODIFY: Add mode-specific classes
    const editorClassName = `autoartifacts-editor theme-${editorTheme} slide-theme-${slideTheme} mode-${editorMode} ${readOnly ? 'read-only' : ''} ${editorStyles}`.trim();

    return (
      <div
        ref={editorRef}
        className={editorClassName}
      />
    );

}
);

// ================== STEP 3: IMPLEMENT CURRENTSLIDE & ONSLIDECHANGE ==================

/_
currentSlide controls which slide is visible/active
onSlideChange fires when the active slide changes
This enables slide navigation and presentation mode
_/

// File: src/utils/slideNavigation.ts (CREATE THIS NEW FILE)

/\*\*

- Slide Navigation Utilities
-
- Handles slide visibility, navigation, and presentation mode
  \*/

/\*\*

- Get all slide elements in the editor
  \*/
  export function getAllSlides(editorElement: HTMLElement): HTMLElement[] {
  return Array.from(
  editorElement.querySelectorAll('[data-node-type="slide"]')
  ) as HTMLElement[];
  }

/\*\*

- Get the total number of slides
  \*/
  export function getSlideCount(editorElement: HTMLElement): number {
  return getAllSlides(editorElement).length;
  }

/\*\*

- Show only the specified slide, hide all others
- Used for presentation mode
  \*/
  export function showSlide(
  editorElement: HTMLElement,
  slideIndex: number
  ): void {
  const slides = getAllSlides(editorElement);

if (slideIndex < 0 || slideIndex >= slides.length) {
console.warn(
`[AutoArtifacts] Invalid slide index ${slideIndex}. ` +
`Must be between 0 and ${slides.length - 1}`
);
return;
}

slides.forEach((slide, index) => {
if (index === slideIndex) {
slide.style.display = 'block';
slide.setAttribute('data-active', 'true');
} else {
slide.style.display = 'none';
slide.setAttribute('data-active', 'false');
}
});
}

/\*\*

- Show all slides
- Used for edit and preview modes
  \*/
  export function showAllSlides(editorElement: HTMLElement): void {
  const slides = getAllSlides(editorElement);

slides.forEach((slide) => {
slide.style.display = 'block';
slide.removeAttribute('data-active');
});
}

/\*\*

- Get the index of the currently visible slide in presentation mode
  \*/
  export function getCurrentSlideIndex(editorElement: HTMLElement): number {
  const slides = getAllSlides(editorElement);

for (let i = 0; i < slides.length; i++) {
if (slides[i].getAttribute('data-active') === 'true') {
return i;
}
}

return 0; // Default to first slide
}

/\*\*

- Navigate to next slide
  \*/
  export function nextSlide(
  editorElement: HTMLElement,
  onSlideChange?: (index: number) => void
  ): void {
  const currentIndex = getCurrentSlideIndex(editorElement);
  const slideCount = getSlideCount(editorElement);

if (currentIndex < slideCount - 1) {
const newIndex = currentIndex + 1;
showSlide(editorElement, newIndex);
if (onSlideChange) {
onSlideChange(newIndex);
}
}
}

/\*\*

- Navigate to previous slide
  \*/
  export function prevSlide(
  editorElement: HTMLElement,
  onSlideChange?: (index: number) => void
  ): void {
  const currentIndex = getCurrentSlideIndex(editorElement);

if (currentIndex > 0) {
const newIndex = currentIndex - 1;
showSlide(editorElement, newIndex);
if (onSlideChange) {
onSlideChange(newIndex);
}
}
}

/\*\*

- Go to specific slide
  \*/
  export function goToSlide(
  editorElement: HTMLElement,
  slideIndex: number,
  onSlideChange?: (index: number) => void
  ): void {
  showSlide(editorElement, slideIndex);
  if (onSlideChange) {
  onSlideChange(slideIndex);
  }
  }

// ================== STEP 4: INTEGRATE SLIDE NAVIGATION INTO SLIDEEDITOR ==================

// File: src/components/SlideEditor.tsx

// ADD IMPORT:
import {
showSlide,
showAllSlides,
nextSlide as navNextSlide,
prevSlide as navPrevSlide
} from '../utils/slideNavigation';

export const SlideEditor = forwardRef<SlideEditorRef, SlideEditorProps>(
({
content,
onChange,
editorTheme = 'light',
editorStyles = '',
slideTheme = 'default',
editorMode = 'edit',
readOnly = false,
currentSlide = 0,
onSlideChange,
onError
}, ref) => {
const editorRef = useRef<HTMLDivElement>(null);
const viewRef = useRef<EditorView | null>(null);

    // ... existing code ...

    // ADD: Effect to handle slide visibility based on mode and currentSlide
    useEffect(() => {
      if (!editorRef.current) return;

      if (editorMode === 'present') {
        // In presentation mode, show only current slide
        showSlide(editorRef.current, currentSlide);
      } else {
        // In edit and preview modes, show all slides
        showAllSlides(editorRef.current);
      }
    }, [editorMode, currentSlide]);

    // ADD: Keyboard navigation for presentation mode
    useEffect(() => {
      if (editorMode !== 'present' || !editorRef.current) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (!editorRef.current) return;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          navNextSlide(editorRef.current, onSlideChange);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          navPrevSlide(editorRef.current, onSlideChange);
        } else if (e.key === 'Home') {
          e.preventDefault();
          showSlide(editorRef.current, 0);
          if (onSlideChange) onSlideChange(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          const slides = editorRef.current.querySelectorAll('[data-node-type="slide"]');
          const lastIndex = slides.length - 1;
          showSlide(editorRef.current, lastIndex);
          if (onSlideChange) onSlideChange(lastIndex);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editorMode, onSlideChange]);

    // ... rest of component ...

}
);

// ================== STEP 5: ADD STYLES FOR MODES ==================

// File: src/styles.css

// ADD at the end:

/_ ==================== EDITOR MODES ==================== _/

/_ Edit mode (default) - full editing _/
.autoartifacts-editor.mode-edit {
cursor: text;
}

/_ Preview mode - read-only, all slides visible _/
.autoartifacts-editor.mode-preview {
cursor: default;
}

.autoartifacts-editor.mode-preview .slide {
pointer-events: none;
}

/_ Presentation mode - read-only, one slide at a time _/
.autoartifacts-editor.mode-present {
background: #000;
display: flex;
align-items: center;
justify-content: center;
min-height: 100vh;
padding: 40px;
}

.autoartifacts-editor.mode-present .slide {
max-width: 1200px;
width: 100%;
aspect-ratio: 16 / 9;
margin: 0 auto;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/_ Read-only styling _/
.autoartifacts-editor.read-only {
cursor: default;
}

.autoartifacts-editor.read-only .ProseMirror {
cursor: default;
}

/_ Active slide indicator (for presentation mode) _/
.slide[data-active="true"] {
animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
from {
opacity: 0;
transform: translateX(20px);
}
to {
opacity: 1;
transform: translateX(0);
}
}

// ================== STEP 6: EXPORT NAVIGATION ACTIONS ==================

// File: src/actions/index.ts

// ADD at the end:

import {
nextSlide as navNextSlide,
prevSlide as navPrevSlide,
goToSlide as navGoToSlide,
getSlideCount,
getCurrentSlideIndex
} from '../utils/slideNavigation';

/\*\*

- Navigate to next slide (presentation mode)
-
- @param editorElement - The editor DOM element
- @param onSlideChange - Optional callback when slide changes
  \*/
  export function nextSlideAction(
  editorElement: HTMLElement | null,
  onSlideChange?: (index: number) => void
  ): void {
  if (!editorElement) {
  console.warn('[AutoArtifacts] Cannot navigate: editor element is null');
  return;
  }
  navNextSlide(editorElement, onSlideChange);
  }

/\*\*

- Navigate to previous slide (presentation mode)
-
- @param editorElement - The editor DOM element
- @param onSlideChange - Optional callback when slide changes
  \*/
  export function prevSlideAction(
  editorElement: HTMLElement | null,
  onSlideChange?: (index: number) => void
  ): void {
  if (!editorElement) {
  console.warn('[AutoArtifacts] Cannot navigate: editor element is null');
  return;
  }
  navPrevSlide(editorElement, onSlideChange);
  }

/\*\*

- Go to specific slide (presentation mode)
-
- @param editorElement - The editor DOM element
- @param slideIndex - Zero-based slide index
- @param onSlideChange - Optional callback when slide changes
  \*/
  export function goToSlideAction(
  editorElement: HTMLElement | null,
  slideIndex: number,
  onSlideChange?: (index: number) => void
  ): void {
  if (!editorElement) {
  console.warn('[AutoArtifacts] Cannot navigate: editor element is null');
  return;
  }
  navGoToSlide(editorElement, slideIndex, onSlideChange);
  }

/\*\*

- Get total number of slides
-
- @param editorElement - The editor DOM element
- @returns Number of slides
  \*/
  export function getSlideCountAction(editorElement: HTMLElement | null): number {
  if (!editorElement) return 0;
  return getSlideCount(editorElement);
  }

/\*\*

- Get current slide index (presentation mode)
-
- @param editorElement - The editor DOM element
- @returns Current slide index (zero-based)
  \*/
  export function getCurrentSlideAction(editorElement: HTMLElement | null): number {
  if (!editorElement) return 0;
  return getCurrentSlideIndex(editorElement);
  }

// UPDATE the actions export:
export const actions = {
// Existing actions
undo: undoAction,
redo: redoAction,
bold: boldAction,
italic: italicAction,
addLink: addLinkAction,
removeLink: removeLinkAction,
isBoldActive,
isItalicActive,
isLinkActive,
getLinkHref,

// NEW: Navigation actions
nextSlide: nextSlideAction,
prevSlide: prevSlideAction,
goToSlide: goToSlideAction,
getSlideCount: getSlideCountAction,
getCurrentSlide: getCurrentSlideAction
};

// ================== PART 2: VALIDATION & TYPES ==================

// ================== STEP 7: CREATE VALIDATION UTILITY ==================

// File: src/validation/index.ts (CREATE THIS NEW FILE)

/\*\*

- JSON Schema Validation
-
- Validates ProseMirror JSON content structure before rendering
- Prevents crashes from malformed JSON
  \*/

export class ValidationError extends Error {
constructor(message: string) {
super(message);
this.name = 'ValidationError';
}
}

/\*\*

- Validate that a node has required properties
  \*/
  function validateNodeStructure(node: any, path: string = 'root'): void {
  if (!node || typeof node !== 'object') {
  throw new ValidationError(`${path}: Node must be an object`);
  }

if (!node.type || typeof node.type !== 'string') {
throw new ValidationError(`${path}: Node must have a 'type' string property`);
}
}

/\*\*

- Validate document structure
  \*/
  function validateDoc(doc: any): void {
  validateNodeStructure(doc, 'doc');

if (doc.type !== 'doc') {
throw new ValidationError(`Root node must be type 'doc', got '${doc.type}'`);
}

if (!Array.isArray(doc.content)) {
throw new ValidationError('Doc must have content array');
}

if (doc.content.length === 0) {
throw new ValidationError('Doc must have at least one slide');
}

// Validate all content nodes are slides
doc.content.forEach((node: any, index: number) => {
validateSlide(node, `doc.content[${index}]`);
});
}

/\*\*

- Validate slide structure
  \*/
  function validateSlide(slide: any, path: string): void {
  validateNodeStructure(slide, path);

if (slide.type !== 'slide') {
throw new ValidationError(`${path}: Expected 'slide', got '${slide.type}'`);
}

if (!Array.isArray(slide.content)) {
throw new ValidationError(`${path}: Slide must have content array`);
}

if (slide.content.length === 0) {
throw new ValidationError(`${path}: Slide must have at least one row`);
}

// Validate all content nodes are rows
slide.content.forEach((node: any, index: number) => {
validateRow(node, `${path}.content[${index}]`);
});
}

/\*\*

- Validate row structure
  \*/
  function validateRow(row: any, path: string): void {
  validateNodeStructure(row, path);

if (row.type !== 'row') {
throw new ValidationError(`${path}: Expected 'row', got '${row.type}'`);
}

if (!Array.isArray(row.content)) {
throw new ValidationError(`${path}: Row must have content array`);
}

if (row.content.length === 0) {
throw new ValidationError(`${path}: Row must have at least one column or content block`);
}
}

/\*\*

- Main validation function
-
- @param content - ProseMirror JSON content
- @throws ValidationError if content is invalid
- @returns true if valid
  \*/
  export function validateContent(content: any): boolean {
  try {
  validateDoc(content);
  return true;
  } catch (error) {
  if (error instanceof ValidationError) {
  throw error;
  }
  throw new ValidationError(`Validation failed: ${error}`);
  }
  }

/\*\*

- Safe validation that returns result object instead of throwing
-
- @param content - ProseMirror JSON content
- @returns Object with valid flag and optional error
  \*/
  export function safeValidateContent(content: any): {
  valid: boolean;
  error?: string;
  } {
  try {
  validateContent(content);
  return { valid: true };
  } catch (error) {
  if (error instanceof ValidationError) {
  return { valid: false, error: error.message };
  }
  return { valid: false, error: 'Unknown validation error' };
  }
  }

// ================== STEP 8: INTEGRATE VALIDATION INTO SLIDEEDITOR ==================

// File: src/components/SlideEditor.tsx

// ADD IMPORT:
import { validateContent, ValidationError } from '../validation';

export const SlideEditor = forwardRef<SlideEditorRef, SlideEditorProps>(
({
content,
onChange,
editorTheme = 'light',
editorStyles = '',
slideTheme = 'default',
editorMode = 'edit',
readOnly = false,
currentSlide = 0,
onSlideChange,
onError
}, ref) => {
// ... existing code ...

    useEffect(() => {
      if (!editorRef.current) return;

      try {
        // ADD: Validate content before creating editor
        validateContent(content);

        const plugins = [
          history(),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo
          }),
          keymap(baseKeymap)
        ];

        const state = EditorState.create({
          doc: schema.nodeFromJSON(content),
          schema,
          plugins
        });

        // ... rest of editor creation ...

      } catch (error) {
        // Handle validation errors
        if (error instanceof ValidationError) {
          console.error('[AutoArtifacts] Content validation failed:', error.message);
          if (onError) {
            onError(error);
          }
          return; // Don't create editor if validation fails
        }

        // Handle other errors
        if (onError && error instanceof Error) {
          onError(error);
        } else {
          console.error('[AutoArtifacts] Error initializing editor:', error);
        }
      }
    }, [content, editorMode, readOnly]);

    // ... rest of component ...

}
);

// ================== STEP 9: CREATE TYPESCRIPT TYPES ==================

// File: src/types/index.ts (CREATE THIS NEW FILE)

/\*\*

- TypeScript Type Definitions for AutoArtifacts
-
- Export these types so developers get autocomplete and type safety
  \*/

// ===== BASE TYPES =====

/\*\*

- Base node structure
  \*/
  export interface BaseNode {
  type: string;
  content?: ContentNode[];
  attrs?: Record<string, any>;
  }

/\*\*

- Text node with optional marks
  \*/
  export interface TextNode {
  type: 'text';
  text: string;
  marks?: Mark[];
  }

/\*\*

- Mark (text formatting)
  \*/
  export interface Mark {
  type: string;
  attrs?: Record<string, any>;
  }

// ===== CONTENT NODES =====

/\*\*

- Document node (root)
  \*/
  export interface DocNode {
  type: 'doc';
  content: SlideNode[];
  }

/\*\*

- Slide node
  \*/
  export interface SlideNode {
  type: 'slide';
  attrs?: {
  className?: string;
  };
  content: RowNode[];
  }

/\*\*

- Row node (horizontal container)
  \*/
  export interface RowNode {
  type: 'row';
  attrs?: {
  className?: string;
  layout?: string; // e.g., '2-1', '1-1-1'
  };
  content: (ColumnNode | BlockNode)[];
  }

/\*\*

- Column node (vertical container)
  \*/
  export interface ColumnNode {
  type: 'column';
  attrs?: {
  className?: string;
  contentMode?: 'default' | 'cover' | 'contain';
  verticalAlign?: 'top' | 'center' | 'bottom';
  horizontalAlign?: 'left' | 'center' | 'right';
  padding?: 'none' | 'small' | 'medium' | 'large';
  };
  content: (BlockNode | RowNode)[];
  }

/\*\*

- Paragraph node
  \*/
  export interface ParagraphNode {
  type: 'paragraph';
  attrs?: {
  className?: string;
  };
  content?: (TextNode | InlineNode)[];
  }

/\*\*

- Heading node
  \*/
  export interface HeadingNode {
  type: 'heading';
  attrs: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  };
  content?: (TextNode | InlineNode)[];
  }

/\*\*

- Image node
  \*/
  export interface ImageNode {
  type: 'image';
  attrs: {
  src: string;
  alt?: string;
  width?: number | string;
  display?: 'default' | 'cover' | 'contain' | 'fill';
  align?: 'left' | 'center' | 'right';
  };
  }

/\*\*

- Video node
  \*/
  export interface VideoNode {
  type: 'video';
  attrs: {
  src: string;
  provider?: 'youtube' | 'vimeo' | 'embed';
  width?: number | string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  align?: 'left' | 'center' | 'right';
  };
  }

/\*\*

- Bullet list node
  \*/
  export interface BulletListNode {
  type: 'bulletList';
  attrs?: {
  className?: string;
  };
  content: ListItemNode[];
  }

/\*\*

- Ordered list node
  \*/
  export interface OrderedListNode {
  type: 'orderedList';
  attrs?: {
  className?: string;
  start?: number;
  };
  content: ListItemNode[];
  }

/\*\*

- List item node
  \*/
  export interface ListItemNode {
  type: 'listItem';
  attrs?: {
  className?: string;
  };
  content: BlockNode[];
  }

// ===== UNION TYPES =====

/\*\*

- Any block-level node
  \*/
  export type BlockNode =
  | ParagraphNode
  | HeadingNode
  | ImageNode
  | VideoNode
  | BulletListNode
  | OrderedListNode;

/\*\*

- Any inline-level node
  \*/
  export type InlineNode = TextNode;

/\*\*

- Any content node
  \*/
  export type ContentNode =
  | DocNode
  | SlideNode
  | RowNode
  | ColumnNode
  | BlockNode
  | InlineNode;

// ===== MARK TYPES =====

/\*\*

- Bold mark
  \*/
  export interface BoldMark {
  type: 'bold';
  }

/\*\*

- Italic mark
  \*/
  export interface ItalicMark {
  type: 'italic';
  }

/\*\*

- Link mark
  \*/
  export interface LinkMark {
  type: 'link';
  attrs: {
  href: string;
  title?: string;
  target?: string;
  };
  }

/\*\*

- Underline mark
  \*/
  export interface UnderlineMark {
  type: 'underline';
  }

/\*\*

- Strikethrough mark
  \*/
  export interface StrikethroughMark {
  type: 'strikethrough';
  }

/\*\*

- Code mark (inline code)
  \*/
  export interface CodeMark {
  type: 'code';
  }

/\*\*

- Text color mark
  \*/
  export interface TextColorMark {
  type: 'textColor';
  attrs: {
  color: string;
  };
  }

/\*\*

- Highlight mark
  \*/
  export interface HighlightMark {
  type: 'highlight';
  attrs: {
  color: string;
  };
  }

// ===== COMPONENT TYPES =====

/\*\*

- SlideEditor component props
  \*/
  export interface SlideEditorProps {
  content: DocNode;
  onChange?: (content: DocNode) => void;
  editorTheme?: 'light' | 'dark' | 'presentation' | string;
  editorStyles?: string;
  slideTheme?: string;
  editorMode?: 'edit' | 'present' | 'preview';
  readOnly?: boolean;
  currentSlide?: number;
  onSlideChange?: (slideIndex: number) => void;
  onError?: (error: Error) => void;
  }

/\*\*

- SlideEditor ref type
  \*/
  export interface SlideEditorRef {
  view: any; // EditorView from prosemirror-view
  }

// ================== STEP 10: EXPORT TYPES FROM MAIN INDEX ==================

// File: src/index.ts

// UPDATE exports:
export { SlideEditor } from './components/SlideEditor';
export type { SlideEditorRef } from './components/SlideEditor';
export { schema } from './schema';
export { actions } from './actions';
export { validateContent, safeValidateContent } from './validation';

// ADD: Export all types
export type {
// Base types
BaseNode,
TextNode,
Mark,

// Content nodes
DocNode,
SlideNode,
RowNode,
ColumnNode,
ParagraphNode,
HeadingNode,
ImageNode,
VideoNode,
BulletListNode,
OrderedListNode,
ListItemNode,

// Union types
BlockNode,
InlineNode,
ContentNode,

// Marks
BoldMark,
ItalicMark,
LinkMark,
UnderlineMark,
StrikethroughMark,
CodeMark,
TextColorMark,
HighlightMark,

// Component types
SlideEditorProps,
SlideEditorRef
} from './types';

// ================== COMPREHENSIVE TESTS ==================

// TEST 1: EditorMode - Edit Mode (Default)
// File: demo/src/EditModeTest.tsx

import React, { useRef, useState } from 'react';
import { SlideEditor, SlideEditorRef, DocNode } from 'autoartifacts';

const sampleContent
: DocNode = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
content: [
{
type: 'column',
content: [
{
type: 'paragraph',
content: [
{ type: 'text', text: 'This is edit mode. You can type and edit text freely.' }
]
}
]
}
]
}
]
}
]
};

function EditModeTest() {
const editorRef = useRef<SlideEditorRef>(null);
const [content, setContent] = useState(sampleContent);

return (

<div style={{ padding: '20px' }}>
<h2>Edit Mode Test (Default)</h2>
<p>Try typing in the editor below. Changes should be saved.</p>
<SlideEditor 
        ref={editorRef}
        content={content}
        onChange={setContent}
        editorMode="edit"
      />
</div>
);
}

export default EditModeTest;

// EXPECTED RESULT:
// - Can click and edit text
// - Can add/remove content
// - onChange fires when content changes
// - Full editing capabilities

// ---

// TEST 2: EditorMode - Preview Mode
// File: demo/src/PreviewModeTest.tsx

import React from 'react';
import { SlideEditor, DocNode } from 'autoartifacts';

const multiSlideContent: DocNode = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
content: [
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 1 },
content: [{ type: 'text', text: 'Slide 1' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'This is preview mode. All slides are visible but read-only.' }]
}
]
}
]
}
]
},
{
type: 'slide',
content: [
{
type: 'row',
content: [
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 1 },
content: [{ type: 'text', text: 'Slide 2' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'You can see all slides but cannot edit.' }]
}
]
}
]
}
]
},
{
type: 'slide',
content: [
{
type: 'row',
content: [
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 1 },
content: [{ type: 'text', text: 'Slide 3' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'Perfect for reviewing the full presentation.' }]
}
]
}
]
}
]
}
]
};

function PreviewModeTest() {
return (

<div style={{ padding: '20px' }}>
<h2>Preview Mode Test</h2>
<p>All slides visible, read-only. Try clicking - you cannot edit.</p>
<SlideEditor 
        content={multiSlideContent}
        editorMode="preview"
      />
</div>
);
}

export default PreviewModeTest;

// EXPECTED RESULT:
// - All 3 slides visible
// - Cannot edit any content
// - Cursor is default, not text cursor
// - Pointer events disabled

// ---

// TEST 3: EditorMode - Presentation Mode with Navigation
// File: demo/src/PresentModeTest.tsx

import React, { useState } from 'react';
import { SlideEditor, actions, DocNode } from 'autoartifacts';

const presentationContent: DocNode = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
content: [
{
type: 'column',
attrs: {
verticalAlign: 'center',
horizontalAlign: 'center'
},
content: [
{
type: 'heading',
attrs: { level: 1 },
content: [{ type: 'text', text: 'Welcome to the Presentation' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'Use arrow keys or buttons to navigate' }]
}
]
}
]
}
]
},
{
type: 'slide',
content: [
{
type: 'row',
content: [
{
type: 'column',
attrs: {
verticalAlign: 'center'
},
content: [
{
type: 'heading',
attrs: { level: 1 },
content: [{ type: 'text', text: 'Slide 2' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'This is the second slide. Press right arrow to continue.' }]
}
]
}
]
}
]
},
{
type: 'slide',
content: [
{
type: 'row',
content: [
{
type: 'column',
attrs: {
verticalAlign: 'center'
},
content: [
{
type: 'heading',
attrs: { level: 1 },
content: [{ type: 'text', text: 'Slide 3' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'Final slide. Press left arrow to go back.' }]
}
]
}
]
}
]
}
]
};

function PresentModeTest() {
const [currentSlide, setCurrentSlide] = useState(0);
const editorRef = React.useRef<HTMLDivElement>(null);

const totalSlides = presentationContent.content.length;

const handleNext = () => {
if (currentSlide < totalSlides - 1) {
setCurrentSlide(currentSlide + 1);
}
};

const handlePrev = () => {
if (currentSlide > 0) {
setCurrentSlide(currentSlide - 1);
}
};

return (

<div>
{/_ Navigation Controls _/}
<div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: '10px',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px 20px',
        borderRadius: '8px'
      }}>
<button
onClick={handlePrev}
disabled={currentSlide === 0}
style={{
            padding: '8px 16px',
            background: currentSlide === 0 ? '#555' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer'
          }} >
← Previous
</button>
<span style={{ color: 'white', alignSelf: 'center' }}>
{currentSlide + 1} / {totalSlides}
</span>
<button
onClick={handleNext}
disabled={currentSlide === totalSlides - 1}
style={{
            padding: '8px 16px',
            background: currentSlide === totalSlides - 1 ? '#555' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer'
          }} >
Next →
</button>
</div>

      {/* Editor in Presentation Mode */}
      <div ref={editorRef}>
        <SlideEditor
          content={presentationContent}
          editorMode="present"
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
        />
      </div>
    </div>

);
}

export default PresentModeTest;

// EXPECTED RESULT:
// - Only one slide visible at a time
// - Black background, centered slide
// - Arrow keys navigate between slides
// - Navigation buttons work
// - Slide counter shows current position
// - onSlideChange callback fires

// ---

// TEST 4: ReadOnly Prop
// File: demo/src/ReadOnlyTest.tsx

import React from 'react';
import { SlideEditor, DocNode } from 'autoartifacts';

const content: DocNode = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
content: [
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 1 },
content: [{ type: 'text', text: 'Read-Only Mode' }]
},
{
type: 'paragraph',
content: [
{ type: 'text', text: 'This content is ' },
{ type: 'text', text: 'read-only', marks: [{ type: 'bold' }] },
{ type: 'text', text: '. You cannot edit it.' }
]
}
]
}
]
}
]
}
]
};

function ReadOnlyTest() {
return (

<div style={{ padding: '20px' }}>
<h2>Read-Only Test</h2>
<p>Try clicking in the editor. You cannot edit the content.</p>
<SlideEditor 
        content={content}
        readOnly={true}
      />

      <hr style={{ margin: '40px 0' }} />

      <h2>Editable (for comparison)</h2>
      <p>This one you can edit:</p>
      <SlideEditor
        content={content}
        readOnly={false}
      />
    </div>

);
}

export default ReadOnlyTest;

// EXPECTED RESULT:
// - First editor: cannot edit, cursor is default
// - Second editor: can edit normally
// - Read-only class applied to first editor

// ---

// TEST 5: onSlideChange Callback
// File: demo/src/OnSlideChangeTest.tsx

import React, { useState } from 'react';
import { SlideEditor, DocNode } from 'autoartifacts';

const slides: DocNode = {
type: 'doc',
content: [
{ type: 'slide', content: [{ type: 'row', content: [{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Slide 1' }] }] }] }] },
{ type: 'slide', content: [{ type: 'row', content: [{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Slide 2' }] }] }] }] },
{ type: 'slide', content: [{ type: 'row', content: [{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Slide 3' }] }] }] }] }
]
};

function OnSlideChangeTest() {
const [currentSlide, setCurrentSlide] = useState(0);
const [changeLog, setChangeLog] = useState<string[]>([]);

const handleSlideChange = (index: number) => {
setCurrentSlide(index);
setChangeLog(prev => [...prev, `Navigated to slide ${index + 1} at ${new Date().toLocaleTimeString()}`]);
};

return (

<div style={{ padding: '20px' }}>
<h2>onSlideChange Callback Test</h2>

      <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Current Slide:</strong> {currentSlide + 1}
        <div style={{ marginTop: '10px' }}>
          <strong>Change Log:</strong>
          <ul style={{ maxHeight: '100px', overflow: 'auto', margin: '5px 0' }}>
            {changeLog.map((log, i) => (
              <li key={i} style={{ fontSize: '12px' }}>{log}</li>
            ))}
          </ul>
        </div>
      </div>

      <SlideEditor
        content={slides}
        editorMode="present"
        currentSlide={currentSlide}
        onSlideChange={handleSlideChange}
      />

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => handleSlideChange(0)}>Go to Slide 1</button>
        <button onClick={() => handleSlideChange(1)}>Go to Slide 2</button>
        <button onClick={() => handleSlideChange(2)}>Go to Slide 3</button>
      </div>
    </div>

);
}

export default OnSlideChangeTest;

// EXPECTED RESULT:
// - onSlideChange fires when navigating with arrow keys
// - onSlideChange fires when clicking buttons
// - Change log updates with each navigation
// - Current slide display updates

// ---

// TEST 6: onError Callback with Invalid JSON
// File: demo/src/OnErrorTest.tsx

import React, { useState } from 'react';
import { SlideEditor } from 'autoartifacts';

function OnErrorTest() {
const [error, setError] = useState<string | null>(null);
const [showEditor, setShowEditor] = useState(false);

// Invalid content - missing required fields
const invalidContent1 = {
type: 'doc',
content: [] // Empty content array - should fail validation
};

const invalidContent2 = {
type: 'doc',
content: [
{
type: 'slide',
// Missing content array - should fail validation
}
]
};

const invalidContent3 = {
type: 'paragraph', // Wrong root type - should be 'doc'
content: []
};

const validContent = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
content: [
{
type: 'column',
content: [
{
type: 'paragraph',
content: [{ type: 'text', text: 'Valid content!' }]
}
]
}
]
}
]
}
]
};

const [currentContent, setCurrentContent] = useState<any>(validContent);

const handleError = (err: Error) => {
setError(err.message);
console.error('Editor error:', err);
};

const testContent = (content: any, label: string) => {
setError(null);
setCurrentContent(content);
setShowEditor(false);
setTimeout(() => setShowEditor(true), 10);
};

return (

<div style={{ padding: '20px' }}>
<h2>onError Callback Test</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => testContent(invalidContent1, 'Empty content')}>
          Test: Empty Content
        </button>
        <button onClick={() => testContent(invalidContent2, 'Missing content array')}>
          Test: Missing Content Array
        </button>
        <button onClick={() => testContent(invalidContent3, 'Wrong root type')}>
          Test: Wrong Root Type
        </button>
        <button onClick={() => testContent(validContent, 'Valid content')}>
          Test: Valid Content
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          background: '#fee',
          border: '2px solid #f00',
          borderRadius: '4px',
          marginBottom: '20px',
          color: '#c00'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && showEditor && (
        <div style={{ border: '2px solid #0f0', padding: '10px' }}>
          <p style={{ color: '#060', fontWeight: 'bold' }}>✓ Valid content loaded</p>
          <SlideEditor
            content={currentContent}
            onError={handleError}
          />
        </div>
      )}

      {error && (
        <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '4px' }}>
          <p><strong>Validation prevented editor from loading.</strong></p>
          <p>The onError callback was triggered with the validation error.</p>
        </div>
      )}
    </div>

);
}

export default OnErrorTest;

// EXPECTED RESULT:
// - Invalid content triggers onError callback
// - Error message displays in red box
// - Editor does not render when validation fails
// - Valid content loads successfully
// - Console shows validation errors

// ---

// TEST 7: TypeScript Types - Autocomplete Test
// File: demo/src/TypeScriptTest.tsx

import React, { useState } from 'react';
import {
SlideEditor,
DocNode,
SlideNode,
RowNode,
ColumnNode,
ParagraphNode,
HeadingNode,
TextNode
} from 'autoartifacts';

function TypeScriptTest() {
// TypeScript should provide autocomplete for all these types
const heading: HeadingNode = {
type: 'heading',
attrs: {
level: 1 // TypeScript should only allow 1-6
},
content: [
{
type: 'text',
text: 'Typed Content'
}
]
};

const paragraph: ParagraphNode = {
type: 'paragraph',
content: [
{
type: 'text',
text: 'This is '
},
{
type: 'text',
text: 'bold text',
marks: [{ type: 'bold' }]
}
]
};

const column: ColumnNode = {
type: 'column',
attrs: {
verticalAlign: 'center', // TypeScript should only allow 'top' | 'center' | 'bottom'
horizontalAlign: 'left' // TypeScript should only allow 'left' | 'center' | 'right'
},
content: [heading, paragraph]
};

const row: RowNode = {
type: 'row',
attrs: {
layout: '1'
},
content: [column]
};

const slide: SlideNode = {
type: 'slide',
content: [row]
};

const doc: DocNode = {
type: 'doc',
content: [slide]
};

const [content, setContent] = useState<DocNode>(doc);

return (

<div style={{ padding: '20px' }}>
<h2>TypeScript Types Test</h2>
<p>This test verifies TypeScript autocomplete and type checking works.</p>
<p>Check the code - all types should have autocomplete in your IDE.</p>

      <SlideEditor
        content={content}
        onChange={(newContent) => {
          // TypeScript knows newContent is DocNode
          setContent(newContent);
        }}
        editorMode="edit" // TypeScript should only allow 'edit' | 'present' | 'preview'
        slideTheme="dark"  // TypeScript allows any string
        readOnly={false}   // TypeScript should only allow boolean
        currentSlide={0}   // TypeScript should only allow number
        onSlideChange={(index) => {
          // TypeScript knows index is number
          console.log('Slide changed to:', index);
        }}
        onError={(error) => {
          // TypeScript knows error is Error
          console.error(error.message);
        }}
      />
    </div>

);
}

export default TypeScriptTest;

// EXPECTED RESULT:
// - No TypeScript errors
// - Autocomplete works for all types
// - Invalid values show TypeScript errors
// - IDE provides type information on hover

// ---

// TEST 8: Validation - safeValidateContent
// File: demo/src/ValidationTest.tsx

import React, { useState } from 'react';
import { safeValidateContent } from 'autoartifacts';

function ValidationTest() {
const [jsonInput, setJsonInput] = useState('');
const [validationResult, setValidationResult] = useState<{
valid: boolean;
error?: string;
} | null>(null);

const handleValidate = () => {
try {
const parsed = JSON.parse(jsonInput);
const result = safeValidateContent(parsed);
setValidationResult(result);
} catch (error) {
setValidationResult({
valid: false,
error: 'Invalid JSON syntax'
});
}
};

const exampleValid = JSON.stringify({
type: 'doc',
content: [{
type: 'slide',
content: [{
type: 'row',
content: [{
type: 'column',
content: [{
type: 'paragraph',
content: [{ type: 'text', text: 'Hello' }]
}]
}]
}]
}]
}, null, 2);

const exampleInvalid = JSON.stringify({
type: 'doc',
content: []
}, null, 2);

return (

<div style={{ padding: '20px' }}>
<h2>Validation Test</h2>
<p>Test the safeValidateContent function:</p>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setJsonInput(exampleValid)}>
          Load Valid Example
        </button>
        <button onClick={() => setJsonInput(exampleInvalid)} style={{ marginLeft: '10px' }}>
          Load Invalid Example
        </button>
      </div>

      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        style={{
          width: '100%',
          height: '200px',
          fontFamily: 'monospace',
          fontSize: '12px',
          padding: '10px'
        }}
        placeholder="Paste JSON here..."
      />

      <button
        onClick={handleValidate}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Validate
      </button>

      {validationResult && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: validationResult.valid ? '#d4edda' : '#f8d7da',
          border: `2px solid ${validationResult.valid ? '#28a745' : '#dc3545'}`,
          borderRadius: '4px'
        }}>
          {validationResult.valid ? (
            <div style={{ color: '#155724' }}>
              <strong>✓ Valid Content</strong>
              <p>This JSON is valid and can be used with SlideEditor.</p>
            </div>
          ) : (
            <div style={{ color: '#721c24' }}>
              <strong>✗ Invalid Content</strong>
              <p><strong>Error:</strong> {validationResult.error}</p>
            </div>
          )}
        </div>
      )}
    </div>

);
}

export default ValidationTest;

// EXPECTED RESULT:
// - Valid JSON shows green success message
// - Invalid JSON shows red error message with details
// - safeValidateContent doesn't throw, returns result object
// - Can validate before passing to SlideEditor

// ================== IMPLEMENTATION CHECKLIST ==================

/\*
COMPLETE THESE STEPS IN ORDER:

PART 1: COMPONENT PROPS ✅

□ Step 1: Update SlideEditor interface ✅

- Add editorMode prop ✅
- Add readOnly prop ✅
- Add currentSlide prop ✅
- Add onSlideChange prop ✅
- Add onError prop ✅

□ Step 2: Implement editorMode functionality ✅

- Add editorMode parameter to component ✅
- Add readOnly parameter to component ✅
- Set editable based on mode and readOnly ✅
- Add mode-specific classes to editor ✅
- Add try-catch for error handling with onError ✅

□ Step 3: Create slide navigation utilities ✅

- Create src/utils/slideNavigation.ts ✅
- Implement getAllSlides function ✅
- Implement getSlideCount function ✅
- Implement showSlide function ✅
- Implement showAllSlides function ✅
- Implement getCurrentSlideIndex function ✅
- Implement nextSlide function ✅
- Implement prevSlide function ✅
- Implement goToSlide function ✅

□ Step 4: Integrate slide navigation ✅

- Import navigation functions in SlideEditor ✅
- Add useEffect for slide visibility based on mode ✅
- Add useEffect for keyboard navigation in present mode ✅
- Handle currentSlide prop changes ✅
- Call onSlideChange when slide changes ✅

□ Step 5: Add mode styles ✅

- Add CSS for .mode-edit ✅
- Add CSS for .mode-preview ✅
- Add CSS for .mode-present ✅
- Add CSS for .read-only ✅
- Add CSS for slide animations ✅

□ Step 6: Export navigation actions ✅

- Add navigation functions to src/actions/index.ts ✅
- Implement nextSlideAction ✅
- Implement prevSlideAction ✅
- Implement goToSlideAction ✅
- Implement getSlideCountAction ✅
- Implement getCurrentSlideAction ✅
- Update actions export object ✅

PART 2: VALIDATION & TYPES ✅

□ Step 7: Create validation utility ✅

- Create src/validation/index.ts ✅
- Create ValidationError class ✅
- Implement validateNodeStructure function ✅
- Implement validateDoc function ✅
- Implement validateSlide function ✅
- Implement validateRow function ✅
- Implement validateContent function ✅
- Implement safeValidateContent function ✅

□ Step 8: Integrate validation ✅

- Import validation in SlideEditor ✅
- Add validation call before creating editor ✅
- Handle ValidationError in try-catch ✅
- Call onError if validation fails ✅
- Prevent editor creation on validation failure ✅

□ Step 9: Create TypeScript types ✅

- Create src/types/index.ts ✅
- Define BaseNode, TextNode, Mark interfaces ✅
- Define DocNode, SlideNode, RowNode, ColumnNode interfaces ✅
- Define content node interfaces (Paragraph, Heading, Image, etc.) ✅
- Define mark interfaces (Bold, Italic, Link, etc.) ✅
- Define union types (BlockNode, InlineNode, ContentNode) ✅
- Define component types (SlideEditorProps, SlideEditorRef) ✅

□ Step 10: Export types ✅

- Update src/index.ts ✅
- Export validateContent and safeValidateContent ✅
- Export all type definitions ✅
- Verify no TypeScript errors ✅

TESTING:

□ Test editorMode="edit"

- Can edit content
- Changes save via onChange
- Full editing capabilities

□ Test editorMode="preview"

- All slides visible
- Cannot edit (read-only)
- No text cursor

□ Test editorMode="present"

- Only one slide visible
- Arrow keys navigate
- Black background, centered
- onSlideChange fires

□ Test readOnly prop

- readOnly=true prevents editing
- readOnly=false allows editing
- Works independently of editorMode

□ Test currentSlide prop

- Changing prop shows different slide
- Works in present mode
- Invalid index shows warning

□ Test onSlideChange callback

- Fires when navigating with keys
- Fires when using navigation actions
- Receives correct slide index

□ Test onError callback

- Fires for validation errors
- Fires for other errors
- Receives Error object
- Editor doesn't render on error

□ Test validation

- validateContent throws on invalid JSON
- safeValidateContent returns result object
- Validation catches structural errors
- Clear error messages

□ Test TypeScript types

- All types exported
- Autocomplete works in IDE
- Type errors show for invalid values
- Props have correct types

VERIFICATION:
After implementation, verify:
✓ All 5 component props work correctly
✓ editorMode switches behavior appropriately
✓ Presentation mode navigation works (keys + callbacks)
✓ readOnly prevents editing
✓ Validation catches invalid JSON
✓ onError callback fires appropriately
✓ TypeScript types provide autocomplete
✓ No TypeScript errors
✓ No runtime errors
✓ All tests pass
\*/

// ================== TROUBLESHOOTING GUIDE ==================

/\*
IF SOMETHING DOESN'T WORK:

ISSUE: editorMode doesn't change behavior
SOLUTION:

- Check that editable() function returns correct value
- Verify mode-specific classes are applied
- Check CSS for mode styles
- Inspect element to see actual classes

ISSUE: Presentation mode shows all slides
SOLUTION:

- Verify showSlide function is being called
- Check currentSlide prop value
- Inspect slide display styles
- Check useEffect dependencies

ISSUE: Arrow keys don't navigate in present mode
SOLUTION:

- Verify keyboard event listener is attached
- Check editorMode === 'present' condition
- Focus the editor/document first
- Check browser console for errors
- Verify navigation functions are imported

ISSUE: onSlideChange doesn't fire
SOLUTION:

- Check that callback is passed to SlideEditor
- Verify navigation functions call the callback
- Check browser console for errors
- Add console.log in navigation functions

ISSUE: Validation doesn't catch errors
SOLUTION:

- Check that validateContent is called before editor creation
- Verify validation logic is correct
- Test with known invalid JSON
- Check error handling in try-catch

ISSUE: onError doesn't fire
SOLUTION:

- Verify onError prop is passed
- Check try-catch blocks are in place
- Ensure errors are Error instances
- Check browser console

ISSUE: TypeScript types don't provide autocomplete
SOLUTION:

- Verify types are exported from index.ts
- Check import statements
- Restart TypeScript server in IDE
- Verify @types packages are installed

ISSUE: readOnly doesn't prevent editing
SOLUTION:

- Check editable() function logic
- Verify readOnly prop is being read
- Check that EditorView is created with editable option
- Inspect view.props.editable value
  \*/

// ================== USAGE EXAMPLES ==================

// EXAMPLE 1: Simple Presentation Mode
/\*
import { SlideEditor } from
'autoartifacts';
import { useState } from 'react';

function SimplePresentationMode() {
const [currentSlide, setCurrentSlide] = useState(0);

return (
<SlideEditor 
      content={myContent}
      editorMode="present"
      currentSlide={currentSlide}
      onSlideChange={setCurrentSlide}
    />
);
}
\*/

// EXAMPLE 2: Custom Navigation Controls
/\*
import { SlideEditor, actions } from 'autoartifacts';
import { useState, useRef } from 'react';

function CustomNavigationControls() {
const [currentSlide, setCurrentSlide] = useState(0);
const editorRef = useRef<HTMLDivElement>(null);

const handleNext = () => {
if (editorRef.current) {
actions.nextSlide(editorRef.current, setCurrentSlide);
}
};

const handlePrev = () => {
if (editorRef.current) {
actions.prevSlide(editorRef.current, setCurrentSlide);
}
};

const totalSlides = editorRef.current
? actions.getSlideCount(editorRef.current)
: 0;

return (

<div>
<div className="controls">
<button onClick={handlePrev}>Previous</button>
<span>{currentSlide + 1} / {totalSlides}</span>
<button onClick={handleNext}>Next</button>
</div>
<div ref={editorRef}>
<SlideEditor 
          content={myContent}
          editorMode="present"
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
        />
</div>
</div>
);
}
\*/

// EXAMPLE 3: Read-Only Preview
/\*
import { SlideEditor } from 'autoartifacts';

function ReadOnlyPreview({ content }) {
return (
<SlideEditor 
      content={content}
      readOnly={true}
      editorMode="preview"
    />
);
}
\*/

// EXAMPLE 4: Error Handling
/\*
import { SlideEditor } from 'autoartifacts';
import { useState } from 'react';

function EditorWithErrorHandling() {
const [error, setError] = useState<string | null>(null);

const handleError = (err: Error) => {
setError(err.message);
console.error('Editor error:', err);
// Could also send to error tracking service
};

return (

<div>
{error && (
<div className="error-banner">
Error: {error}
</div>
)}
<SlideEditor 
        content={potentiallyInvalidContent}
        onError={handleError}
      />
</div>
);
}
\*/

// EXAMPLE 5: Content Validation Before Rendering
/\*
import { SlideEditor, safeValidateContent } from 'autoartifacts';
import { useState, useEffect } from 'react';

function ValidatedEditor({ content }) {
const [validContent, setValidContent] = useState(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
const result = safeValidateContent(content);
if (result.valid) {
setValidContent(content);
setError(null);
} else {
setError(result.error || 'Invalid content');
setValidContent(null);
}
}, [content]);

if (error) {
return <div className="error">Cannot load editor: {error}</div>;
}

if (!validContent) {
return <div>Loading...</div>;
}

return <SlideEditor content={validContent} />;
}
\*/

// EXAMPLE 6: TypeScript with Full Type Safety
/\*
import {
SlideEditor,
DocNode,
SlideNode,
RowNode,
ColumnNode,
ParagraphNode,
HeadingNode
} from 'autoartifacts';
import { useState } from 'react';

function TypeSafeEditor() {
// TypeScript knows the exact structure
const initialContent: DocNode = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
attrs: {
layout: '1'
},
content: [
{
type: 'column',
attrs: {
verticalAlign: 'center',
horizontalAlign: 'center'
},
content: [
{
type: 'heading',
attrs: {
level: 1
},
content: [
{ type: 'text', text: 'Type-safe content' }
]
}
]
}
]
}
]
}
]
};

const [content, setContent] = useState<DocNode>(initialContent);

// onChange provides typed content
const handleChange = (newContent: DocNode) => {
// TypeScript knows the structure
console.log('Slides:', newContent.content.length);
setContent(newContent);
};

return (
<SlideEditor 
      content={content}
      onChange={handleChange}
      editorMode="edit"
    />
);
}
\*/

// EXAMPLE 7: Presentation with Slide Progress Tracking
/\*
import { SlideEditor, DocNode } from 'autoartifacts';
import { useState, useEffect } from 'react';

function PresentationWithProgress({ content }: { content: DocNode }) {
const [currentSlide, setCurrentSlide] = useState(0);
const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set([0]));

const totalSlides = content.content.length;
const progress = (viewedSlides.size / totalSlides) \* 100;

const handleSlideChange = (index: number) => {
setCurrentSlide(index);
setViewedSlides(prev => new Set([...prev, index]));
};

return (

<div>
<div className="progress-bar" style={{ width: '100%', height: '4px', background: '#ddd' }}>
<div style={{ width: `${progress}%`, height: '100%', background: '#007bff' }} />
</div>

      <SlideEditor
        content={content}
        editorMode="present"
        currentSlide={currentSlide}
        onSlideChange={handleSlideChange}
      />

      <div className="stats">
        Viewed: {viewedSlides.size} / {totalSlides} slides
      </div>
    </div>

);
}
\*/

// ================== API REFERENCE ==================

/\*
COMPONENT PROPS REFERENCE:

## SlideEditor Props:

content: DocNode (required)

- The ProseMirror JSON content to display
- Must be valid according to schema

onChange?: (content: DocNode) => void

- Called when content changes in edit mode
- Receives updated JSON content

editorTheme?: 'light' | 'dark' | 'presentation' | string

- Visual theme for the editor wrapper
- Default: 'light'

editorStyles?: string

- Additional CSS class names for the editor wrapper
- Can use Tailwind or custom classes

slideTheme?: string

- Theme applied to all slides
- Built-in: 'default', 'dark', 'minimal', 'gradient'
- Can use custom theme names
- Default: 'default'

editorMode?: 'edit' | 'present' | 'preview'

- Determines editor behavior
- 'edit': Full editing (default)
- 'present': Presentation mode, one slide at a time
- 'preview': Read-only, all slides visible
- Default: 'edit'

readOnly?: boolean

- If true, editor is read-only (no editing)
- Works with any editorMode
- Default: false

currentSlide?: number

- Zero-based index of active slide (in present mode)
- Changes which slide is displayed
- Default: 0

onSlideChange?: (slideIndex: number) => void

- Called when active slide changes (in present mode)
- Receives zero-based slide index
- Fired by arrow keys or navigation actions

onError?: (error: Error) => void

- Called when errors occur
- Receives Error object
- Useful for error logging/reporting

## NAVIGATION ACTIONS REFERENCE:

actions.nextSlide(editorElement: HTMLElement, onSlideChange?: Function)

- Navigate to next slide in presentation mode
- Does nothing if already on last slide

actions.prevSlide(editorElement: HTMLElement, onSlideChange?: Function)

- Navigate to previous slide in presentation mode
- Does nothing if already on first slide

actions.goToSlide(editorElement: HTMLElement, index: number, onSlideChange?: Function)

- Jump to specific slide by index (zero-based)
- Logs warning if index is out of bounds

actions.getSlideCount(editorElement: HTMLElement): number

- Returns total number of slides in document

actions.getCurrentSlide(editorElement: HTMLElement): number

- Returns current slide index (zero-based)
- Returns 0 if not in presentation mode

## VALIDATION FUNCTIONS:

validateContent(content: any): boolean

- Validates content structure
- Throws ValidationError if invalid
- Returns true if valid

safeValidateContent(content: any): { valid: boolean; error?: string }

- Safe validation that doesn't throw
- Returns object with valid flag and optional error message
- Use this for validation before rendering

## TYPESCRIPT TYPES:

All content node types:

- DocNode
- SlideNode
- RowNode
- ColumnNode
- ParagraphNode
- HeadingNode
- ImageNode
- VideoNode
- BulletListNode
- OrderedListNode
- ListItemNode

Union types:

- BlockNode (any block-level node)
- InlineNode (any inline node)
- ContentNode (any content node)

Mark types:

- BoldMark
- ItalicMark
- LinkMark
- UnderlineMark
- StrikethroughMark
- CodeMark
- TextColorMark
- HighlightMark

Component types:

- SlideEditorProps
- SlideEditorRef
  \*/

// ================== KEYBOARD SHORTCUTS ==================

/\*
PRESENTATION MODE SHORTCUTS:

Arrow Right / Arrow Down / Space: Next slide
Arrow Left / Arrow Up: Previous slide
Home: First slide
End: Last slide

EDIT MODE SHORTCUTS (from Actions API):

Cmd/Ctrl + Z: Undo
Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z: Redo
Cmd/Ctrl + B: Bold
Cmd/Ctrl + I: Italic
\*/

// ================== FINAL NOTES ==================

/\*
IMPLEMENTATION COMPLETE WHEN:

✓ All 5 component props work correctly
✓ editorMode switches between edit/present/preview
✓ Presentation mode navigation works with keyboard and actions
✓ readOnly prevents editing in any mode
✓ currentSlide prop controls visible slide
✓ onSlideChange callback fires on navigation
✓ onError callback fires on validation/runtime errors
✓ Validation catches invalid JSON before rendering
✓ safeValidateContent provides non-throwing validation
✓ All TypeScript types exported
✓ Types provide autocomplete in IDEs
✓ No TypeScript errors
✓ No runtime errors
✓ All tests pass

MVP IS NOW COMPLETE!

This implementation finishes all MVP features:

1. ✓ Schema and nodes
2. ✓ Content nodes (image, video, lists)
3. ✓ Marks (bold, italic, link, etc.)
4. ✓ Layout system
5. ✓ SlideTheme prop
6. ✓ Actions API
7. ✓ Component props (editorMode, readOnly, currentSlide, onSlideChange, onError)
8. ✓ Validation
9. ✓ TypeScript types

WHAT'S NEXT (POST-MVP):

- More content nodes (code blocks, tables, callouts, etc.)
- More layout options
- Export functionality (PDF, images)
- Import functionality (Markdown, HTML)
- Collaboration (Yjs integration)
- Advanced theming system
- Animation/transitions
- Presenter mode with notes
- Slide thumbnails component
- Templates/presets

The foundation is solid and ready for these enhancements!
\*/
