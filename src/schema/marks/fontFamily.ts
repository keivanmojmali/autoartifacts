export const fontFamily = {
  attrs: {
    family: { default: "sans-serif" }, // 'sans-serif' | 'serif' | 'monospace' | custom
  },
  parseDOM: [
    {
      style: "font-family",
      getAttrs(value: string) {
        return { family: value };
      },
    },
  ],
  toDOM(mark: any) {
    const { family } = mark.attrs;
    return ["span", { style: `font-family: ${family}` }, 0];
  },
};
