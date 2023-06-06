import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import Export from "../Components/Export";

export default function ExportPlugin() {
  const [editor] = useLexicalComposerContext();

  const handleClick = () => {
    editor.update(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      console.log(htmlString);
    });
  };

  return <Export handleClick={handleClick} />;
}
