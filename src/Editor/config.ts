import { DateTimeNode } from "./Nodes/DateTimeNode";

function onError(error: Error) {
  throw new Error(error.message);
}

const theme = {};

const config = {
  namespace: "PlainEditorTest",
  theme,
  onError,
  nodes: [DateTimeNode],
};

export default config;
