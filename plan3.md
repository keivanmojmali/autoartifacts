// ============================================
// TEXT MARKS IMPLEMENTATION - COMPLETE GUIDE
// ============================================

/\*
WHAT ARE MARKS?

---

Marks are text-level formatting attributes in ProseMirror that wrap around text content.
Unlike nodes (which are structural elements like paragraphs or slides), marks add styling
to text without changing the document structure.

HOW THEY WORK:

- Marks attach to text nodes, not block nodes
- Multiple marks can be applied to the same text (e.g., bold + italic)
- They serialize to HTML tags or inline styles
- Users apply them via editor commands (toolbar buttons, keyboard shortcuts)

EXAMPLE JSON:
{
"type": "paragraph",
"content": [
{
"type": "text",
"text": "Hello world",
"marks": [
{ "type": "bold" },
{ "type": "italic" }
]
}
]
}

This renders as: <p><strong><em>Hello world</em></strong></p>

IMPLEMENTATION OVERVIEW:
We're implementing 16 marks across 3 phases:

- Phase 1 (MVP): 6 essential marks (bold, italic, link, underline, strikethrough, code)
- Phase 2 (Post-MVP): 6 extended marks (colors, sizes, super/subscript)
- Phase 3 (Advanced): 4 typography marks (shadow, spacing, transform)

Each mark defines:

- parseDOM: How to read existing HTML into ProseMirror
- toDOM: How to render the mark as HTML
- attrs: Optional attributes (like href for links, color for text color)
- excludes: Which other marks this mark is incompatible with
  \*/

// -------------------- PHASE 1: MVP MARKS --------------------

// ✅ File: src/schema/marks/bold.ts
export const bold = {
parseDOM: [
{ tag: 'strong' },
{ tag: 'b' },
{ style: 'font-weight', getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }
],
toDOM() {
return ['strong', 0];
}
};

// ✅ File: src/schema/marks/italic.ts
export const italic = {
parseDOM: [
{ tag: 'em' },
{ tag: 'i' },
{ style: 'font-style=italic' }
],
toDOM() {
return ['em', 0];
}
};

// ✅ File: src/schema/marks/link.ts
export const link = {
attrs: {
href: { default: '' },
title: { default: null },
target: { default: '\_blank' }
},
inclusive: false,
parseDOM: [
{
tag: 'a[href]',
getAttrs(dom: HTMLElement) {
return {
href: dom.getAttribute('href'),
title: dom.getAttribute('title'),
target: dom.getAttribute('target')
};
}
}
],
toDOM(mark: any) {
const { href, title, target } = mark.attrs;
return [
'a',
{
href,
title: title || undefined,
target,
rel: 'noopener noreferrer'
},
0
];
}
};

// ✅ File: src/schema/marks/underline.ts
export const underline = {
parseDOM: [
{ tag: 'u' },
{ style: 'text-decoration=underline' }
],
toDOM() {
return ['u', 0];
}
};

// ✅ File: src/schema/marks/strikethrough.ts
export const strikethrough = {
parseDOM: [
{ tag: 's' },
{ tag: 'del' },
{ style: 'text-decoration=line-through' }
],
toDOM() {
return ['s', 0];
}
};

// ✅ File: src/schema/marks/code.ts
export const code = {
parseDOM: [{ tag: 'code' }],
toDOM() {
return ['code', { class: 'inline-code' }, 0];
},
excludes: '\_' // Code excludes all other marks
};

// -------------------- PHASE 2: POST-MVP MARKS --------------------

// ✅ File: src/schema/marks/textColor.ts
export const textColor = {
attrs: {
color: { default: '#000000' }
},
parseDOM: [
{
style: 'color',
getAttrs(value: string) {
return { color: value };
}
}
],
toDOM(mark: any) {
const { color } = mark.attrs;
return ['span', { style: `color: ${color}` }, 0];
}
};

// ✅ File: src/schema/marks/highlight.ts
export const highlight = {
attrs: {
color: { default: '#ffff00' }
},
parseDOM: [
{
tag: 'mark',
getAttrs(dom: HTMLElement) {
return { color: dom.style.backgroundColor || '#ffff00' };
}
},
{
style: 'background-color',
getAttrs(value: string) {
return { color: value };
}
}
],
toDOM(mark: any) {
const { color } = mark.attrs;
return ['mark', { style: `background-color: ${color}` }, 0];
}
};

