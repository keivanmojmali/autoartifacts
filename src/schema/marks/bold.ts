export const bold = {
  parseDOM: [
    { tag: "strong" },
    { tag: "b" },
    {
      style: "font-weight",
      getAttrs: (value: string) =>
        /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
    },
  ],
  toDOM() {
    return ["strong", 0];
  },
};
