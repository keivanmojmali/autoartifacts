// ============================================
// IMPLEMENTATION PLAN: SLIDETHEME + LAYOUT SYSTEM
// ✅ IMPLEMENTATION COMPLETE - See IMPLEMENTATION_SUMMARY.md
// ============================================

/\*
OVERVIEW:

---

This implementation adds three key features to make AutoArtifacts easier to use:

1. SLIDETHEME PROP - Apply consistent styling to all slides with one prop

   - Built-in themes: 'default', 'dark', 'minimal', 'gradient'
   - Custom themes: pass any string, developer provides CSS
   - Easy theming without modifying each slide in JSON

2. LAYOUT SYSTEM - Flexible row layouts with ratio-based columns

   - Format: '2-1', '1-1-1', '3-1-2', etc. (any valid ratio)
   - JavaScript-based parsing and application
   - Validation with graceful fallback to equal distribution
   - Supports nested rows

3. COLUMN DISPLAY ATTRIBUTES - Already implemented, just needs verification
   - contentMode, verticalAlign, horizontalAlign, padding
   - Should already be working from previous implementation

IMPLEMENTATION STEPS:

1. Add slideTheme prop to SlideEditor
2. Add CSS for slide themes
3. Create layout parser utility
4. Apply layouts on mount and content changes
5. Add comprehensive tests
   \*/

// ================== STEP 1: ADD SLIDETHEME PROP ==================

// File: src/components/SlideEditor.tsx

// UPDATE THE INTERFACE (add slideTheme prop):
interface SlideEditorProps {
content: any;
onChange?: (json: any) => void;
editorTheme?: 'light' | 'dark' | 'presentation' | string;
editorStyles?: string;
slideTheme?: string; // ADD THIS LINE - accepts any string for theme name
}

// UPDATE THE COMPONENT (add slideTheme parameter and apply to className):
export const SlideEditor: React.FC<SlideEditorProps> = ({
content,
onChange,
editorTheme = 'light',
editorStyles = '',
slideTheme = 'default' // ADD THIS LINE - default theme is 'default'
}) => {
const editorRef = useRef<HTMLDivElement>(null);
const viewRef = useRef<EditorView | null>(null);

useEffect(() => {
if (!editorRef.current) return;

    // Create initial state from JSON
    const state = EditorState.create({
      doc: schema.nodeFromJSON(content),
      schema
    });

    // Create the editor view
    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);

        // Call onChange with updated JSON
        if (onChange && transaction.docChanged) {
          onChange(newState.doc.toJSON());
        }
      }
    });

    viewRef.current = view;

    // Cleanup
    return () => {
      view.destroy();
    };

}, []);

// UPDATE THIS LINE - add slide-theme-{slideTheme} class:
const editorClassName = `autoartifacts-editor theme-${editorTheme} slide-theme-${slideTheme} ${editorStyles}`.trim();

return (
<div 
      ref={editorRef} 
      className={editorClassName}
    />
);
};

// ================== STEP 2: ADD SLIDE THEME CSS ==================

// File: src/styles.css
// ADD these styles at the end of the file

/_ ==================== SLIDE THEMES ==================== _/
/_ These apply to ALL slides when slideTheme prop is set _/

