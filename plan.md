// ============================================
// ACTIONS API IMPLEMENTATION - COMPLETE GUIDE
// ============================================

/\*
OVERVIEW:

---

The Actions API allows developers to programmatically interact with the editor
and build custom toolbars, keyboard shortcuts, and controls.

WHY THIS IS CRITICAL:

- Makes AutoArtifacts easy to use (BlockNote-style simplicity)
- Developers can build toolbars without understanding ProseMirror internals
- Provides standard editor commands (undo, redo, formatting)
- Enables custom UI implementations

WHAT WE'RE BUILDING:

1. Core actions (undo, redo)
2. Mark toggling actions (bold, italic, link)
3. Expose EditorView via ref so actions can be called
4. Clean, simple API that developers can import and use

ARCHITECTURE:

- Actions are functions that take an EditorView and perform operations
- EditorView is exposed via React ref from SlideEditor
- Developers import actions and call them with the editor instance
- Each action is self-contained and well-documented

USAGE EXAMPLE:
import { SlideEditor, actions } from 'autoartifacts';

function MyToolbar() {
const editorRef = useRef();

return (

<div>
<button onClick={() => actions.undo(editorRef.current)}>Undo</button>
<button onClick={() => actions.redo(editorRef.current)}>Redo</button>
<button onClick={() => actions.bold(editorRef.current)}>Bold</button>
<SlideEditor ref={editorRef} content={content} />
</div>
);
}
\*/

// ================== STEP 1: INSTALL REQUIRED DEPENDENCIES ==================

/\*
We need additional ProseMirror packages for commands and history:

Run these commands in your terminal:
npm install prosemirror-commands prosemirror-history prosemirror-keymap

These packages provide:

- prosemirror-commands: Basic editing commands
- prosemirror-history: Undo/redo functionality
- prosemirror-keymap: Keyboard shortcut handling (needed for history)
  \*/

// ================== STEP 2: CREATE ACTIONS UTILITY ==================

// File: src/actions/index.ts (CREATE THIS NEW FILE)

/\*\*

- Actions API for AutoArtifacts
-
- Provides simple, declarative commands for interacting with the editor.
- Each action takes an EditorView instance and performs an operation.
-
- Usage:
- import { actions } from 'autoartifacts';
- actions.bold(editorView);
  \*/

import { EditorView } from 'prosemirror-view';
import { EditorState, Transaction } from 'prosemirror-state';
import { undo, redo } from 'prosemirror-history';
import { toggleMark } from 'prosemirror-commands';
import { MarkType } from 'prosemirror-model';

/\*\*

- Helper function to check if a mark is active in current selection
  \*/
  function isMarkActive(state: EditorState, markType: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;

if (empty) {
// If selection is empty, check stored marks or marks at cursor position
return !!markType.isInSet(state.storedMarks || $from.marks());
}

// If selection has content, check if mark exists anywhere in selection
return state.doc.rangeHasMark(from, to, markType);
}

/\*\*

- Undo the last change
-
- @param view - The ProseMirror EditorView instance
- @returns true if undo was successful, false if nothing to undo
-
- @example
- actions.undo(editorView);
  \*/
  export function undoAction(view: EditorView | null): boolean {
  if (!view) {
  console.warn('[AutoArtifacts] Cannot undo: editor view is null');
  return false;
  }

return undo(view.state, view.dispatch);
}

/\*\*

- Redo the last undone change
-
- @param view - The ProseMirror EditorView instance
- @returns true if redo was successful, false if nothing to redo
-
- @example
- actions.redo(editorView);
  \*/
  export function redoAction(view: EditorView | null): boolean {
  if (!view) {
  console.warn('[AutoArtifacts] Cannot redo: editor view is null');
  return false;
  }

return redo(view.state, view.dispatch);
}

/\*\*

- Toggle bold mark on current selection
- If text is already bold, removes bold. If not bold, makes it bold.
-
- @param view - The ProseMirror EditorView instance
- @returns true if action was successful
-
- @example
- actions.bold(editorView);
  \*/
  export function boldAction(view: EditorView | null): boolean {
  if (!view) {
  console.warn('[AutoArtifacts] Cannot toggle bold: editor view is null');
  return false;
  }

const markType = view.state.schema.marks.bold;
if (!markType) {
console.warn('[AutoArtifacts] Bold mark type not found in schema');
return false;
}

const command = toggleMark(markType);
return command(view.state, view.dispatch);
}

