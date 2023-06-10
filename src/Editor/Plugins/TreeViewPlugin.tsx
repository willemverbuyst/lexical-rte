import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";

interface Props {
  show: boolean;
}

export default function TreeViewPlugin({ show }: Props) {
  const [editor] = useLexicalComposerContext();

  return show ? (
    <div className="debug-panel">
      <TreeView
        viewClassName="tree-view-output"
        timeTravelPanelClassName="debug-timetravel-panel"
        timeTravelButtonClassName="debug-timetravel-button"
        timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
        timeTravelPanelButtonClassName="debug-timetravel-panel-button"
        treeTypeButtonClassName="debug-tree-button"
        editor={editor}
      />
    </div>
  ) : null;
}
