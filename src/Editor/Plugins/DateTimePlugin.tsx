import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $insertNodes, TextNode } from "lexical";
import DateTime from "../Editor/Components/DateTime";
import { DateTimeNode } from "../Editor/Nodes/DateTimeNode";

interface Props {
  date: Date;
}

export default function DateTimePlugin({ date = new Date() }: Props) {
  const [editor] = useLexicalComposerContext();

  const handleClick = () => {
    editor.update(() => {
      const node = new DateTimeNode(date.toLocaleString());
      const nodes = [node, new TextNode(" ")];

      const selection = $getSelection();
      if (selection?.getTextContent()) {
        selection.insertNodes(nodes);
      } else {
        $insertNodes(nodes);
      }
    });
  };

  return <DateTime handleClick={handleClick} />;
}