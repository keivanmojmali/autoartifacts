export const bulletList = {
  attrs: {
    className: { default: "" },
  },
  group: "block",
  content: "listItem+", // must contain list items
  parseDOM: [
    {
      tag: "ul",
      getAttrs: (dom: HTMLElement) => ({
        className: dom.className || "",
      }),
    },
  ],
  toDOM(node: any) {
    const { className } = node.attrs;
    return [
      "ul",
      {
        class: `bullet-list ${className}`.trim(),
        "data-node-type": "bullet-list",
      },
      0,
    ];
  },
};