/\*\*

- Toggle italic mark on current selection
- If text is already italic, removes italic. If not italic, makes it italic.
-
- @param view - The ProseMirror EditorView instance
- @returns true if action was successful
-
- @example
- actions.italic(editorView);
  \*/
  export function italicAction(view: EditorView | null): boolean {
  if (!view) {
  console.warn('[AutoArtifacts] Cannot toggle italic: editor view is null');
  return false;
  }

const markType = view.state.schema.marks.italic;
if (!markType) {
console.warn('[AutoArtifacts] Italic mark type not found in schema');
return false;
}

const command = toggleMark(markType);
return command(view.state, view.dispatch);
}

/\*\*

- Add or update a link on the current selection
- If selection already has a link, updates the href. Otherwise, adds new link.
-
- @param view - The ProseMirror EditorView instance
- @param href - The URL for the link
- @param title - Optional title attribute for the link
- @returns true if action was successful
-
- @example
- // Add link to selected text
- actions.addLink(editorView, 'https://example.com');
-
- // Add link with title
- actions.addLink(editorView, 'https://example.com', 'Example Site');
  \*/
  export function addLinkAction(
  view: EditorView | null,
  href: string,
  title?: string
  ): boolean {
  if (!view) {
  console.warn('[AutoArtifacts] Cannot add link: editor view is null');
  return false;
  }

if (!href) {
console.warn('[AutoArtifacts] Cannot add link: href is required');
return false;
}

const { state, dispatch } = view;
const { selection } = state;
const markType = state.schema.marks.link;

if (!markType) {
console.warn('[AutoArtifacts] Link mark type not found in schema');
return false;
}

// If nothing is selected, can't add a link
if (selection.empty) {
console.warn('[AutoArtifacts] Cannot add link: no text selected');
return false;
}

// Create the link mark with attributes
const attrs = {
href,
title: title || null,
target: '\_blank'
};

// Add the link mark to the selection
const tr = state.tr.addMark(
selection.from,
selection.to,
markType.create(attrs)
);

dispatch(tr);
return true;
}

/\*\*

- Remove link from current selection
-
- @param view - The ProseMirror EditorView instance
- @returns true if action was successful
-
- @example
- actions.removeLink(editorView);
  \*/
  export function removeLinkAction(view: EditorView | null): boolean {
  if (!view) {
  console.warn('[AutoArtifacts] Cannot remove link: editor view is null');
  return false;
  }

const { state, dispatch } = view;
const { selection } = state;
const markType = state.schema.marks.link;

if (!markType) {
console.warn('[AutoArtifacts] Link mark type not found in schema');
return false;
}

// Remove the link mark from the selection
const tr = state.tr.removeMark(
selection.from,
selection.to,
markType
);

dispatch(tr);
return true;
}

/\*\*

- Check if bold is active in current selection
-
- @param view - The ProseMirror EditorView instance
- @returns true if bold is active
  \*/
  export function isBoldActive(view: EditorView | null): boolean {
  if (!view) return false;
  const markType = view.state.schema.marks.bold;
  if (!markType) return false;
  return isMarkActive(view.state, markType);
  }

/\*\*

- Check if italic is active in current selection
-
- @param view - The ProseMirror EditorView instance
- @returns true if italic is active
  \*/
  export function isItalicActive(view: EditorView | null): boolean {
  if (!view) return false;
  const markType = view.state.schema.marks.italic;
  if (!markType) return false;
  return isMarkActive(view.state, markType);
  }

/\*\*

- Check if link is active in current selection
-
- @param view - The ProseMirror EditorView instance
- @returns true if link is active
  \*/
  export function isLinkActive(view: EditorView | null): boolean {
  if (!view) return false;
  const markType = view.state.schema.marks.link;
  if (!markType) return false;
  return isMarkActive(view.state, markType);
  }

/\*\*

- Get the href of the link at current selection (if any)
-
- @param view - The ProseMirror EditorView instance
- @returns href string if link is active, null otherwise
  \*/
  export function getLinkHref(view: EditorView | null): string | null {
  if (!view) return null;

const { state } = view;
const { from, to } = state.selection;
const markType = state.schema.marks.link;

if (!markType) return null;

let href: string | null = null;

state.doc.nodesBetween(from, to, (node) => {
if (href) return false; // Already found, stop searching

    const linkMark = markType.isInSet(node.marks);
    if (linkMark) {
      href = linkMark.attrs.href;
      return false;
    }

});

return href;
}

