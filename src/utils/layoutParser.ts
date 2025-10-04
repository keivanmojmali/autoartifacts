export function parseLayout(layout: string, columnCount: number): number[] {
  // Empty layout = equal distribution
  if (!layout) {
    return new Array(columnCount).fill(1);
  }

  // Validate format
  if (!/^\d+(-\d+)*$/.test(layout)) {
    console.warn(
      `Invalid layout format '${layout}'. Using equal distribution.`
    );
    return new Array(columnCount).fill(1);
  }

  // Parse ratios
  const ratios = layout.split("-").map(Number);

  // Check column count match
  if (ratios.length !== columnCount) {
    console.warn(
      `Layout '${layout}' expects ${ratios.length} columns but found ${columnCount}. Using equal distribution.`
    );
    return new Array(columnCount).fill(1);
  }

  return ratios;
}

export function applyLayoutToRow(rowElement: HTMLElement, layout: string) {
  const columns = Array.from(rowElement.children) as HTMLElement[];
  const ratios = parseLayout(layout, columns.length);

  columns.forEach((column, index) => {
    column.style.flex = `${ratios[index]} 1 0%`;
  });
}
