export const row = {
  content: "column+ | block+",
  attrs: {
    className: { default: "" },
  },
  parseDOM: [{ tag: "div.row" }],
  toDOM(node: any) {
    const { className } = node.attrs;
    return [
      "div",
      {
        class: `row ${className}`.trim(),
        "data-node-type": "row",
      },
      0,
    ];
  },
};