// Export all actions as a single object for convenience
export const actions = {
undo: undoAction,
redo: redoAction,
bold: boldAction,
italic: italicAction,
addLink: addLinkAction,
removeLink: removeLinkAction,
isBoldActive,
isItalicActive,
isLinkActive,
getLinkHref
};

// ================== STEP 3: ADD HISTORY PLUGIN TO EDITOR ==================

// File: src/components/SlideEditor.tsx

// ADD THESE IMPORTS at the top:
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { forwardRef, useImperativeHandle } from 'react';

// UPDATE THE INTERFACE to support ref:
interface SlideEditorProps {
content: any;
onChange?: (json: any) => void;
editorTheme?: 'light' | 'dark' | 'presentation' | string;
editorStyles?: string;
slideTheme?: string;
}

// ADD THIS TYPE for the ref:
export interface SlideEditorRef {
view: EditorView | null;
}

// UPDATE THE COMPONENT to use forwardRef and expose EditorView:
export const SlideEditor = forwardRef<SlideEditorRef, SlideEditorProps>(
({
content,
onChange,
editorTheme = 'light',
editorStyles = '',
slideTheme = 'default'
}, ref) => {
const editorRef = useRef<HTMLDivElement>(null);
const viewRef = useRef<EditorView | null>(null);

    // Expose the EditorView via ref
    useImperativeHandle(ref, () => ({
      view: viewRef.current
    }));

    useEffect(() => {
      if (!editorRef.current) return;

      // ADD PLUGINS including history
      const plugins = [
        history(), // Enables undo/redo
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
        plugins // ADD THIS LINE
      });

      const view = new EditorView(editorRef.current, {
        state,
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
    }, []);

    // Re-apply layouts when content changes
    useEffect(() => {
      if (!editorRef.current || !viewRef.current) return;

      setTimeout(() => {
        if (editorRef.current) {
          applyAllLayouts(editorRef.current);
        }
      }, 0);
    }, [content]);

    const editorClassName = `autoartifacts-editor theme-${editorTheme} slide-theme-${slideTheme} ${editorStyles}`.trim();

    return (
      <div
        ref={editorRef}
        className={editorClassName}
      />
    );

}
);

SlideEditor.displayName = 'SlideEditor';

// ================== STEP 4: UPDATE MAIN EXPORTS ==================

// File: src/index.ts

// UPDATE to export actions:
export { SlideEditor } from './components/SlideEditor';
export type { SlideEditorRef } from './components/SlideEditor';
export { schema } from './schema';
export { actions } from './actions'; // ADD THIS LINE

// ================== COMPREHENSIVE TESTS ==================

/_
After implementation, test with these examples in your demo app
_/

// TEST 1: Basic Toolbar with Undo/Redo
// File: demo/src/ToolbarDemo.tsx (CREATE THIS FILE)

import React, { useRef, useState } from 'react';
import { SlideEditor, actions, SlideEditorRef } from 'autoartifacts';

const sampleContent = {
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
{ type: 'text', text: 'Select this text and try the toolbar buttons above!' }
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

function ToolbarDemo() {
const editorRef = useRef<SlideEditorRef>(null);
const [content, setContent] = useState(sampleContent);

const handleUndo = () => {
if (editorRef.current?.view) {
actions.undo(editorRef.current.view);
}
};

const handleRedo = () => {
if (editorRef.current?.view) {
actions.redo(editorRef.current.view);
}
};

const handleBold = () => {
if (editorRef.current?.view) {
actions.bold(editorRef.current.view);
}
};

const handleItalic = () => {
if (editorRef.current?.view) {
actions.italic(editorRef.current.view);
}
};

const handleAddLink = () => {
const url = prompt('Enter URL:');
if (url && editorRef.current?.view) {
actions.addLink(editorRef.current.view, url);
}
};

return (

<div style={{ padding: '20px' }}>
<div style={{
        marginBottom: '10px',
        padding: '10px',
        background: '#f5f5f5',
        borderRadius: '4px',
        display: 'flex',
        gap: '8px'
      }}>
<button onClick={handleUndo}>↶ Undo</button>
<button onClick={handleRedo}>↷ Redo</button>
<span style={{ margin: '0 8px' }}>|</span>
<button onClick={handleBold}>
<strong>B</strong>
</button>
<button onClick={handleItalic}>
<em>I</em>
</button>
<button onClick={handleAddLink}>🔗 Link</button>
</div>

      <SlideEditor
        ref={editorRef}
        content={content}
        onChange={setContent}
        slideTheme="default"
      />
    </div>

);
}

export default ToolbarDemo;

// EXPECTED RESULT:
// - Clicking Undo/Redo buttons works
// - Cmd/Ctrl+Z for undo works
// - Cmd/Ctrl+Y or Cmd/Ctrl+Shift+Z for redo works
// - Bold button toggles bold on selected text
// - Italic button toggles italic on selected text
// - Link button prompts for URL and adds link to selected text

// ---

// TEST 2: Advanced Toolbar with Active State
// File: demo/src/AdvancedToolbar.tsx (CREATE THIS FILE)

import React, { useRef, useState, useEffect } from 'react';
import { SlideEditor, actions, SlideEditorRef } from 'autoartifacts';

const sampleContent = {
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
content: [{ type: 'text', text: 'Advanced Toolbar Demo' }]
},
{
type: 'paragraph',
content: [
{ type: 'text', text: 'Try selecting text and watch the toolbar buttons highlight! ' },
{
type: 'text',
text: 'This text is bold',
marks: [{ type: 'bold' }]
},
{ type: 'text', text: ' and ' },
{
type: 'text',
text: 'this is italic',
marks: [{ type: 'italic' }]
},
{ type: 'text', text: ' and ' },
{
type: 'text',
text: 'this is a link',
marks: [{ type: 'link', attrs: { href: 'https://example.com' } }]
},
{ type: 'text', text: '.' }
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

function AdvancedToolbar() {
const editorRef = useRef<SlideEditorRef>(null);
const [content, setContent] = useState(sampleContent);
const [isBold, setIsBold] = useState(false);
const [isItalic, setIsItalic] = useState(false);
const [isLink, setIsLink] = useState(false);
const [linkHref, setLinkHref] = useState<string | null>(null);

// Update toolbar state based on selection
const updateToolbarState = () => {
if (editorRef.current?.view) {
setIsBold(actions.isBoldActive(editorRef.current.view));
setIsItalic(actions.isItalicActive(editorRef.current.view));
setIsLink(actions.isLinkActive(editorRef.current.view));
setLinkHref(actions.getLinkHref(editorRef.current.view));
}
};

// Update toolbar state when editor changes
useEffect(() => {
const interval = setInterval(updateToolbarState, 100);
return () => clearInterval(interval);
}, []);

const handleBold = () => {
if (editorRef.current?.view) {
actions.bold(editorRef.current.view);
updateToolbarState();
}
};

const handleItalic = () => {
if (editorRef.current?.view) {
actions.italic(editorRef.current.view);
updateToolbarState();
}
};

const handleLink = () => {
if (!editorRef.current?.view) return;

    if (isLink) {
      // Remove link
      actions.removeLink(editorRef.current.view);
    } else {
      // Add link
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        actions.addLink(editorRef.current.view, url);
      }
    }
    updateToolbarState();

};

const buttonStyle = (active: boolean) => ({
padding: '8px 12px',
background: active ? '#007bff' : '#f8f9fa',
color: active ? 'white' : 'black',
border: '1px solid #dee2e6',
borderRadius: '4px',
cursor: 'pointer',
fontWeight: active ? 'bold' : 'normal'
});

return (

<div style={{ padding: '20px' }}>
<div style={{
        marginBottom: '10px',
        padding: '10px',
        background: '#f5f5f5',
        borderRadius: '4px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
<button
onClick={() => editorRef.current?.view && actions.undo(editorRef.current.view)}
style={buttonStyle(false)} >
↶ Undo
</button>
<button
onClick={() => editorRef.current?.view && actions.redo(editorRef.current.view)}
style={buttonStyle(false)} >
↷ Redo
</button>

        <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>

        <button onClick={handleBold} style={buttonStyle(isBold)}>
          <strong>B</strong>
        </button>
        <button onClick={handleItalic} style={buttonStyle(isItalic)}>
          <em>I</em>
        </button>
        <button onClick={handleLink} style={buttonStyle(isLink)}>
          🔗 {isLink ? 'Unlink' : 'Link'}
        </button>

        {isLink && linkHref && (
          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
            ({linkHref})
          </span>
        )}
      </div>

      <SlideEditor
        ref={editorRef}
        content={content}
        onChange={setContent}
        slideTheme="default"
      />
    </div>

);
}

export default AdvancedToolbar;

// EXPECTED RESULT:
// - Bold button highlights when cursor is in bold text
// - Italic button highlights when cursor is in italic text
// - Link button highlights when cursor is in a link
// - Link href shows in toolbar when link is active
// - All formatting works correctly

// ---

// TEST 3: Keyboard Shortcuts
// This test doesn't need new code, just verify keyboard shortcuts work

// EXPECTED BEHAVIOR:
// - Cmd/Ctrl+Z undoes last change
// - Cmd/Ctrl+Y or Cmd/Ctrl+Shift+Z redoes last undone change
// - Changes are tracked in history
// - Undo/redo works across multiple changes

// TO TEST:
// 1. Type some text
// 2. Press Cmd/Ctrl+Z - text should disappear
// 3. Press Cmd/Ctrl+Y - text should reappear
// 4. Make multiple edits
// 5. Press Cmd/Ctrl+Z multiple times - should undo each edit in reverse order

// ---

// TEST 4: Actions with No Selection
// File: demo/src/NoSelectionTest.tsx

import React, { useRef } from 'react';
import { SlideEditor, actions, SlideEditorRef } from 'autoartifacts';

const emptyContent = {
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
content: [{ type: 'text', text: 'Click the link button without selecting text' }]
}
]
}
]
}
]
}
]
};