/_ Default Theme - Clean white with subtle border _/
.autoartifacts-editor.slide-theme-default .slide {
background: #ffffff;
border: 1px solid #e5e7eb;
border-radius: 8px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/_ Dark Theme - Dark background with light text _/
.autoartifacts-editor.slide-theme-dark .slide {
background: #1e293b;
border: 1px solid #334155;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
color: #f1f5f9;
}

.autoartifacts-editor.slide-theme-dark .slide h1,
.autoartifacts-editor.slide-theme-dark .slide h2,
.autoartifacts-editor.slide-theme-dark .slide h3,
.autoartifacts-editor.slide-theme-dark .slide h4,
.autoartifacts-editor.slide-theme-dark .slide h5,
.autoartifacts-editor.slide-theme-dark .slide h6 {
color: #f1f5f9;
}

.autoartifacts-editor.slide-theme-dark .slide p {
color: #e2e8f0;
}

/_ Minimal Theme - No borders or shadows, just content _/
.autoartifacts-editor.slide-theme-minimal .slide {
background: #ffffff;
border: none;
border-radius: 0;
box-shadow: none;
}

/_ Gradient Theme - Purple gradient background _/
.autoartifacts-editor.slide-theme-gradient .slide {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
border: none;
border-radius: 12px;
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
color: #ffffff;
}

.autoartifacts-editor.slide-theme-gradient .slide h1,
.autoartifacts-editor.slide-theme-gradient .slide h2,
.autoartifacts-editor.slide-theme-gradient .slide h3,
.autoartifacts-editor.slide-theme-gradient .slide h4,
.autoartifacts-editor.slide-theme-gradient .slide h5,
.autoartifacts-editor.slide-theme-gradient .slide h6 {
color: #ffffff;
}

.autoartifacts-editor.slide-theme-gradient .slide p {
color: #f3f4f6;
}

/_ Custom themes: Developers can add their own like this:
.autoartifacts-editor.slide-theme-my-brand .slide {
background: your-color;
border: your-border;
// ... etc
}
_/

// ================== STEP 3: CREATE LAYOUT PARSER UTILITY ==================

// File: src/utils/layoutParser.ts (CREATE THIS NEW FILE)

/\*\*

- Layout Parser Utility
-
- Parses layout strings like '2-1' or '1-1-1' and applies flex ratios to columns.
- Handles validation and provides graceful fallback to equal distribution.
-
- Examples:
- - '1' → single column at 100%
- - '1-1' → two equal columns (50/50)
- - '2-1' → two columns (66.66% / 33.33%)
- - '1-2-1' → three columns (25% / 50% / 25%)
- - '5-3-2' → three columns (50% / 30% / 20%)
    \*/

/\*\*

- Parses a layout string and returns flex ratios for each column
-
- @param layout - Layout string (e.g., '2-1', '1-1-1')
- @param columnCount - Number of columns in the row
- @returns Array of flex ratio numbers
-
- @example
- parseLayout('2-1', 2) // Returns [2, 1]
- parseLayout('1-1-1', 3) // Returns [1, 1, 1]
- parseLayout('invalid', 2) // Returns [1, 1] with console warning
  \*/
  export function parseLayout(layout: string, columnCount: number): number[] {
  // Empty or 'auto' layout = equal distribution
  if (!layout || layout === 'auto') {
  return new Array(columnCount).fill(1);
  }

// Validate format: must be numbers separated by dashes
// Valid: '1-2', '1-1-1', '5-3-2'
// Invalid: 'abc', '1--2', '1-2-', '-1-2'
const layoutRegex = /^\d+(-\d+)\*$/;
  if (!layoutRegex.test(layout)) {
    console.warn(
      `[AutoArtifacts] Invalid layout format '${layout}'. `+
     `Expected format: numbers separated by dashes (e.g., '2-1', '1-1-1'). `+
     `Using equal distribution.`
);
return new Array(columnCount).fill(1);
}

// Parse the layout string into numbers
const ratios = layout.split('-').map(Number);

// Validate column count matches
if (ratios.length !== columnCount) {
console.warn(
`[AutoArtifacts] Layout '${layout}' expects ${ratios.length} column(s) ` +
`but found ${columnCount} column(s) in the row. ` +
`Using equal distribution.`
);
return new Array(columnCount).fill(1);
}

return ratios;
}

/\*\*

- Applies layout ratios to a row's columns by setting flex values
-
- @param rowElement - The DOM element for the row
- @param layout - Layout string (e.g., '2-1')
-
- @example
- const row = document.querySelector('[data-node-type="row"]');
- applyLayoutToRow(row, '2-1');
- // First column will have flex: 2 1 0%
- // Second column will have flex: 1 1 0%
  \*/
  export function applyLayoutToRow(rowElement: HTMLElement, layout: string): void {
  // Get all column children
  const columns = Array.from(rowElement.children) as HTMLElement[];

if (columns.length === 0) {
return; // No columns to apply layout to
}

// Parse the layout
const ratios = parseLayout(layout, columns.length);

// Apply flex values to each column
columns.forEach((column, index) => {
// Set flex: <grow> <shrink> <basis>
// grow: ratio value (how much space this column takes)
// shrink: 1 (can shrink if needed)
// basis: 0% (start from zero and grow based on flex-grow)
column.style.flex = `${ratios[index]} 1 0%`;
});
}

/\*\*

- Applies layouts to all rows in the editor
- Should be called after editor mount and after content updates
-
- @param editorElement - The root editor DOM element
  \*/
  export function applyAllLayouts(editorElement: HTMLElement): void {
  // Find all row elements
  const rows = editorElement.querySelectorAll('[data-node-type="row"]') as NodeListOf<HTMLElement>;

rows.forEach((row) => {
const layout = row.getAttribute('data-layout');

    // Only apply if layout is specified and not 'auto'
    if (layout && layout !== 'auto') {
      applyLayoutToRow(row, layout);
    }
    // If no layout or 'auto', columns will use default flex: 1 from CSS

});
}

// ================== STEP 4: UPDATE SLIDEEDITOR TO APPLY LAYOUTS ==================

// File: src/components/SlideEditor.tsx

// ADD IMPORT at the top:
import { applyAllLayouts } from '../utils/layoutParser';

// UPDATE THE COMPONENT to apply layouts after mounting and content changes:

export const SlideEditor: React.FC<SlideEditorProps> = ({
content,
onChange,
editorTheme = 'light',
editorStyles = '',
slideTheme = 'default'
}) => {
const editorRef = useRef<HTMLDivElement>(null);
const viewRef = useRef<EditorView | null>(null);

// Existing useEffect for editor creation
useEffect(() => {
if (!editorRef.current) return;

    const state = EditorState.create({
      doc: schema.nodeFromJSON(content),
      schema
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
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      if (editorRef.current) {
        applyAllLayouts(editorRef.current);
      }
    }, 0);

    return () => {
      view.destroy();
    };

}, []);

// ADD NEW useEffect: Re-apply layouts when content changes
useEffect(() => {
if (!editorRef.current || !viewRef.current) return;

    // Apply layouts after content updates
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      if (editorRef.current) {
        applyAllLayouts(editorRef.current);
      }
    }, 0);

}, [content]); // Run when content prop changes

