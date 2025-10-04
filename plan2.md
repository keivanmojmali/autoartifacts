✅ 1. IMAGE NODE
   File: src/schema/nodes/image.ts
   Create new node with:
   Attributes:
   typescriptattrs: {
   src: { default: '' },
   alt: { default: '' },
   width: { default: null }, // optional: number (pixels) or string (percentage)
   display: { default: 'default' }, // 'default' | 'cover' | 'contain' | 'fill'
   align: { default: 'left' } // 'left' | 'center' | 'right'
   }
   Node spec:
   typescript{
   attrs: { /_ above _/ },
   inline: false, // block-level node
   group: 'block',
   draggable: true,
   parseDOM: [{ tag: 'img', getAttrs: /* extract src, alt, etc */ }],
   toDOM(node: any) {
   const { src, alt, width, display, align } = node.attrs;
   return [
   'img',
   {
   src,
   alt,
   width: width || undefined,
   'data-display': display,
   'data-align': align,
   'data-node-type': 'image'
   }
   ];
   }
   }

✅ 2. VIDEO/EMBED NODE
   File: src/schema/nodes/video.ts
   Create new node with:
   Attributes:
   typescriptattrs: {
   src: { default: '' }, // URL to video or embed code
   provider: { default: 'youtube' }, // 'youtube' | 'vimeo' | 'embed'
   width: { default: null },
   aspectRatio: { default: '16:9' }, // '16:9' | '4:3' | '1:1'
   align: { default: 'center' } // 'left' | 'center' | 'right'
   }
   Node spec:
   typescript{
   attrs: { /_ above _/ },
   inline: false,
   group: 'block',
   draggable: true,
   parseDOM: [{ tag: 'iframe' }, { tag: 'video' }],
   toDOM(node: any) {
   const { src, provider, width, aspectRatio, align } = node.attrs;
   return [
   'div',
   {
   class: 'video-wrapper',
   'data-provider': provider,
   'data-aspect-ratio': aspectRatio,
   'data-align': align,
   'data-node-type': 'video'
   },
   [
   'iframe',
   {
   src,
   width: width || '100%',
   frameborder: '0',
   allowfullscreen: 'true'
   }
   ]
   ];
   }
   }

✅ 3. BULLET LIST NODE
   File: src/schema/nodes/bulletList.ts
   Create new node with:
   Attributes:
   typescriptattrs: {
   className: { default: '' }
   }
   Node spec:
   typescript{
   attrs: { /_ above _/ },
   group: 'block',
   content: 'listItem+', // must contain list items
   parseDOM: [{ tag: 'ul' }],
   toDOM(node: any) {
   const { className } = node.attrs;
   return [
   'ul',
   {
   class: `bullet-list ${className}`.trim(),
   'data-node-type': 'bullet-list'
   },
   0
   ];
   }
   }

✅ 4. ORDERED LIST NODE
   File: src/schema/nodes/orderedList.ts
   Create new node with:
   Attributes:
   typescriptattrs: {
   className: { default: '' },
   start: { default: 1 } // starting number
   }
   Node spec:
   typescript{
   attrs: { /_ above _/ },
   group: 'block',
   content: 'listItem+',
   parseDOM: [{ tag: 'ol', getAttrs: /* extract start */ }],
   toDOM(node: any) {
   const { className, start } = node.attrs;
   return [
   'ol',
   {
   class: `ordered-list ${className}`.trim(),
   start: start !== 1 ? start : undefined,
   'data-node-type': 'ordered-list'
   },
   0
   ];
   }
   }

✅ 5. LIST ITEM NODE
   File: src/schema/nodes/listItem.ts
   Create new node with:
   Attributes:
   typescriptattrs: {
   className: { default: '' }
   }
   Node spec:
   typescript{
   attrs: { /_ above _/ },
   content: 'paragraph block\*', // can contain paragraph and other blocks
   defining: true,
   parseDOM: [{ tag: 'li' }],
   toDOM(node: any) {
   const { className } = node.attrs;
   return [
   'li',
   {
   class: `list-item ${className}`.trim(),
   'data-node-type': 'list-item'
   },
   0
   ];
   }
   }

✅ 6. UPDATE COLUMN NODE
   File: src/schema/nodes/column.ts
   Add new attributes:
   typescriptattrs: {
   className: { default: '' },
   contentMode: { default: 'default' }, // 'default' | 'cover' | 'contain'
   verticalAlign: { default: 'top' }, // 'top' | 'center' | 'bottom'
   horizontalAlign: { default: 'left' }, // 'left' | 'center' | 'right'
   padding: { default: 'medium' } // 'none' | 'small' | 'medium' | 'large'
   }
   Update toDOM:
   typescripttoDOM(node: any) {
   const { className, contentMode, verticalAlign, horizontalAlign, padding } = node.attrs;
   return [
   'div',
   {
   class: `column ${className} content-${contentMode} v-align-${verticalAlign} h-align-${horizontalAlign} padding-${padding}`.trim(),
   'data-node-type': 'column'
   },
   0
   ];
   }
   Update content:
   typescriptcontent: 'block+ | row+' // Allow nested rows

