export const listItem = {
  attrs: {
    className: { default: "" },
  },
  content: "paragraph block*", // can contain paragraph and other blocks
  defining: true,
  parseDOM: [
    {
      tag: "li",
      getAttrs: (dom: HTMLElement) => ({
        className: dom.className || "",
      }),
    },
  ],
  toDOM(node: any) {
    const { className } = node.attrs;
    return [
      "li",
      {
        class: `list-item ${className}`.trim(),
        "data-node-type": "list-item",
      },
      0,
    ];
  },
};