const editorClassName = `autoartifacts-editor theme-${editorTheme} slide-theme-${slideTheme} ${editorStyles}`.trim();

return (
<div 
      ref={editorRef} 
      className={editorClassName}
    />
);
};

// ================== STEP 5: VERIFY COLUMN DISPLAY ATTRIBUTES ==================

/_
Column display attributes should already be working from previous implementation.
Verify that these styles exist in src/styles.css:
_/

// File: src/styles.css
// VERIFY these styles exist (they should already be there from previous implementation):

/_ Column content modes - how images/content fill the column _/
.column.content-default {
/_ Default behavior - content flows naturally _/
}

.column.content-cover img,
.column.content-cover video {
object-fit: cover;
width: 100%;
height: 100%;
}

.column.content-contain img,
.column.content-contain video {
object-fit: contain;
max-width: 100%;
height: auto;
}

/_ Column vertical alignment _/
.column.v-align-top {
display: flex;
flex-direction: column;
justify-content: flex-start;
}

.column.v-align-center {
display: flex;
flex-direction: column;
justify-content: center;
}

.column.v-align-bottom {
display: flex;
flex-direction: column;
justify-content: flex-end;
}

/_ Column horizontal alignment _/
.column.h-align-left {
text-align: left;
}

.column.h-align-center {
text-align: center;
}

.column.h-align-right {
text-align: right;
}

/_ Column padding _/
.column.padding-none {
padding: 0;
}

.column.padding-small {
padding: 12px;
}

.column.padding-medium {
padding: 20px;
}

.column.padding-large {
padding: 32px;
}

// ================== COMPREHENSIVE TESTS ==================

/_
After implementation, test with these examples in your demo app
_/

// TEST 1: SlideTheme Prop - Default Theme
// File: demo/src/App.tsx or demo/src/SlideDemo.tsx

const test1Content = {
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
content: [{ type: 'text', text: 'Default Theme Test' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'This slide should have a clean white background with subtle border and shadow.' }]
}
]
}
]
}
]
}
]
};

// Usage:
<SlideEditor content={test1Content} slideTheme="default" />

// EXPECTED RESULT: White slide with light border and subtle shadow

// ---

// TEST 2: SlideTheme Prop - Dark Theme

