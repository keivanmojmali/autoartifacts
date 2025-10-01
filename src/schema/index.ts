import { Schema } from "prosemirror-model";
import { marks } from "prosemirror-schema-basic";
import { nodes } from "./nodes";

export const schema = new Schema({
  nodes,
  marks,
});
