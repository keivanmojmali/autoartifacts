/**
 * Control Mode Utilities
 * 
 * Helper functions for detecting and validating controlled vs uncontrolled mode
 */

import type { SlideEditorProps } from '../types';

/**
 * Determine if editor is in controlled mode
 * 
 * @param props - SlideEditor props
 * @returns true if content prop is defined (controlled mode)
 */
export function isControlledMode(props: SlideEditorProps): boolean {
  return props.content !== undefined;
}

/**
 * Determine if editor is in uncontrolled mode
 * 
 * @param props - SlideEditor props
 * @returns true if defaultContent is defined and content is not (uncontrolled mode)
 */
export function isUncontrolledMode(props: SlideEditorProps): boolean {
  return props.defaultContent !== undefined && props.content === undefined;
}

/**
 * Validate control mode props
 * Returns warnings if props are misconfigured
 * 
 * @param props - SlideEditor props
 * @returns Array of warning messages (empty if no issues)
 */
export function validateControlMode(props: SlideEditorProps): string[] {
  const warnings: string[] = [];
  
  // Warn if both content and defaultContent are provided
  if (props.content !== undefined && props.defaultContent !== undefined) {
    warnings.push(
      'Both "content" and "defaultContent" props provided. ' +
      '"content" will take precedence. ' +
      'Use either controlled (content + onChange) or uncontrolled (defaultContent) mode.'
    );
  }
  
  // Warn if controlled mode without onChange
  if (props.content !== undefined && !props.onChange) {
    warnings.push(
      'Editor is in controlled mode (has "content" prop) but no "onChange" handler provided. ' +
      'Content updates will not work properly.'
    );
  }
  
  // Warn if neither content nor defaultContent
  if (props.content === undefined && props.defaultContent === undefined) {
    warnings.push(
      'Neither "content" nor "defaultContent" provided. ' +
      'Editor will start with an empty document.'
    );
  }
  
  return warnings;
}