const test2Content = {
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
content: [{ type: 'text', text: 'Dark Theme Test' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'This slide should have a dark background with light text.' }]
}
]
}
]
}
]
}
]
};

// Usage:
<SlideEditor content={test2Content} slideTheme="dark" />

// EXPECTED RESULT: Dark blue-gray slide with white text

// ---

// TEST 3: SlideTheme Prop - Gradient Theme

const test3Content = {
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
content: [{ type: 'text', text: 'Gradient Theme Test' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'This slide should have a purple gradient background.' }]
}
]
}
]
}
]
}
]
};

// Usage:
<SlideEditor content={test3Content} slideTheme="gradient" />

// EXPECTED RESULT: Purple gradient background with white text

// ---

// TEST 4: Layout System - Two Columns (2:1 ratio)

const test4Content = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
attrs: {
layout: '2-1' // First column twice as wide
},
content: [
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 2 },
content: [{ type: 'text', text: 'Main Content (2/3 width)' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'This column should take up 2/3 of the row width.' }]
}
]
},
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 2 },
content: [{ type: 'text', text: 'Sidebar (1/3 width)' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'This column should take up 1/3 of the row width.' }]
}
]
}
]
}
]
}
]
};

// Usage:
<SlideEditor content={test4Content} slideTheme="default" />

// EXPECTED RESULT: First column is twice as wide as second column (66.66% vs 33.33%)

// ---

// TEST 5: Layout System - Three Equal Columns

const test5Content = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
attrs: {
layout: '1-1-1'
},
content: [
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 3 },
content: [{ type: 'text', text: 'Column 1' }]
}
]
},
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 3 },
content: [{ type: 'text', text: 'Column 2' }]
}
]
},
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 3 },
content: [{ type: 'text', text: 'Column 3' }]
}
]
}
]
}
]
}
]
};

// Usage:
<SlideEditor content={test5Content} slideTheme="default" />

// EXPECTED RESULT: Three equal-width columns (33.33% each)

// ---

// TEST 6: Layout System - Complex Ratio (5:3:2)

const test6Content = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
attrs: {
layout: '5-3-2' // 50%, 30%, 20%
},
content: [
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 3 },
content: [{ type: 'text', text: 'Large (50%)' }]
}
]
},
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 3 },
content: [{ type: 'text', text: 'Medium (30%)' }]
}
]
},
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 3 },
content: [{ type: 'text', text: 'Small (20%)' }]
}
]
}
]
}
]
}
]
};

// Usage:
<SlideEditor content={test6Content} slideTheme="default" />

// EXPECTED RESULT: Three columns with widths 50%, 30%, 20%

// ---

// TEST 7: Layout System - Invalid Layout (Fallback)

const test7Content = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
attrs: {
layout: '2-1' // Expects 2 columns but we have 3
},
content: [
{
type: 'column',
content: [
{
type: 'paragraph',
content: [{ type: 'text', text: 'Column 1' }]
}
]
},
{
type: 'column',
content: [
{
type: 'paragraph',
content: [{ type: 'text', text: 'Column 2' }]
}
]
},
{
type: 'column',
content: [
{
type: 'paragraph',
content: [{ type: 'text', text: 'Column 3' }]
}
]
}
]
}
]
}
]
};

// Usage:
<SlideEditor content={test7Content} slideTheme="default" />

// EXPECTED RESULT:
// - Console warning: "Layout '2-1' expects 2 column(s) but found 3 column(s)"
// - Columns fall back to equal width (33.33% each)

// ---

// TEST 8: Column Display Attributes - Image Cover

const test8Content = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
attrs: {
layout: '1-1'
},
content: [
{
type: 'column',
attrs: {
contentMode: 'cover',
padding: 'none'
},
content: [
{
type: 'image',
attrs: {
src: 'https://picsum.photos/800/600',
alt: 'Cover image'
}
}
]
},
{
type: 'column',
attrs: {
verticalAlign: 'center',
horizontalAlign: 'center',
padding: 'large'
},
content: [
{
type: 'heading',
attrs: { level: 2 },
content: [{ type: 'text', text: 'Centered Text' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'This text should be centered both vertically and horizontally.' }]
}
]
}
]
}
]
}
]
};

// Usage:
<SlideEditor content={test8Content} slideTheme="default" />

