export const italic = {
  parseDOM: [{ tag: "em" }, { tag: "i" }, { style: "font-style=italic" }],
  toDOM() {
    return ["em", 0];
  },
};
