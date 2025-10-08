export const superscript = {
  excludes: "subscript", // Can't be both superscript and subscript
  parseDOM: [{ tag: "sup" }, { style: "vertical-align=super" }],
  toDOM() {
    return ["sup", 0];
  },
};
