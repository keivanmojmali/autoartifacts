export const row = {
  content: "column+ | block+",
  parseDOM: [{ tag: "div.row" }],
  toDOM() {
    return ["div", { class: "row" }, 0];
  },
};
