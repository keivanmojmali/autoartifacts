export const strikethrough = {
  parseDOM: [
    { tag: "s" },
    { tag: "del" },
    { style: "text-decoration=line-through" },
  ],
  toDOM() {
    return ["s", 0];
  },
};
