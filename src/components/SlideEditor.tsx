import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { schema } from "../schema";
import { applyAllLayouts } from '../utils/layoutParser';
import '../styles.css';

interface SlideEditorProps {
  content: any; // ProseMirror JSON
  onChange?: (json: any) => void;
  editorTheme?: 'light' | 'dark' | 'presentation' | string;
  editorStyles?: string;
  slideTheme?: string;
}

export interface SlideEditorRef {
  view: EditorView | null;
}

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

      // Add plugins including history
      const plugins = [
        history(), // Enables undo/redo
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo
        }),
        keymap(baseKeymap)
      ];

      // Create initial state from JSON
      const state = EditorState.create({
        doc: schema.nodeFromJSON(content),
        schema,
        plugins
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
  }
);

SlideEditor.displayName = 'SlideEditor';
