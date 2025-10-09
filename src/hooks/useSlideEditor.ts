/**
 * useSlideEditor Hook
 * 
 * Modern React hook for managing SlideEditor instances.
 * Provides reactive state and lifecycle callbacks.
 */

import { useRef, useEffect, useState } from 'react';
import { SlideEditorRef, UseSlideEditorOptions, UseSlideEditorReturn } from '../types';

/**
 * Hook for managing SlideEditor instance
 * 
 * @example
 * const { ref, editor, currentSlide, totalSlides } = useSlideEditor({
 *   content: myContent,
 *   editable: true,
 *   onUpdate: (content) => console.log('Updated:', content)
 * });
 * 
 * return <SlideEditor ref={ref} content={content} />;
 */
export function useSlideEditor(options: UseSlideEditorOptions): UseSlideEditorReturn {
  const ref = useRef<SlideEditorRef>(null);
  const [editor, setEditor] = useState<SlideEditorRef | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  
  // Store callbacks in refs to avoid dependency issues
  const onCreateRef = useRef(options.onCreate);
  const onDestroyRef = useRef(options.onDestroy);
  
  useEffect(() => {
    onCreateRef.current = options.onCreate;
    onDestroyRef.current = options.onDestroy;
  }, [options.onCreate, options.onDestroy]);

  // Helper to update all state
  const updateState = () => {
    if (ref.current) {
      setIsEmpty(ref.current.isEmpty());
      setIsFocused(ref.current.isFocused());
      setCurrentSlide(ref.current.getCurrentSlide());
      setTotalSlides(ref.current.getTotalSlides());
    }
  };

  // Update state when editor is initialized
  useEffect(() => {
    // Small delay to ensure editor is fully initialized
    const timer = setTimeout(() => {
      if (ref.current) {
        setEditor(ref.current);
        
        if (onCreateRef.current) {
          onCreateRef.current(ref.current);
        }
        
        // Update initial state
        updateState();
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (onDestroyRef.current) {
        onDestroyRef.current();
      }
    };
  }, []);

  // Update state when content changes
  useEffect(() => {
    updateState();
  }, [options.content]);

  return {
    ref,
    editor,
    isEmpty,
    isFocused,
    currentSlide,
    totalSlides
  };
}