function NoSelectionTest() {
const editorRef = useRef<SlideEditorRef>(null);

const handleAddLink = () => {
if (editorRef.current?.view) {
const result = actions.addLink(editorRef.current.view, 'https://example.com');
if (!result) {
alert('Cannot add link: no text selected (this is expected)');
}
}
};

return (

<div style={{ padding: '20px' }}>
<button onClick={handleAddLink}>Try to Add Link (without selection)</button>
<SlideEditor ref={editorRef} content={emptyContent} />
</div>
);
}

// EXPECTED RESULT:
// - Console warning: "Cannot add link: no text selected"
// - Alert shows explaining no text was selected
// - Editor does not error or break

// ---

// TEST 5: Multiple Marks on Same Text
// File: demo/src/MultipleMarksTest.tsx

import React, { useRef, useState } from 'react';
import { SlideEditor, actions, SlideEditorRef } from 'autoartifacts';

const testContent = {
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
{ type: 'text', text: 'Select this text and apply multiple formats' }
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

function MultipleMarksTest() {
const editorRef = useRef<SlideEditorRef>(null);
const [content, setContent] = useState(testContent);

return (

<div style={{ padding: '20px' }}>
<div style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
<button onClick={() => editorRef.current?.view && actions.bold(editorRef.current.view)}>
Bold
</button>
<button onClick={() => editorRef.current?.view && actions.italic(editorRef.current.view)}>
Italic
</button>
<button onClick={() => {
const url = prompt('URL:');
if (url && editorRef.current?.view) {
actions.addLink(editorRef.current.view, url);
}
}}>
Link
</button>
</div>
<p style={{ fontSize: '14px', color: '#666' }}>
Test: Select text, make it bold, then italic, then add a link. All should work together.
</p>
<SlideEditor ref={editorRef} content={content} onChange={setContent} />
</div>
);
}

// EXPECTED RESULT:
// - Can apply bold to selected text
// - Can then apply italic to same text (now bold + italic)
// - Can then add link to same text (now bold + italic + link)
// - All three marks work together
// - Can remove any mark individually

// ================== IMPLEMENTATION CHECKLIST ==================

/\*
COMPLETE THESE STEPS IN ORDER:

□ Step 1: Install dependencies

- Run: npm install prosemirror-commands prosemirror-history prosemirror-keymap
- Verify no installation errors

□ Step 2: Create actions utility

- Create src/actions/index.ts
- Implement undoAction function
- Implement redoAction function
- Implement boldAction function
- Implement italicAction function
- Implement addLinkAction function
- Implement removeLinkAction function
- Implement isBoldActive function
- Implement isItalicActive function
- Implement isLinkActive function
- Implement getLinkHref function
- Export actions object with all functions

□ Step 3: Update SlideEditor component

- Add imports for history, keymap, commands
- Add forwardRef wrapper
- Create SlideEditorRef type
- Add useImperativeHandle to expose view
- Add plugins array with history and keymap
- Pass plugins to EditorState.create
- Add displayName to component

□ Step 4: Update main exports

- Export SlideEditorRef type from index.ts
- Export actions from index.ts

□ Step 5: Create test demos

- Create demo/src/ToolbarDemo.tsx
- Create demo/src/AdvancedToolbar.tsx
- Create demo/src/NoSelectionTest.tsx
- Create demo/src/MultipleMarksTest.tsx
- Import and render in demo/src/App.tsx

□ Step 6: Test all functionality

- Test undo/redo with buttons
- Test undo/redo with keyboard (Cmd/Ctrl+Z, Cmd/Ctrl+Y)
- Test bold toggle
- Test italic toggle
- Test add link
- Test remove link
- Test multiple marks on same text
- Test actions with no selection (should warn)
- Test active state detection (isBoldActive, etc.)
- Test getLinkHref function
- Verify console warnings appear appropriately
- Verify no unexpected errors

VERIFICATION:
After implementation, verify:
✓ All actions are exported from autoartifacts
✓ SlideEditor exposes view via ref
✓ Undo/redo work via both buttons and keyboard
✓ Bold/italic toggle correctly
✓ Links can be added and removed
✓ Multiple marks work together
✓ Active state detection works
✓ Console warnings appear for invalid operations
✓ No TypeScript errors
✓ No runtime errors
\*/

// ================== TROUBLESHOOTING GUIDE ==================

/\*
IF SOMETHING DOESN'T WORK:

ISSUE: "Cannot find module 'prosemirror-history'" or similar
SOLUTION:

- Verify you ran npm install for all three packages
- Check package.json has prosemirror-history, prosemirror-commands, prosemirror-keymap
- Try deleting node_modules and package-lock.json, then npm install again
- Restart your dev server

ISSUE: Undo/redo doesn't work
SOLUTION:

- Verify history() plugin is in the plugins array
- Check that plugins array is passed to EditorState.create
- Verify keymap is set up with undo/redo shortcuts
- Check browser console for errors
- Try clicking in the editor to focus it first

ISSUE: "Cannot read property 'view' of null" when clicking toolbar buttons
SOLUTION:

- Verify ref is being passed to SlideEditor: <SlideEditor ref={editorRef} />
- Check that useRef has correct type: useRef<SlideEditorRef>(null)
- Ensure forwardRef is wrapping the component correctly
- Verify useImperativeHandle is exposing the view

ISSUE: Bold/italic buttons do nothing
SOLUTION:

- Check that marks are defined in schema (bold, italic)
- Verify text is selected before clicking button
- Check console for warnings about missing mark types
- Inspect the transaction in browser devtools

ISSUE: addLink doesn't work
SOLUTION:

- Verify text is selected (link needs selection)
- Check that href parameter is being passed
- Verify link mark is in schema
- Check console for "no text selected" warning

ISSUE: Active state (isBoldActive) always returns false
SOLUTION:

- Verify the selection has the mark
- Check that isMarkActive helper function is working
- Try selecting text that definitely has the mark
- Check browser console for errors

ISSUE: Keyboard shortcuts don't work
SOLUTION:

- Verify keymap plugin is in plugins array
- Check that editor has focus (click in it first)
- Try different keyboard combinations (Cmd on Mac, Ctrl on Windows)
- Check browser console for errors
- Verify baseKeymap is imported and added

ISSUE: Actions cause editor to crash
SOLUTION:

- Check that view is not null before calling actions
- Verify transaction is being dispatched correctly
- Check browser console for specific error message
- Try wrapping action calls in try-catch for debugging

ISSUE: TypeScript errors about types
SOLUTION:

- Verify SlideEditorRef type is exported
- Check that EditorView is imported from prosemirror-view
- Verify forwardRef has correct type parameters
- Make sure all ProseMirror types are installed (@types packages)
  \*/

// ================== USAGE EXAMPLES FOR DOCUMENTATION ==================

/_
These examples show developers how to use the Actions API
_/

// EXAMPLE 1: Simple Toolbar
/\*
import { useRef } from 'react';
import { SlideEditor, actions, SlideEditorRef } from 'autoartifacts';

function MyEditor() {
const editorRef = useRef<SlideEditorRef>(null);

return (

<div>
<div className="toolbar">
<button onClick={() => actions.undo(editorRef.current?.view)}>
Undo
</button>
<button onClick={() => actions.redo(editorRef.current?.view)}>
Redo
</button>
<button onClick={() => actions.bold(editorRef.current?.view)}>
Bold
</button>
<button onClick={() => actions.italic(editorRef.current?.view)}>
Italic
</button>
</div>
<SlideEditor ref={editorRef} content={myContent} />
</div>
);
}
\*/

// EXAMPLE 2: Toolbar with Active States
/\*
import { useRef, useState, useEffect } from 'react';
import { SlideEditor, actions, SlideEditorRef } from 'autoartifacts';

function SmartToolbar() {
const editorRef = useRef<SlideEditorRef>(null);
const [isBold, setIsBold] = useState(false);
const [isItalic, setIsItalic] = useState(false);

useEffect(() => {
// Update active states periodically
const interval = setInterval(() => {
if (editorRef.current?.view) {
setIsBold(actions.isBoldActive(editorRef.current.view));
setIsItalic(actions.isItalicActive(editorRef.current.view));
}
}, 100);
return () => clearInterval(interval);
}, []);

return (

<div>
<button
onClick={() => actions.bold(editorRef.current?.view)}
style={{ fontWeight: isBold ? 'bold' : 'normal' }} >
B
</button>
<button
onClick={() => actions.italic(editorRef.current?.view)}
style={{ fontStyle: isItalic ? 'italic' : 'normal' }} >
I
</button>
<SlideEditor ref={editorRef} content={myContent} />
</div>
);
}
\*/

// EXAMPLE 3: Link Dialog
/\*
import { useRef, useState } from 'react';
import { SlideEditor, actions, SlideEditorRef } from 'autoartifacts';

function LinkToolbar() {
const editorRef = useRef<SlideEditorRef>(null);
const [showLinkDialog, setShowLinkDialog] = useState(false);
const [linkUrl, setLinkUrl] = useState('');

const handleAddLink = () => {
if (linkUrl && editorRef.current?.view) {
actions.addLink(editorRef.current.view, linkUrl);
setShowLinkDialog(false);
setLinkUrl('');
}
};

return (

<div>
<button onClick={() => setShowLinkDialog(true)}>Add Link</button>

      {showLinkDialog && (
        <div className="dialog">
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <button onClick={handleAddLink}>Add</button>
          <button onClick={() => setShowLinkDialog(false)}>Cancel</button>
        </div>
      )}

      <SlideEditor ref={editorRef} content={myContent} />
    </div>

);
}
\*/

// EXAMPLE 4: Custom Keyboard Shortcuts
/\*
import { useRef, useEffect } from 'react';
import { SlideEditor, actions, SlideEditorRef } from 'autoartifacts';

function EditorWithShortcuts() {
const editorRef = useRef<SlideEditorRef>(null);

useEffect(() => {
const handleKeyDown = (e: KeyboardEvent) => {
if (!editorRef.current?.view) return;

      // Custom shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'b') {
          e.preventDefault();
          actions.bold(editorRef.current.view);
        } else if (e.key === 'i') {
          e.preventDefault();
          actions.italic(editorRef.current.view);
        } else if (e.key === 'k') {
          e.preventDefault();
          const url = prompt('Enter URL:');
          if (url) actions.addLink(editorRef.current.view, url);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);

}, []);

return <SlideEditor ref={editorRef} content={myContent} />;
}
\*/

// EXAMPLE 5: Programmatic Formatting
/\*
import { useRef } from 'react';
import { SlideEditor, actions, SlideEditorRef } from 'autoartifacts';

function AutoFormattingEditor() {
const editorRef = useRef<SlideEditorRef>(null);

const handleContentChange = (newContent: any) => {
// Auto-format: if user types a URL, auto-link it
// This is just a conceptual example
if (editorRef.current?.view) {
const view = editorRef.current.view;
const text = view.state.doc.textContent;

      if (text.includes('http://') || text.includes('https://')) {
        // Could implement auto-linking logic here
        console.log('URL detected, could auto-link');
      }
    }

};

return (
<SlideEditor 
      ref={editorRef} 
      content={myContent}
      onChange={handleContentChange}
    />
);
}
\*/

// ================== API REFERENCE ==================

/\*
ACTIONS API REFERENCE:

actions.undo(view: EditorView | null): boolean

- Undoes the last change
- Returns true if successful, false if nothing to undo
- Also accessible via Cmd/Ctrl+Z

actions.redo(view: EditorView | null): boolean

- Redoes the last undone change
- Returns true if successful, false if nothing to redo
- Also accessible via Cmd/Ctrl+Y or Cmd/Ctrl+Shift+Z

actions.bold(view: EditorView | null): boolean

- Toggles bold mark on current selection
- If text is bold, removes bold; if not bold, adds bold
- Returns true if successful

actions.italic(view: EditorView | null): boolean

- Toggles italic mark on current selection
- If text is italic, removes italic; if not italic, adds italic
- Returns true if successful

actions.addLink(view: EditorView | null, href: string, title?: string): boolean

- Adds link mark to current selection
- Requires text to be selected (returns false if no selection)
- href: The URL for the link (required)
- title: Optional title attribute
- Returns true if successful

actions.removeLink(view: EditorView | null): boolean

- Removes link mark from current selection
- Returns true if successful

actions.isBoldActive(view: EditorView | null): boolean

- Checks if bold mark is active in current selection
- Returns true if bold is active, false otherwise

actions.isItalicActive(view: EditorView | null): boolean

- Checks if italic mark is active in current selection
- Returns true if italic is active, false otherwise

actions.isLinkActive(view: EditorView | null): boolean

- Checks if link mark is active in current selection
- Returns true if link is active, false otherwise

actions.getLinkHref(view: EditorView | null): string | null

- Gets the href of the link at current selection
- Returns href string if link is active, null otherwise

SLIDEEDITOR REF:

interface SlideEditorRef {
view: EditorView | null;
}

Usage:
const editorRef = useRef<SlideEditorRef>(null);
<SlideEditor ref={editorRef} ... />
// Access view: editorRef.current?.view
\*/

// ================== FINAL NOTES ==================

/\*
IMPORTANT NOTES:

1. HISTORY PLUGIN
   The history plugin tracks all changes to the document. It maintains
   an undo/redo stack automatically. You don't need to manage this manually.

2. KEYBOARD SHORTCUTS
   The keymap plugin automatically handles Cmd/Ctrl+Z and Cmd/Ctrl+Y.
   These work globally when the editor has focus. No additional setup needed.

3. MARKS VS NODES
   Actions work on marks (text-level formatting), not nodes.
   For node operations (adding slides, images, etc.), you'll need
   different actions in the future.

4. EDITORVIEW REF
   The EditorView is exposed via ref so developers can build custom
   toolbars and controls. It's the key to programmatic editor control.

5. NULL SAFETY
   All actions check if view is null before operating. This prevents
   crashes if someone calls an action before the editor is mounted.

6. CONSOLE WARNINGS
   Actions log warnings for invalid operations (e.g., adding link with
   no selection). This helps developers debug their toolbar implementations.

7. RETURN VALUES
   All actions return boolean - true if successful, false if not.
   Developers can use this for UI feedback (disable buttons, show errors, etc.).

8. ACTIVE STATE
   The is\*Active functions are useful for toolbar buttons that need to
   show which marks are currently applied. Update these on selection change.

POST-MVP FEATURES (NOT IN THIS IMPLEMENTATION):

- More mark actions (underline, strikethrough, colors, etc.)
- Node actions (addSlide, deleteSlide, addImage, etc.)
- Selection actions (selectAll, selectSlide, etc.)
- Navigation actions (nextSlide, prevSlide, goToSlide)
- Export actions (toHTML, toPDF, etc.)
- Batch actions (applyMultipleMarks, etc.)

These will be added in future phases as needed.

WHAT'S NEXT:
After Actions API is complete, implement:

1. Component Props (editorMode, onSlideChange, currentSlide, readOnly, onError)
2. Validation & Types (JSON validation, TypeScript types)
3. Post-MVP features from the roadmap
   \*/
