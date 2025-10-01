import { nodes as basicNodes } from "prosemirror-schema-basic";
import { slide } from "./slide";
import { row } from "./row";
import { column } from "./column";

export const nodes = {
  doc: {
    content: "slide+",
  },
  slide,
  row,
  column,
  paragraph: basicNodes.paragraph,
  heading: basicNodes.heading,
  text: basicNodes.text,
};
