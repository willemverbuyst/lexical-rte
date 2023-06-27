import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { DateTimeNode } from "../Nodes/DateTimeNode";
import theme from "../Theme";

function onError(error: Error) {
  throw new Error(error.message);
}

const config = {
  namespace: "PlainEditorTest",
  theme,
  onError,
  nodes: [
    DateTimeNode,
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    LinkNode,
  ],
};

export default config;
