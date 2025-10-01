export const slide = {
  content: "row+",
  parseDOM: [{ tag: "div.slide" }],
  toDOM() {
    return ["div", { class: "slide" }, 0];
  },
};