✅ 7. UPDATE ROW NODE
   File: src/schema/nodes/row.ts
   Add layout attribute:
   typescriptattrs: {
   className: { default: '' },
   layout: { default: '' } // e.g., '2-1', '1-1-1', empty = equal distribution
   }
   Update toDOM:
   typescripttoDOM(node: any) {
   const { className, layout } = node.attrs;
   return [
   'div',
   {
   class: `row ${className}`.trim(),
   'data-node-type': 'row',
   'data-layout': layout || 'auto'
   },
   0
   ];
   }

✅ 8. UPDATE SCHEMA INDEX
   File: src/schema/nodes/index.ts
   Add imports:
   typescriptimport { image } from './image';
   import { video } from './video';
   import { bulletList } from './bulletList';
   import { orderedList } from './orderedList';
   import { listItem } from './listItem';
   Add to nodes object:
   typescriptexport const nodes = {
   doc: {
   content: 'slide+'
   },
   slide,
   row,
   column,
   image, // ADD
   video, // ADD
   bulletList, // ADD
   orderedList, // ADD
   listItem, // ADD
   paragraph: basicNodes.paragraph,
   heading: basicNodes.heading,
   text: basicNodes.text
   };

✅ 9. UPDATE STYLES
   File: src/styles.css
   Add CSS for new nodes and display attributes:
   css/_ Image display modes _/
   img[data-display="cover"] {
   object-fit: cover;
   width: 100%;
   height: 100%;
   }

img[data-display="contain"] {
object-fit: contain;
max-width: 100%;
height: auto;
}

img[data-display="fill"] {
object-fit: fill;
width: 100%;
}

img[data-align="center"] {
display: block;
margin-left: auto;
margin-right: auto;
}

img[data-align="right"] {
display: block;
margin-left: auto;
}

/_ Video wrapper _/
.video-wrapper {
position: relative;
width: 100%;
}

.video-wrapper[data-aspect-ratio="16:9"] {
aspect-ratio: 16 / 9;
}

.video-wrapper[data-aspect-ratio="4:3"] {
aspect-ratio: 4 / 3;
}

.video-wrapper[data-aspect-ratio="1:1"] {
aspect-ratio: 1 / 1;
}

.video-wrapper[data-align="center"] {
margin-left: auto;
margin-right: auto;
}

.video-wrapper iframe {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
}

/_ Lists _/
.bullet-list, .ordered-list {
margin: 10px 0;
padding-left: 24px;
}

.list-item {
margin: 4px 0;
}

/_ Column content modes _/
.column.content-cover img {
object-fit: cover;
width: 100%;
height: 100%;
}

.column.content-contain img {
object-fit: contain;
max-width: 100%;
}

/_ Column vertical alignment _/
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

✅ 10. LAYOUT PARSING LOGIC
    File: src/utils/layoutParser.ts (create new file)
    Create utility function:
    typescriptexport function parseLayout(layout: string, columnCount: number): number[] {
    // Empty layout = equal distribution
    if (!layout) {
    return new Array(columnCount).fill(1);
    }

// Validate format
if (!/^\d+(-\d+)\*$/.test(layout)) {
    console.warn(`Invalid layout format '${layout}'. Using equal distribution.`);
return new Array(columnCount).fill(1);
}

// Parse ratios
const ratios = layout.split('-').map(Number);

// Check column count match
if (ratios.length !== columnCount) {
console.warn(`Layout '${layout}' expects ${ratios.length} columns but found ${columnCount}. Using equal distribution.`);
return new Array(columnCount).fill(1);
}

return ratios;
}

export function applyLayoutToRow(rowElement: HTMLElement, layout: string) {
const columns = Array.from(rowElement.children) as HTMLElement[];
const ratios = parseLayout(layout, columns.length);

columns.forEach((column, index) => {
column.style.flex = `${ratios[index]} 1 0%`;
});
}
Usage in SlideEditor after mounting:
typescript// After creating the view, apply layout styles
useEffect(() => {
if (!viewRef.current) return;

const rows = viewRef.current.dom.querySelectorAll('[data-node-type="row"]');
rows.forEach((row: HTMLElement) => {
const layout = row.getAttribute('data-layout');
if (layout && layout !== 'auto') {
applyLayoutToRow(row, layout);
}
});
}, [/* dependencies */]);

VALIDATION & TESTING
After implementation, test:

Image node with different display modes (cover, contain, fill)
Image alignment (left, center, right)
Video embed with different aspect ratios
Bullet and ordered lists
Nested lists
Column contentMode affecting images inside
Column vertical/horizontal alignment
Layout parsing with valid ratios
Layout fallback with invalid/mismatched ratios
Nested rows within columns

RESULT
After these changes:

Images can be displayed as cover, contain, or fill
Videos support different aspect ratios
Lists (bullet and ordered) work properly
Columns control content display and alignment
Rows support flexible ratio-based layouts with fallback
All nodes have proper data attributes for targeting
Nested rows are supported
