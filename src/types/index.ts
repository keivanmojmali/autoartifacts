/**
 * TypeScript Type Definitions for AutoArtifacts
 *
 * Export these types so developers get autocomplete and type safety
 */

// ===== BASE TYPES =====

/**
 * Base node structure
 */
export interface BaseNode {
  type: string;
  content?: ContentNode[];
  attrs?: Record<string, any>;
}

/**
 * Text node with optional marks
 */
export interface TextNode {
  type: "text";
  text: string;
  marks?: Mark[];
}

/**
 * Mark (text formatting)
 */
export interface Mark {
  type: string;
  attrs?: Record<string, any>;
}

// ===== CONTENT NODES =====

/**
 * Document node (root)
 */
export interface DocNode {
  type: "doc";
  content: SlideNode[];
}

/**
 * Slide node
 */
export interface SlideNode {
  type: "slide";
  attrs?: {
    className?: string;
  };
  content: RowNode[];
}

/**
 * Row node (horizontal container)
 */
export interface RowNode {
  type: "row";
  attrs?: {
    className?: string;
    layout?: string; // e.g., '2-1', '1-1-1'
  };
  content: (ColumnNode | BlockNode)[];
}

/**
 * Column node (vertical container)
 */
export interface ColumnNode {
  type: "column";
  attrs?: {
    className?: string;
    contentMode?: "default" | "cover" | "contain";
    verticalAlign?: "top" | "center" | "bottom";
    horizontalAlign?: "left" | "center" | "right";
    padding?: "none" | "small" | "medium" | "large";
  };
  content: (BlockNode | RowNode)[];
}

/**
 * Paragraph node
 */
export interface ParagraphNode {
  type: "paragraph";
  attrs?: {
    className?: string;
  };
  content?: (TextNode | InlineNode)[];
}

/**
 * Heading node
 */
export interface HeadingNode {
  type: "heading";
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
  };
  content?: (TextNode | InlineNode)[];
}

/**
 * Image node
 */
export interface ImageNode {
  type: "image";
  attrs: {
    src: string;
    alt?: string;
    width?: number | string;
    display?: "default" | "cover" | "contain" | "fill";
    align?: "left" | "center" | "right";
  };
}

/**
 * Video node
 */
export interface VideoNode {
  type: "video";
  attrs: {
    src: string;
    provider?: "youtube" | "vimeo" | "embed";
    width?: number | string;
    aspectRatio?: "16:9" | "4:3" | "1:1";
    align?: "left" | "center" | "right";
  };
}

/**
 * Bullet list node
 */
export interface BulletListNode {
  type: "bulletList";
  attrs?: {
    className?: string;
  };
  content: ListItemNode[];
}

/**
 * Ordered list node
 */
export interface OrderedListNode {
  type: "orderedList";
  attrs?: {
    className?: string;
    start?: number;
  };
  content: ListItemNode[];
}

/**
 * List item node
 */
export interface ListItemNode {
  type: "listItem";
  attrs?: {
    className?: string;
  };
  content: BlockNode[];
}

// ===== UNION TYPES =====

/**
 * Any block-level node
 */
export type BlockNode =
  | ParagraphNode
  | HeadingNode
  | ImageNode
  | VideoNode
  | BulletListNode
  | OrderedListNode;

/**
 * Any inline-level node
 */
export type InlineNode = TextNode;

/**
 * Any content node
 */
export type ContentNode =
  | DocNode
  | SlideNode
  | RowNode
  | ColumnNode
  | BlockNode
  | InlineNode;

// ===== MARK TYPES =====

/**
 * Bold mark
 */
export interface BoldMark {
  type: "bold";
}

/**
 * Italic mark
 */
export interface ItalicMark {
  type: "italic";
}

/**
 * Link mark
 */
export interface LinkMark {
  type: "link";
  attrs: {
    href: string;
    title?: string;
    target?: string;
  };
}

/**
 * Underline mark
 */
export interface UnderlineMark {
  type: "underline";
}

/**
 * Strikethrough mark
 */
export interface StrikethroughMark {
  type: "strikethrough";
}

/**
 * Code mark (inline code)
 */
export interface CodeMark {
  type: "code";
}

/**
 * Text color mark
 */
export interface TextColorMark {
  type: "textColor";
  attrs: {
    color: string;
  };
}

/**
 * Highlight mark
 */
export interface HighlightMark {
  type: "highlight";
  attrs: {
    color: string;
  };
}

// ===== COMPONENT TYPES =====

/**
 * SlideEditor component props
 */
export interface SlideEditorProps {
  content: DocNode;
  onChange?: (content: DocNode) => void;
  editorTheme?: "light" | "dark" | "presentation" | string;
  editorStyles?: string;
  slideTheme?: string;
  editorMode?: "edit" | "present" | "preview";
  readOnly?: boolean;
  currentSlide?: number;
  onSlideChange?: (slideIndex: number) => void;
  onError?: (error: Error) => void;
}

/**
 * SlideEditor ref type
 */
export interface SlideEditorRef {
  view: any; // EditorView from prosemirror-view
}
