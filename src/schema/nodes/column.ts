export const column = {
  content: "block+",
  parseDOM: [{ tag: "div.column" }],
  toDOM() {
    return ["div", { class: "column" }, 0];
  },
};