// EXPECTED RESULT:
// - Left column: Image covers entire column with no padding
// - Right column: Text centered vertically and horizontally with large padding

// ---

// TEST 9: Nested Rows

const test9Content = {
type: 'doc',
content: [
{
type: 'slide',
content: [
{
type: 'row',
attrs: {
layout: '2-1'
},
content: [
{
type: 'column',
content: [
{
type: 'heading',
attrs: { level: 2 },
content: [{ type: 'text', text: 'Main Column' }]
},
{
type: 'paragraph',
content: [{ type: 'text', text: 'This is the main content area.' }]
}
]
},
{
type: 'column',
content: [
{
type: 'row', // NESTED ROW
attrs: {
layout: '1-1'
},
content: [
{
type: 'column',
content: [
{
type: 'paragraph',
content: [{ type: 'text', text: 'Nested 1' }]
}
]
},
{
type: 'column',
content: [
{
type: 'paragraph',
content: [{ type: 'text', text: 'Nested 2' }]
}
]
}
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

// Usage:
<SlideEditor content={test9Content} slideTheme="default" />

// EXPECTED RESULT:
// - Outer row: First column 66.66%, second column 33.33%
// - Nested row inside second column: Two equal columns

// ---

// TEST 10: Multiple Slides with Different Themes Applied

const test10Content = {
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
}
]
}
]
}
]
}
]
};

// Usage:
<SlideEditor content={test10Content} slideTheme="gradient" />

// EXPECTED RESULT: All three slides have gradient theme applied

// ================== IMPLEMENTATION CHECKLIST ==================

/\*
COMPLETE THESE STEPS IN ORDER:

☑ Step 1: Update SlideEditor.tsx interface

- Add slideTheme?: string to SlideEditorProps

☑ Step 2: Update SlideEditor component

- Add slideTheme parameter with default 'default'
- Update editorClassName to include slide-theme-{slideTheme}

☑ Step 3: Add slide theme CSS to styles.css

- Add .slide-theme-default styles
- Add .slide-theme-dark styles
- Add .slide-theme-minimal styles
- Add .slide-theme-gradient styles

☑ Step 4: Create src/utils/layoutParser.ts

- Implement parseLayout function
- Implement applyLayoutToRow function
- Implement applyAllLayouts function
- Add comprehensive JSDoc comments

☑ Step 5: Update SlideEditor.tsx to use layout parser

- Import applyAllLayouts
- Apply layouts in first useEffect (after mount)
- Add second useEffect for content changes

☑ Step 6: Verify column display attribute CSS

- Check that all content mode styles exist
- Check that all vertical alignment styles exist
- Check that all horizontal alignment styles exist
- Check that all padding styles exist

☑ Step 7: Test all scenarios

- Test slideTheme prop with all 4 built-in themes
- Test layout system with various ratios
- Test invalid layouts (verify console warnings)
- Test column display attributes
- Test nested rows
- Test multiple slides

VERIFICATION:
After implementation, run all 10 tests above and verify:
✓ SlideTheme applies to all slides
✓ Layouts calculate correctly
✓ Invalid layouts fall back to equal distribution
✓ Console warnings appear for invalid layouts
✓ Column display attributes work
✓ Nested rows work independently
✓ No errors in console (except expected warnings)
\*/

// ================== SUCCESS CRITERIA ==================

/\*
WHEN COMPLETE, THE FOLLOWING SHOULD ALL WORK:

1. SLIDETHEME PROP:
   ✓ <SlideEditor slideTheme="default" /> applies white theme to all slides
   ✓ <SlideEditor slideTheme="dark" /> applies dark theme to all slides
   ✓ <SlideEditor slideTheme="minimal" /> applies minimal theme to all slides
   ✓ <SlideEditor slideTheme="gradient" /> applies gradient theme to all slides
   ✓ <SlideEditor slideTheme="my-custom" /> allows custom theme with developer CSS
   ✓ slideTheme applies globally without modifying individual slides in JSON

2. LAYOUT SYSTEM:
   ✓ layout="2-1" creates 66.66% / 33.33% split
   ✓ layout="1-1" creates 50% / 50% split
   ✓ layout="1-1-1" creates three equal columns
   ✓ layout="5-3-2" creates 50% / 30% / 20% split
   ✓ Any valid ratio string works (e.g., '7-2-1', '10-5-3-2')
   ✓ Invalid layout formats trigger console warning and fallback
   ✓ Column count mismatch triggers console warning and fallback
   ✓ Empty/missing layout uses equal distribution (no warning)
   ✓ Layouts apply on initial mount
   ✓ Layouts re-apply when content prop changes
   ✓ Nested rows calculate layouts independently

3. COLUMN DISPLAY ATTRIBUTES:
   ✓ contentMode="cover" makes images fill entire column
   ✓ contentMode="contain" makes images fit within column
   ✓ verticalAlign="top" aligns content to top
   ✓ verticalAlign="center" centers content vertically
   ✓ verticalAlign="bottom" aligns content to bottom
   ✓ horizontalAlign="left" aligns content to left
   ✓ horizontalAlign="center" centers content horizontally
   ✓ horizontalAlign="right" aligns content to right
   ✓ padding="none" removes all padding
   ✓ padding="small" applies 12px padding
   ✓ padding="medium" applies 20px padding
   ✓ padding="large" applies 32px padding
   ✓ Multiple attributes work together (e.g., center + large padding)

4. OVERALL QUALITY:
   ✓ No TypeScript errors
   ✓ No runtime errors (except expected validation warnings)
   ✓ Clean console (only intentional warnings for invalid layouts)
   ✓ Code is well-commented and maintainable
   ✓ Follows existing code patterns and style
   ✓ All imports are correct
   ✓ No unused variables or code
   \*/

// ================== TROUBLESHOOTING GUIDE ==================

/\*
IF SOMETHING DOESN'T WORK:

ISSUE: SlideTheme not applying
SOLUTION:

- Check that slideTheme prop is being passed correctly
- Verify className includes "slide-theme-{theme}" in browser devtools
- Check that CSS file has .slide-theme-{theme} .slide selector
- Make sure CSS is imported in SlideEditor.tsx

ISSUE: Layouts not applying
SOLUTION:

- Check browser console for any errors
- Verify data-layout attribute exists on row elements in devtools
- Check that layoutParser.ts is created and exported correctly
- Verify applyAllLayouts is being called in useEffect
- Try adding console.log in applyLayoutToRow to debug
- Check that columns have data-node-type="column"

ISSUE: Console warnings appearing incorrectly
SOLUTION:

- Verify layout string format matches /^\d+(-\d+)\*$/
- Count columns in JSON vs layout string segments
- Check for typos in layout attribute

ISSUE: Column display attributes not working
SOLUTION:

- Verify attrs are in column node JSON
- Check that toDOM is applying classes correctly
- Inspect element in devtools to see actual classes
- Verify CSS selectors match (e.g., .column.v-align-center)

ISSUE: Nested rows not working
SOLUTION:

- Verify column content allows 'block+ | row+'
- Check that nested row has data-layout attribute
- Verify applyAllLayouts finds nested rows (use querySelectorAll)

ISSUE: Layouts not re-applying after content changes
SOLUTION:

- Check second useEffect has [content] dependency
- Verify content prop is actually changing (new reference)
- Try forcing re-render by changing key prop on SlideEditor
- Check setTimeout is completing before next update
  \*/

// ================== FINAL NOTES ==================

/\*
IMPORTANT REMINDERS:

1. The setTimeout in useEffect is necessary because ProseMirror
   may not have finished rendering the DOM when the effect runs.
   The 0ms delay ensures we're in the next event loop tick.

2. Console warnings are INTENTIONAL for invalid layouts.
   This helps developers debug their JSON structure.

3. The layout parser is defensive - it always falls back to
   equal distribution rather than breaking the UI.

4. Column display attributes are already implemented from
   previous work - this implementation just verifies they work.

5. SlideTheme applies via CSS cascade, so custom classes on
   individual slides can override if needed.

6. Post-MVP will add theme objects, but for now CSS-only
   keeps it simple and familiar to developers.

WHAT'S NEXT (NOT IN THIS IMPLEMENTATION):

- Actions API (undo, redo, formatting commands)
- Additional component props (editorMode, onSlideChange, etc.)
- JSON validation
- TypeScript type exports
- Error boundaries
- Keyboard shortcuts

These will be separate implementations after this one is complete.
\*/
