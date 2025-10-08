export { SlideEditor } from "./components/SlideEditor";
export { schema } from "./schema";
export { actions } from "./actions";
export { validateContent, safeValidateContent } from "./validation";

// Export all types
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
  SlideEditorRef,
} from "./types";
