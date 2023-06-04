import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";
import { useCallback } from "react";
import Highlight from "../Components/Highlight";

interface Props {
  color: string;
}

export default function HighlightPlugin({ color }: Props) {
  const [editor] = useLexicalComposerContext();

  const handleClick = useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [editor]
  );

  return (
    <Highlight
      color={color}
      handleClick={() => handleClick({ "background-color": color })}
    />
  );
}
