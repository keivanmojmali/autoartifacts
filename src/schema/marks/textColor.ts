export const textColor = {
  attrs: {
    color: { default: "#000000" },
  },
  parseDOM: [
    {
      style: "color",
      getAttrs(value: string) {
        return { color: value };
      },
    },
  ],
  toDOM(mark: any) {
    const { color } = mark.attrs;
    return ["span", { style: `color: ${color}` }, 0];
  },
};
