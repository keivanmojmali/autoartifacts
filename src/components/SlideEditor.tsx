import React, { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "../schema"; // Updated path

interface SlideEditorProps {
  content: any; // ProseMirror JSON
  onChange?: (json: any) => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  content,
  onChange,
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

    // Cleanup
    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editorRef} />;
};