// ✅ File: src/schema/marks/fontSize.ts
export const fontSize = {
attrs: {
size: { default: 'normal' } // 'small' | 'normal' | 'large' | 'xlarge' | custom px/rem
},
parseDOM: [
{
style: 'font-size',
getAttrs(value: string) {
return { size: value };
}
}
],
toDOM(mark: any) {
const { size } = mark.attrs;
const sizeMap: Record<string, string> = {
'small': '0.875rem',
'normal': '1rem',
'large': '1.25rem',
'xlarge': '1.5rem'
};
const cssSize = sizeMap[size] || size;
return ['span', { style: `font-size: ${cssSize}` }, 0];
}
};

// ✅ File: src/schema/marks/fontFamily.ts
export const fontFamily = {
attrs: {
family: { default: 'sans-serif' } // 'sans-serif' | 'serif' | 'monospace' | custom
},
parseDOM: [
{
style: 'font-family',
getAttrs(value: string) {
return { family: value };
}
}
],
toDOM(mark: any) {
const { family } = mark.attrs;
return ['span', { style: `font-family: ${family}` }, 0];
}
};

// ✅ File: src/schema/marks/superscript.ts
export const superscript = {
excludes: 'subscript', // Can't be both superscript and subscript
parseDOM: [
{ tag: 'sup' },
{ style: 'vertical-align=super' }
],
toDOM() {
return ['sup', 0];
}
};

// ✅ File: src/schema/marks/subscript.ts
export const subscript = {
excludes: 'superscript',
parseDOM: [
{ tag: 'sub' },
{ style: 'vertical-align=sub' }
],
toDOM() {
return ['sub', 0];
}
};

// -------------------- PHASE 3: ADVANCED MARKS --------------------

// ✅ File: src/schema/marks/textShadow.ts
export const textShadow = {
attrs: {
shadow: { default: '2px 2px 4px rgba(0,0,0,0.3)' }
},
parseDOM: [
{
style: 'text-shadow',
getAttrs(value: string) {
return { shadow: value };
}
}
],
toDOM(mark: any) {
const { shadow } = mark.attrs;
return ['span', { style: `text-shadow: ${shadow}` }, 0];
}
};

// ✅ File: src/schema/marks/letterSpacing.ts
export const letterSpacing = {
attrs: {
spacing: { default: 'normal' } // 'tight' | 'normal' | 'wide' | custom em/px
},
parseDOM: [
{
style: 'letter-spacing',
getAttrs(value: string) {
return { spacing: value };
}
}
],
toDOM(mark: any) {
const { spacing } = mark.attrs;
const spacingMap: Record<string, string> = {
'tight': '-0.05em',
'normal': 'normal',
'wide': '0.1em'
};
const cssSpacing = spacingMap[spacing] || spacing;
return ['span', { style: `letter-spacing: ${cssSpacing}` }, 0];
}
};

// ✅ File: src/schema/marks/lineHeight.ts
export const lineHeight = {
attrs: {
height: { default: 'normal' } // 'tight' | 'normal' | 'relaxed' | custom number
},
parseDOM: [
{
style: 'line-height',
getAttrs(value: string) {
return { height: value };
}
}
],
toDOM(mark: any) {
const { height } = mark.attrs;
const heightMap: Record<string, string> = {
'tight': '1.25',
'normal': '1.5',
'relaxed': '1.75'
};
const cssHeight = heightMap[height] || height;
return ['span', { style: `line-height: ${cssHeight}` }, 0];
}
};

// ✅ File: src/schema/marks/textTransform.ts
export const textTransform = {
attrs: {
transform: { default: 'none' } // 'none' | 'uppercase' | 'lowercase' | 'capitalize'
},
parseDOM: [
{
style: 'text-transform',
getAttrs(value: string) {
return { transform: value };
}
}
],
toDOM(mark: any) {
const { transform } = mark.attrs;
return ['span', { style: `text-transform: ${transform}` }, 0];
}
};

// -------------------- MARKS INDEX --------------------

