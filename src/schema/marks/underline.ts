export const underline = {
  parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
  toDOM() {
    return ["u", 0];
  },
};
