export const subscript = {
  excludes: "superscript",
  parseDOM: [{ tag: "sub" }, { style: "vertical-align=sub" }],
  toDOM() {
    return ["sub", 0];
  },
};