// ✅ File: src/schema/marks/index.ts
import { bold } from './bold';
import { italic } from './italic';
import { link } from './link';
import { underline } from './underline';
import { strikethrough } from './strikethrough';
import { code } from './code';
import { textColor } from './textColor';
import { highlight } from './highlight';
import { fontSize } from './fontSize';
import { fontFamily } from './fontFamily';
import { superscript } from './superscript';
import { subscript } from './subscript';
import { textShadow } from './textShadow';
import { letterSpacing } from './letterSpacing';
import { lineHeight } from './lineHeight';
import { textTransform } from './textTransform';

export const marks = {
bold,
italic,
link,
underline,
strikethrough,
code,
textColor,
highlight,
fontSize,
fontFamily,
superscript,
subscript,
textShadow,
letterSpacing,
lineHeight,
textTransform
};

// -------------------- UPDATE SCHEMA --------------------

// ✅ File: src/schema/index.ts
// UPDATE: Change marks import from basicNodes to our custom marks

import { Schema } from 'prosemirror-model';
import { nodes } from './nodes';
import { marks } from './marks'; // CHANGE THIS LINE - import our marks

export const schema = new Schema({
nodes,
marks // CHANGE THIS LINE - use our marks instead of basicNodes.marks
});

// -------------------- STYLES --------------------

// ✅ File: src/styles.css
// ADD these styles at the end of the existing file

/_ Phase 1: MVP mark styles _/
strong {
font-weight: 600;
}

em {
font-style: italic;
}

u {
text-decoration: underline;
}

s {
text-decoration: line-through;
}

code.inline-code {
background: #f1f5f9;
padding: 2px 6px;
border-radius: 3px;
font-family: 'Courier New', monospace;
font-size: 0.9em;
}

a {
color: #2563eb;
text-decoration: underline;
cursor: pointer;
}

a:hover {
color: #1d4ed8;
}

/_ Phase 2: Post-MVP mark styles _/
sup {
vertical-align: super;
font-size: 0.75em;
}

sub {
vertical-align: sub;
font-size: 0.75em;
}

mark {
padding: 2px 4px;
border-radius: 2px;
}

// -------------------- IMPLEMENTATION CHECKLIST --------------------

/\*
STEP-BY-STEP IMPLEMENTATION:

1. Create src/schema/marks/ folder

2. Create all mark files in Phase 1:

   - bold.ts
   - italic.ts
   - link.ts
   - underline.ts
   - strikethrough.ts
   - code.ts

3. Create all mark files in Phase 2:

   - textColor.ts
   - highlight.ts
   - fontSize.ts
   - fontFamily.ts
   - superscript.ts
   - subscript.ts

4. Create all mark files in Phase 3:

   - textShadow.ts
   - letterSpacing.ts
   - lineHeight.ts
   - textTransform.ts

5. Create src/schema/marks/index.ts with all imports and exports

6. Update src/schema/index.ts to import marks from './marks' instead of basicNodes

7. Update src/styles.css with all mark styles

TESTING:

After implementation, test with this sample JSON in your demo:

{
"type": "doc",
"content": [
{
"type": "slide",
"content": [
{
"type": "row",
"content": [
{
"type": "column",
"content": [
{
"type": "paragraph",
"content": [
{ "type": "text", "text": "This is " },
{ "type": "text", "text": "bold", "marks": [{ "type": "bold" }] },
{ "type": "text", "text": " and " },
{ "type": "text", "text": "italic", "marks": [{ "type": "italic" }] },
{ "type": "text", "text": " and " },
{ "type": "text", "text": "both", "marks": [{ "type": "bold" }, { "type": "italic" }] },
{ "type": "text", "text": " and a " },
{
"type": "text",
"text": "link",
"marks": [{ "type": "link", "attrs": { "href": "https://example.com" } }]
},
{ "type": "text", "text": " and " },
{ "type": "text", "text": "colored text", "marks": [{ "type": "textColor", "attrs": { "color": "#ff0000" } }] },
{ "type": "text", "text": " and " },
{ "type": "text", "text": "highlighted", "marks": [{ "type": "highlight", "attrs": { "color": "#ffff00" } }] }
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

VERIFY:

- All marks render correctly
- Marks can be combined (bold + italic on same text works)
- Link opens in new tab with correct security attributes
- Color marks apply the specified colors
- Super/subscript are mutually exclusive
- Code mark excludes all other marks
  \*/
