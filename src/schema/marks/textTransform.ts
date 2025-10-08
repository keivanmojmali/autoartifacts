export const textTransform = {
  attrs: {
    transform: { default: "none" }, // 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  },
  parseDOM: [
    {
      style: "text-transform",
      getAttrs(value: string) {
        return { transform: value };
      },
    },
  ],
  toDOM(mark: any) {
    const { transform } = mark.attrs;
    return ["span", { style: `text-transform: ${transform}` }, 0];
  },
};
