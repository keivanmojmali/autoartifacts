# Changes Needed

## ✅ File: src/schema/nodes/slide.ts

Add:

✅ attrs property with className support:

typescript attrs: {
className: { default: '' }
}

✅ Update toDOM function signature to accept node parameter:

typescript toDOM(node: any) {

✅ Inside toDOM, extract className from attrs:

typescript const { className } = node.attrs;

✅ Update the returned array to merge classes and add data attribute:

typescript return [
'div',
{
class: `slide ${className}`.trim(),
'data-node-type': 'slide'
},
0
];

## ✅ File: src/schema/nodes/row.ts

Add:

✅ attrs property with className support:

typescript attrs: {
className: { default: '' }
}

✅ Update toDOM function signature to accept node parameter:

typescript toDOM(node: any) {

✅ Inside toDOM, extract className from attrs:

typescript const { className } = node.attrs;

✅ Update the returned array to merge classes and add data attribute:

typescript return [
'div',
{
class: `row ${className}`.trim(),
'data-node-type': 'row'
},
0
];

## ✅ File: src/schema/nodes/column.ts

Add:

✅ attrs property with className support:

typescript attrs: {
className: { default: '' }
}

✅ Update toDOM function signature to accept node parameter:

typescript toDOM(node: any) {

✅ Inside toDOM, extract className from attrs:

typescript const { className } = node.attrs;

✅ Update the returned array to merge classes and add data attribute:

typescript return [
'div',
{
class: `column ${className}`.trim(),
'data-node-type': 'column'
},
0
];

## ✅ File: src/styles.css

✅ Create this file with the following content:
css/_ Base editor wrapper _/
.autoartifacts-editor {
position: relative;
}

/_ Default slide styles _/
.slide {
border: 1px solid #e0e0e0;
margin: 20px 0;
padding: 20px;
background: white;
}

.row {
display: flex;
gap: 16px;
margin: 10px 0;
}

.column {
flex: 1;
min-width: 0;
}

.ProseMirror {
outline: none;
min-height: 100px;
}

/_ Light theme (default) _/
.autoartifacts-editor.theme-light {
background: #ffffff;
}

.autoartifacts-editor.theme-light .slide {
background: #f9fafb;
border-color: #e5e7eb;
}

/_ Dark theme _/
.autoartifacts-editor.theme-dark {
background: #1e293b;
}

.autoartifacts-editor.theme-dark .slide {
background: #0f172a;
border-color: #334155;
color: #f1f5f9;
}

/_ Presentation theme _/
.autoartifacts-editor.theme-presentation {
background: #000000;
padding: 40px;
}

.autoartifacts-editor.theme-presentation .slide {
aspect-ratio: 16 / 9;
max-width: 1200px;
margin: 40px auto;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

## ✅ File: src/components/SlideEditor.tsx

✅ Update the interface (at the top of file):
typescriptinterface SlideEditorProps {
content: any;
onChange?: (json: any) => void;
editorTheme?: 'light' | 'dark' | 'presentation' | string;
editorStyles?: string;
}
✅ Update the component signature:
typescriptexport const SlideEditor: React.FC<SlideEditorProps> = ({
content,
onChange,
editorTheme = 'light',
editorStyles = ''
}) => {
✅ Update the return statement to add className:
typescript// Before the return statement, add:
const editorClassName = `autoartifacts-editor theme-${editorTheme} ${editorStyles}`.trim();

// Then update the return:
return (

  <div 
    ref={editorRef} 
    className={editorClassName}
  />
);
✅ Add import at the top (after other imports):
typescriptimport '../styles.css';

## ✅ File: src/schema/nodes/index.ts

✅ No changes needed - it already imports the updated node files

## ✅ Result

After these changes:
Node-level customization:

Default classes remain: .slide, .row, .column
Data attributes added: data-node-type="slide", etc.
Custom classes can be passed via JSON: "attrs": { "className": "custom-class" }
Classes merge: class="slide custom-class"

Editor-level customization:

editorTheme prop: Choose from 'light', 'dark', 'presentation', or custom
editorStyles prop: Add Tailwind classes or custom CSS classes
Works with Tailwind, Bootstrap, or any CSS framework
