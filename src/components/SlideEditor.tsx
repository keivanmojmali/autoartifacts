import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { schema } from "../schema";
import { applyAllLayouts } from '../utils/layoutParser';
import {
  showSlide,
  showAllSlides,
  nextSlide as navNextSlide,
  prevSlide as navPrevSlide
} from '../utils/slideNavigation';
import { validateContent, ValidationError } from '../validation';
import '../styles.css';

interface SlideEditorProps {
  content: any; // ProseMirror JSON
  onChange?: (json: any) => void;
  editorTheme?: 'light' | 'dark' | 'presentation' | string;
  editorStyles?: string;
  slideTheme?: string;
  // NEW PROPS:
  editorMode?: 'edit' | 'present' | 'preview'; // Determines interaction mode
  readOnly?: boolean; // If true, editor is view-only
  currentSlide?: number; // Zero-based slide index to display
  onSlideChange?: (slideIndex: number) => void; // Called when slide changes
  onError?: (error: Error) => void; // Called when errors occur
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
    slideTheme = 'default',
    editorMode = 'edit',
    readOnly = false,
    currentSlide = 0,
    onSlideChange,
    onError
  }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    // Expose the EditorView via ref
    useImperativeHandle(ref, () => ({
      view: viewRef.current
    }));

    useEffect(() => {
      if (!editorRef.current) return;

      try {
        // Validate content before creating editor
        validateContent(content);

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

        // Determine if editor should be editable
        const isEditable = editorMode === 'edit' && !readOnly;

        // Create the editor view
        const view = new EditorView(editorRef.current, {
          state,
          editable: () => isEditable,
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
      } catch (error) {
        // Handle validation errors
        if (error instanceof ValidationError) {
          console.error('[AutoArtifacts] Content validation failed:', error.message);
          if (onError) {
            onError(error);
          }
          return; // Don't create editor if validation fails
        }

        // Handle other errors
        if (onError && error instanceof Error) {
          onError(error);
        } else {
          console.error('[AutoArtifacts] Error initializing editor:', error);
        }
      }
    }, [content, editorMode, readOnly]);

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

    // Handle slide visibility based on mode and currentSlide
    useEffect(() => {
      if (!editorRef.current) return;

      if (editorMode === 'present') {
        // In presentation mode, show only current slide
        showSlide(editorRef.current, currentSlide);
      } else {
        // In edit and preview modes, show all slides
        showAllSlides(editorRef.current);
      }
    }, [editorMode, currentSlide]);

    // Keyboard navigation for presentation mode
    useEffect(() => {
      if (editorMode !== 'present' || !editorRef.current) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (!editorRef.current) return;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          navNextSlide(editorRef.current, onSlideChange);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          navPrevSlide(editorRef.current, onSlideChange);
        } else if (e.key === 'Home') {
          e.preventDefault();
          showSlide(editorRef.current, 0);
          if (onSlideChange) onSlideChange(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          const slides = editorRef.current.querySelectorAll('[data-node-type="slide"]');
          const lastIndex = slides.length - 1;
          showSlide(editorRef.current, lastIndex);
          if (onSlideChange) onSlideChange(lastIndex);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editorMode, onSlideChange]);

    const editorClassName = `autoartifacts-editor theme-${editorTheme} slide-theme-${slideTheme} mode-${editorMode} ${readOnly ? 'read-only' : ''} ${editorStyles}`.trim();

    return <div ref={editorRef} className={editorClassName} />;
  }
);

SlideEditor.displayName = 'SlideEditor';
