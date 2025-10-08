## SOMETHING TO REMEMBER: THE MAGIC WE WANT TO MAKE IS THAT YOU CAN VERY EASILY IMPLEMENT THIS, THE WAY BLOCKNOTE WAS EASY NOT THE WAY TIPTAP IS DIFFICULT

→ MAKE SURE EVERYTHING IS SUPER EASY TO USE AND IMPLEMENT

[AA future features ](https://www.notion.so/AA-future-features-2817689e42248026aadbfc687dca8a25?pvs=21)

# Current things to make sure we do

- Make sure that the space between the slides is blank and there is not a color there also

## **MVP - Must Have Now**

- make sure there is an editor theme that is how the editor looks like the curved edges of the slides etc, then lets add slideTheme, which will add theme to all slides instead of adding each one individually, which will make it easier to make content

### **Schema/Nodes:**

1. ✅ Basic schema (slide, row, column, paragraph, heading, text)
2. ✅**Image node** (block image with src, alt, width attrs)
3. ✅**Video/Embed node** (YouTube, Vimeo URLs)
4. ✅**Bullet list node**
5. ✅**Ordered list node**
6. ✅**List item node**

### **Marks (Text Formatting):**

1. ✅**Bold mark**
2. ✅**Italic mark**
3. ✅**Link mark** (with href attr)

### **Layout System:**

1. **Row layout attr** - predefined sizes ('1', '1-1', '2-1', '1-2', '1-1-1', '2-1-1')
2. **Column display attrs** - contentMode, verticalAlign, horizontalAlign, padding

### **Component Props:**

1. ✅ `content` prop
2. ✅ `onChange` prop
3. ✅ `editorTheme` prop
4. ✅ `editorStyles` prop
5. **`editorMode` prop** - 'edit' | 'present' | 'preview'
6. **`onSlideChange` callback**
7. **`currentSlide` prop**
8. **`readOnly` prop**
9. **`onError` callback**

### **Actions API:**

1. **`actions.undo()`**
2. **`actions.redo()`**
3. **`actions.bold()`**
4. **`actions.italic()`**
5. **`actions.addLink()`**

### **Validation & Safety:**

1. **JSON schema validation** (check structure before rendering)
2. **TypeScript type exports** (ContentJSON, SlideNode, RowNode, etc.)

---

## **Post-MVP - Phase 2**

### **More Content Nodes:**

- Code block node
- Blockquote node
- Horizontal rule node
- Table node (with row/cell)
- Callout/Alert box node
- Speaker notes node (hidden in presentation mode)

### **More Marks:**

- Underline mark
- Strikethrough mark
- Text color mark
- Highlight/background color mark
- Font size mark
- Font family mark

### **More Component Features:**

- `plugins` prop (custom ProseMirror plugins)
- Keyboard shortcuts (arrow keys for slide navigation)
- Slide navigation methods (nextSlide, prevSlide, goToSlide)
- Error boundaries (React error boundary wrapper)

### **More Layout Options:**

- More predefined layouts ('3-1', '1-3', '1-2-1', etc.)
- Grid system (beyond just flex rows)
- Absolute positioning option

### **Slide Properties:**

- Background color/image attrs on slide
- Transition attrs
- Slide numbers
- Per-slide aspect ratio

### **Documentation & DX:**

- Comprehensive README
- API documentation
- Example projects
- Visual component library/gallery

---

## **Future - Phase 3+**

### **Advanced Nodes:**

- Chart/graph nodes
- Icon node
- Shape nodes (for diagrams)
- Drawing canvas node

### **Import/Export:**

- Import from Markdown
- Import from HTML
- Export to PDF
- Export to images
- Export to PowerPoint/Google Slides format

### **Collaboration:**

- Yjs integration
- Real-time cursor positions
- Presence indicators

### **Advanced Features:**

- Custom node extension system (let developers create their own nodes)
- Animation/transition system
- Presenter mode (with notes, timer, etc.)
- Slide thumbnails component
- Slide sorter/reorder UI
- Templates/preset slide decks

## **Predefined Layout System - JavaScript-Based with Fallback**

### **How It Works:**

**Format:** Numbers separated by dashes representing flex ratios

- `'1'` → single column at 100%
- `'1-1'` → two equal columns (50/50)
- `'2-1'` → two columns (66.66% / 33.33%)
- `'3-1-2'` → three columns (50% / 16.66% / 33.33%)
- Any valid ratio: `'5-3-2'`, `'10-1'`, `'2-2-2-2'` all work

**Parsing Logic:**

1. Split layout string by : `'2-1'` → `['2', '1']`
2. Sum the numbers: `2 + 1 = 3`
3. Calculate each column's percentage: `[2/3, 1/3]` → `[66.66%, 33.33%]`
4. Apply as flex values to columns

**Validation & Fallback:**

- **Valid format:** Must match pattern `/^\d+(-\d+)*$/` (numbers and dashes only)
- **Column count mismatch:** If layout has 2 segments but 3 columns exist
  - Log warning: `"Layout '2-1' expects 2 columns but found 3. Using equal distribution."`
  - Fallback to equal widths
- **Invalid format:** If layout is malformed (e.g., `'abc'`, `'2--1'`)
  - Log warning: `"Invalid layout format 'abc'. Using equal distribution."`
  - Fallback to equal widths
- **Empty/missing layout:** Default to equal distribution (no warning)

**Nesting:**

- Rows can be nested inside columns
- Each nested row uses its own layout independently
- Update column schema: `content: 'block+ | row+'` to allow nesting

---

### **Add to MVP List:**

**Layout System:**

- Row `layout` attr - flexible ratio-based system (any valid number combination)
- JavaScript parsing logic for layout ratios
- Validation with graceful fallback to equal distribution
- CSS application via inline styles or data attributes
- Support for nested rows within columns
