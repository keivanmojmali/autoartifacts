/**
 * JSON Schema Validation
 *
 * Validates ProseMirror JSON content structure before rendering
 * Prevents crashes from malformed JSON
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validate that a node has required properties
 */
function validateNodeStructure(node: any, path: string = "root"): void {
  if (!node || typeof node !== "object") {
    throw new ValidationError(`${path}: Node must be an object`);
  }

  if (!node.type || typeof node.type !== "string") {
    throw new ValidationError(
      `${path}: Node must have a 'type' string property`
    );
  }
}

/**
 * Validate document structure
 */
function validateDoc(doc: any): void {
  validateNodeStructure(doc, "doc");

  if (doc.type !== "doc") {
    throw new ValidationError(
      `Root node must be type 'doc', got '${doc.type}'`
    );
  }

  if (!Array.isArray(doc.content)) {
    throw new ValidationError("Doc must have content array");
  }

  if (doc.content.length === 0) {
    throw new ValidationError("Doc must have at least one slide");
  }

  // Validate all content nodes are slides
  doc.content.forEach((node: any, index: number) => {
    validateSlide(node, `doc.content[${index}]`);
  });
}

/**
 * Validate slide structure
 */
function validateSlide(slide: any, path: string): void {
  validateNodeStructure(slide, path);

  if (slide.type !== "slide") {
    throw new ValidationError(`${path}: Expected 'slide', got '${slide.type}'`);
  }

  if (!Array.isArray(slide.content)) {
    throw new ValidationError(`${path}: Slide must have content array`);
  }

  if (slide.content.length === 0) {
    throw new ValidationError(`${path}: Slide must have at least one row`);
  }

  // Validate all content nodes are rows
  slide.content.forEach((node: any, index: number) => {
    validateRow(node, `${path}.content[${index}]`);
  });
}

/**
 * Validate row structure
 */
function validateRow(row: any, path: string): void {
  validateNodeStructure(row, path);

  if (row.type !== "row") {
    throw new ValidationError(`${path}: Expected 'row', got '${row.type}'`);
  }

  if (!Array.isArray(row.content)) {
    throw new ValidationError(`${path}: Row must have content array`);
  }

  if (row.content.length === 0) {
    throw new ValidationError(
      `${path}: Row must have at least one column or content block`
    );
  }
}

/**
 * Main validation function
 *
 * @param content - ProseMirror JSON content
 * @throws ValidationError if content is invalid
 * @returns true if valid
 */
export function validateContent(content: any): boolean {
  try {
    validateDoc(content);
    return true;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Validation failed: ${error}`);
  }
}

/**
 * Safe validation that returns result object instead of throwing
 *
 * @param content - ProseMirror JSON content
 * @returns Object with valid flag and optional error
 */
export function safeValidateContent(content: any): {
  valid: boolean;
  error?: string;
} {
  try {
    validateContent(content);
    return { valid: true };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { valid: false, error: error.message };
    }
    return { valid: false, error: "Unknown validation error" };
  }
}
