import { Schema } from "prosemirror-model";
import { nodes as basicNodes, marks } from "prosemirror-schema-basic";

// Define our custom nodes
const customNodes = {
  doc: {
    content: "slide+",
  },

  slide: {
    content: "row+",
    parseDOM: [{ tag: "div.slide" }],
    toDOM() {
      return ["div", { class: "slide" }, 0];
    },
  },

  row: {
    content: "column+ | block+",
    parseDOM: [{ tag: "div.row" }],
    toDOM() {
      return ["div", { class: "row" }, 0];
    },
  },

  column: {
    content: "block+",
    parseDOM: [{ tag: "div.column" }],
    toDOM() {
      return ["div", { class: "column" }, 0];
    },
  },
};

// Merge with basic nodes (paragraph, heading, text)
const nodes = {
  ...customNodes,
  paragraph: basicNodes.paragraph,
  heading: basicNodes.heading,
  text: basicNodes.text,
};

// Create the schema
export const schema = new Schema({
  nodes,
  marks,
});
