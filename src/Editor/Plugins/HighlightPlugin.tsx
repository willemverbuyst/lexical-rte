import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";
import { useState } from "react";
import Highlight from "../Components/Highlight";

interface Props {
  color?: string;
}

export default function HighlightPlugin({ color = "#f8ff00" }: Props) {
  const [editor] = useLexicalComposerContext();
  const [active, setActive] = useState(false);

  const handleClick = () => {
    const newActiveState = !active;
    setActive(newActiveState);

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          "background-color": newActiveState ? color : "none",
        });
      }
    });
  };

  return <Highlight handleClick={handleClick} />;
}
