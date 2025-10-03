export const column = {
  content: "block+",
  attrs: {
    className: { default: "" },
  },
  parseDOM: [{ tag: "div.column" }],
  toDOM(node: any) {
    const { className } = node.attrs;
    return [
      "div",
      {
        class: `column ${className}`.trim(),
        "data-node-type": "column",
      },
      0,
    ];
  },
};
