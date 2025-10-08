import React, { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "../schema"; // Updated path
import { applyAllLayouts } from '../utils/layoutParser';
import '../styles.css';

interface SlideEditorProps {
  content: any; // ProseMirror JSON
  onChange?: (json: any) => void;
  editorTheme?: 'light' | 'dark' | 'presentation' | string;
  editorStyles?: string;
  slideTheme?: string; // ADD THIS LINE - accepts any string for theme name
}

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
      schema,
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
      },
    });

    viewRef.current = view;

    // Apply layouts after initial render
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      if (editorRef.current) {
        applyAllLayouts(editorRef.current);
      }
    }, 0);

    // Cleanup
    return () => {
      view.destroy();
    };
  }, []);

  // Re-apply layouts when content changes
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

  return <div ref={editorRef} className={editorClassName} />;
};
