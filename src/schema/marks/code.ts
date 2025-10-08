export const code = {
  parseDOM: [{ tag: "code" }],
  toDOM() {
    return ["code", { class: "inline-code" }, 0];
  },
  excludes: "_", // Code excludes all other marks
};
