import { $getRoot, $getSelection, EditorState } from "lexical";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useState } from "react";
import Debug from "./Components/Debug";
import Placeholder from "./Components/Placeholder";
import config from "./config";
import AutoFocusPlugin from "./Plugins/AutoFocusPlugin";
import CodeHighlightPlugin from "./Plugins/CodeHighlightPlugin";
import DateTimePlugin from "./Plugins/DateTimePlugin";
import HighlightPlugin from "./Plugins/HighlightPlugin";
import PrintPlugin from "./Plugins/PrintPlugin";
import ToolbarPlugin from "./Plugins/ToolbarPlugin";
import TreeViewPlugin from "./Plugins/TreeViewPlugin";

function onChange(editorState: EditorState) {
  editorState.read(() => {
    const root = $getRoot();
    const selection = $getSelection();

    // eslint-disable-next-line no-console
    // console.log(root, selection);
  });
}

function Editor() {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <div className="editor-container">
      <LexicalComposer initialConfig={config}>
        <ToolbarPlugin />
        <div className="sidebar">
          <DateTimePlugin />
          <HighlightPlugin />
          <PrintPlugin />
          <Debug handleClick={setShowDebugPanel} show={showDebugPanel} />
        </div>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <AutoFocusPlugin />
        <CodeHighlightPlugin />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <ListPlugin />
        <TreeViewPlugin show={showDebugPanel} />
      </LexicalComposer>
    </div>
  );
}

export default Editor;
